#!/usr/bin/env node
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const ALLOWED_ORIGINS = new Set([
  'https://millsy102.github.io', // GitHub Pages
  'http://localhost:3000',        // Local development
  'http://127.0.0.1:3000',        // Local development
]);

// In-memory state
const PORT = 31245;
let paired = false;
const PAIR_CODE = ('' + Math.floor(100000 + Math.random() * 900000)); // 6-digit
const CAPABILITIES = new Set(); // granted caps, e.g. 'unreal', 'fs'

function verifyOrigin(origin) {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    return ALLOWED_ORIGINS.has(`${u.protocol}//${u.host}`);
  } catch { 
    return false; 
  }
}

// TODO: replace with your real verification (e.g., Supabase JWT verify via public JWK)
function verifyWebToken(token) {
  return typeof token === 'string' && token.length > 20;
}

// Unreal Engine integration functions
async function findUnrealEngine() {
  const possiblePaths = [
    'C:\\Program Files\\Epic Games\\UE_5.3\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
    'C:\\Program Files\\Epic Games\\UE_5.2\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
    'C:\\Program Files\\Epic Games\\UE_5.1\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
    'C:\\Program Files\\Epic Games\\UE_5.0\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
  ];
  
  for (const uePath of possiblePaths) {
    try {
      const fs = require('fs');
      if (fs.existsSync(uePath)) {
        return uePath;
      }
    } catch (error) {
      console.warn(`Failed to check path ${uePath}:`, error.message);
    }
  }
  
  return null;
}

async function openUnrealProject(projectPath) {
  try {
    const uePath = await findUnrealEngine();
    if (!uePath) {
      throw new Error('Unreal Engine not found. Please install Unreal Engine 5.x');
    }
    
    const fs = require('fs');
    if (!fs.existsSync(projectPath)) {
      throw new Error(`Project file not found: ${projectPath}`);
    }
    
    console.log(`Launching Unreal Editor with project: ${projectPath}`);
    
    const child = spawn(uePath, [projectPath], {
      detached: true,
      stdio: 'ignore'
    });
    
    child.unref();
    
    return { success: true, message: 'Unreal Editor launched successfully' };
  } catch (error) {
    console.error('Failed to launch Unreal Editor:', error);
    throw error;
  }
}

async function buildPlugin(pluginPath, configuration = 'Development') {
  try {
    const fs = require('fs');
    if (!fs.existsSync(pluginPath)) {
      throw new Error(`Plugin path not found: ${pluginPath}`);
    }
    
    // Find UBT (Unreal Build Tool)
    const uePath = await findUnrealEngine();
    if (!uePath) {
      throw new Error('Unreal Engine not found');
    }
    
    const ubtPath = path.join(path.dirname(uePath), '..', '..', 'Binaries', 'DotNET', 'UnrealBuildTool.exe');
    
    if (!fs.existsSync(ubtPath)) {
      throw new Error('Unreal Build Tool not found');
    }
    
    console.log(`Building plugin: ${pluginPath} with configuration: ${configuration}`);
    
    const child = spawn(ubtPath, [
      'UnrealEditor',
      'Win64',
      configuration,
      pluginPath,
      '-Project=' + path.dirname(pluginPath)
    ], {
      stdio: 'pipe'
    });
    
    return new Promise((resolve, reject) => {
      let output = '';
      
      child.stdout.on('data', (data) => {
        output += data.toString();
        console.log('UBT:', data.toString());
      });
      
      child.stderr.on('data', (data) => {
        output += data.toString();
        console.error('UBT Error:', data.toString());
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, message: 'Plugin built successfully', output });
        } else {
          reject(new Error(`Build failed with code ${code}: ${output}`));
        }
      });
    });
  } catch (error) {
    console.error('Failed to build plugin:', error);
    throw error;
  }
}

// HTTP server for health checks and pairing
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/health') {
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({ 
      ok: true, 
      paired, 
      port: PORT,
      capabilities: [...CAPABILITIES],
      version: '1.0.0'
    }));
    return;
  }
  
  if (req.url === '/pair-code') {
    res.writeHead(200, {'content-type':'application/json'});
    res.end(JSON.stringify({ code: PAIR_CODE, paired }));
    return;
  }
  
  res.writeHead(404);
  res.end();
});

