// Desktop Agent Client for BeamFlow
// Handles communication with local desktop agent for Unreal Engine integration

export async function connectDesktopAgent() {
  // 1) fetch session token (post-login)
  const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error('Not authenticated');

  const token = data.session.access_token;

  // 2) detect agent
  const port = 31245; // Default port for desktop agent
  let healthOk = false;
  try {
    const r = await fetch(`http://127.0.0.1:${port}/health`, { 
      mode: 'cors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    healthOk = r.ok;
  } catch (error) {
    console.warn('Desktop agent health check failed:', error);
  }

  if (!healthOk) {
    return { ok: false, reason: 'agent_not_found' };
  }

  // 3) first-time pairing
  let pairCode = null;
  try {
    const pair = await fetch(`http://127.0.0.1:${port}/pair-code`).then(r => r.json());
    if (!pair.paired) {
      pairCode = window.prompt('Enter pairing code shown in Desktop Agent:', pair.code || '');
      if (!pairCode) {
        return { ok: false, reason: 'pairing_cancelled' };
      }
    }
  } catch (error) {
    console.error('Failed to get pairing code:', error);
    return { ok: false, reason: 'pairing_failed' };
  }

  // 4) open websocket
  const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`);
  
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('WebSocket connection timeout'));
    }, 5000);

    ws.onopen = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    ws.onerror = (error) => {
      clearTimeout(timeout);
      reject(new Error('WebSocket connect failed'));
    };
  });

  // 5) hello (origin + token + pairCode)
  ws.send(JSON.stringify({
    type: 'hello',
    origin: location.origin,
    token,
    pairCode
  }));

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('hello timeout'));
    }, 4000);
    
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'hello_ok') {
          clearTimeout(timeout);
          resolve();
        }
      } catch (error) {
        console.error('Failed to parse hello response:', error);
      }
    };
  });

  function sendCommand(name, args = {}) {
    const id = crypto.randomUUID?.() || String(Date.now());
    ws.send(JSON.stringify({ type: 'command', id, name, args }));
    
    return new Promise((resolve, reject) => {
      const onMsg = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'response' && m.id === id) {
            ws.removeEventListener('message', onMsg);
            m.ok ? resolve(m.result ?? true) : reject(new Error(m.error || 'command_failed'));
          }
        } catch (error) {
          console.error('Failed to parse command response:', error);
        }
      };
      
      ws.addEventListener('message', onMsg);
      
      setTimeout(() => {
        ws.removeEventListener('message', onMsg);
        reject(new Error('command_timeout'));
      }, 120000); // 2 minute timeout
    });
  }

  function requestCapability(cap) {
    const id = crypto.randomUUID?.() || String(Date.now());
    ws.send(JSON.stringify({ type: 'request_cap', id, cap }));
    
    return new Promise((resolve, reject) => {
      const onMsg = (ev) => {
        try {
          const m = JSON.parse(ev.data);
          if (m.type === 'cap_ok' && m.id === id) {
            ws.removeEventListener('message', onMsg);
            resolve(true);
          }
        } catch (error) {
          console.error('Failed to parse capability response:', error);
        }
      };
      
      ws.addEventListener('message', onMsg);
      
      setTimeout(() => {
        ws.removeEventListener('message', onMsg);
        reject(new Error('capability_timeout'));
      }, 20000); // 20 second timeout
    });
  }

  return {
    ok: true,
    ws,
    sendCommand,
    requestCapability,
    
    // Convenience methods for common Unreal Engine operations
    async openUnrealProject(projectPath) {
      return this.sendCommand('ue.open_project', { path: projectPath });
    },
    
    async buildPlugin(pluginPath, configuration = 'Development') {
      return this.sendCommand('ue.build_plugin', { 
        path: pluginPath, 
        configuration 
      });
    },
    
    async launchUnrealEditor(projectPath) {
      return this.sendCommand('ue.launch_editor', { path: projectPath });
    },
    
    async getUnrealVersion() {
      return this.sendCommand('ue.get_version');
    },
    
    async listProjects() {
      return this.sendCommand('ue.list_projects');
    },
    
    async readFile(filePath) {
      return this.sendCommand('fs.read', { path: filePath });
    },
    
    async writeFile(filePath, content) {
      return this.sendCommand('fs.write', { path: filePath, content });
    },
    
    async listDirectory(dirPath) {
      return this.sendCommand('fs.list', { path: dirPath });
    },
    
    async executeCommand(command, args = []) {
      return this.sendCommand('process.execute', { command, args });
    }
  };
}

// Global agent instance
let globalAgent = null;

// Initialize and expose the agent globally
export async function initializeDesktopAgent() {
  try {
    const agent = await connectDesktopAgent();
    if (agent.ok) {
      globalAgent = agent;
      window.DesktopAgent = agent;
      console.log('Desktop agent connected successfully');
      return agent;
    } else {
      console.warn('Desktop agent not found:', agent.reason);
      return null;
    }
  } catch (error) {
    console.error('Failed to connect to desktop agent:', error);
    return null;
  }
}

// Get the global agent instance
export function getDesktopAgent() {
  return globalAgent;
}

// Disconnect the agent
export function disconnectDesktopAgent() {
  if (globalAgent && globalAgent.ws) {
    globalAgent.ws.close();
    globalAgent = null;
    window.DesktopAgent = null;
  }
}