// WebSocket server for real-time communication
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  ws.isAuthed = false;

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      
      if (msg.type === 'hello') {
        // Expect { type:'hello', token:'...', origin:'...', pairCode:'...' }
        if (!verifyOrigin(msg.origin)) {
          return ws.close(4001, 'bad origin');
        }
        if (!verifyWebToken(msg.token)) {
          return ws.close(4002, 'bad token');
        }

        if (!paired) {
          if (msg.pairCode !== PAIR_CODE) {
            return ws.close(4003, 'pair code mismatch');
          }
          paired = true;
          console.log('[AGENT] Paired OK.');
        }

        ws.isAuthed = true;
        ws.send(JSON.stringify({ 
          type: 'hello_ok', 
          caps: [...CAPABILITIES],
          version: '1.0.0'
        }));
        return;
      }

      if (!ws.isAuthed) {
        return ws.close(4401, 'unauthorized');
      }

      if (msg.type === 'request_cap') {
        // { type:'request_cap', cap:'unreal', id:'...' }
        const cap = msg.cap;
        console.log(`[AGENT] Requesting capability: ${cap}`);
        
        // TODO: show a native prompt or console Y/N here
        // For now, auto-grant common capabilities
        const autoGrantCaps = ['unreal', 'fs', 'process'];
        if (autoGrantCaps.includes(cap)) {
          CAPABILITIES.add(cap);
          ws.send(JSON.stringify({ type: 'cap_ok', id: msg.id, cap: msg.cap }));
        } else {
          ws.send(JSON.stringify({ type: 'cap_denied', id: msg.id, cap: msg.cap, reason: 'capability_not_supported' }));
        }
        return;
      }

      if (msg.type === 'command') {
        // Example switch — wire in *real* actions here
        const { name, id, args } = msg;
        
        try {
          console.log(`[AGENT] Executing command: ${name}`, args);
          
          if (name === 'ue.open_project') {
            const result = await openUnrealProject(args.path);
            return ws.send(JSON.stringify({ type: 'response', id, ok: true, result }));
          }
          
          if (name === 'ue.build_plugin') {
            const result = await buildPlugin(args.path, args.configuration);
            return ws.send(JSON.stringify({ type: 'response', id, ok: true, result }));
          }
          
          if (name === 'ue.get_version') {
            const uePath = await findUnrealEngine();
            if (uePath) {
              const version = path.basename(path.dirname(path.dirname(path.dirname(uePath))));
              return ws.send(JSON.stringify({ type: 'response', id, ok: true, result: version }));
            } else {
              return ws.send(JSON.stringify({ type: 'response', id, ok: false, error: 'unreal_engine_not_found' }));
            }
          }
          
          if (name === 'ue.list_projects') {
            const fs = require('fs');
            const projectsDir = path.join(process.env.USERPROFILE || process.env.HOME, 'Documents', 'Unreal Projects');
            
            try {
              if (fs.existsSync(projectsDir)) {
                const projects = fs.readdirSync(projectsDir, { withFileTypes: true })
                  .filter(dirent => dirent.isDirectory())
                  .map(dirent => dirent.name);
                return ws.send(JSON.stringify({ type: 'response', id, ok: true, result: projects }));
              } else {
                return ws.send(JSON.stringify({ type: 'response', id, ok: true, result: [] }));
              }
            } catch (error) {
              return ws.send(JSON.stringify({ type: 'response', id, ok: false, error: error.message }));
            }
          }
          
          if (name === 'fs.read') {
            const fs = require('fs');
            const content = fs.readFileSync(args.path, 'utf8');
            return ws.send(JSON.stringify({ type: 'response', id, ok: true, result: content }));
          }
          
          if (name === 'fs.write') {
            const fs = require('fs');
            fs.writeFileSync(args.path, args.content);
            return ws.send(JSON.stringify({ type: 'response', id, ok: true, result: 'file_written' }));
          }
          
          if (name === 'fs.list') {
            const fs = require('fs');
            const items = fs.readdirSync(args.path, { withFileTypes: true })
              .map(dirent => ({
                name: dirent.name,
                isDirectory: dirent.isDirectory(),
                isFile: dirent.isFile()
              }));
            return ws.send(JSON.stringify({ type: 'response', id, ok: true, result: items }));
          }
          
          if (name === 'process.execute') {
            const child = spawn(args.command, args.args || [], {
              stdio: 'pipe'
            });
            
            let output = '';
            let errorOutput = '';
            
            child.stdout.on('data', (data) => {
              output += data.toString();
            });
            
            child.stderr.on('data', (data) => {
              errorOutput += data.toString();
            });
            
            child.on('close', (code) => {
              ws.send(JSON.stringify({ 
                type: 'response', 
                id, 
                ok: code === 0, 
                result: { output, error: errorOutput, code }
              }));
            });
            
            return;
          }

          // Default: unknown command
          ws.send(JSON.stringify({ type: 'response', id, ok: false, error: 'unknown_command' }));
        } catch (e) {
          console.error(`[AGENT] Command ${name} failed:`, e);
          ws.send(JSON.stringify({ type: 'response', id, ok: false, error: e.message }));
        }
      }
    } catch (e) {
      console.error('[AGENT] Message parsing failed:', e);
      ws.close(1011, 'bad json');
    }
  });
  
  ws.on('close', () => {
    console.log('[AGENT] Client disconnected');
  });
});

// Handle WebSocket upgrade
server.on('upgrade', (req, socket, head) => {
  const { url, headers } = req;
  const origin = headers.origin || '';
  
  if (url !== '/ws' || !verifyOrigin(origin)) {
    socket.destroy();
    return;
  }
  
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`[AGENT] Desktop agent listening on http://127.0.0.1:${PORT}`);
  console.log(`[AGENT] Pairing code: ${PAIR_CODE}`);
  console.log(`[AGENT] Allowed origins: ${[...ALLOWED_ORIGINS].join(', ')}`);
  console.log(`[AGENT] Ready for BeamFlow integration`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[AGENT] Shutting down...');
  server.close(() => {
    console.log('[AGENT] Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n[AGENT] Shutting down...');
  server.close(() => {
    console.log('[AGENT] Server closed');
    process.exit(0);
  });
});
