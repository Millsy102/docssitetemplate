const { Server } = require('ssh2');
const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const BeamAuth = require('./middleware/BeamAuth');
const BeamErrorHandler = require('./utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('./utils/BeamPerformanceMonitor');

class BeamSshServer {
    constructor() {
        this.sshServer = null;
        this.port = process.env.SSH_PORT || 22;
        this.hostKeyPath = process.env.SSH_HOST_KEY_PATH || path.join(__dirname, '../keys/host_key');
        this.ensureHostKey();
    }

    async ensureHostKey() {
        const keyDir = path.dirname(this.hostKeyPath);
        if (!fs.existsSync(keyDir)) {
            fs.mkdirpSync(keyDir);
        }
        
        if (!fs.existsSync(this.hostKeyPath)) {
            // Generate a new host key if it doesn't exist
            const { execSync } = require('child_process');
            try {
                execSync(`ssh-keygen -t rsa -b 4096 -f "${this.hostKeyPath}" -N ""`, { stdio: 'inherit' });
                console.log('Generated new SSH host key');
            } catch (error) {
                console.error('Failed to generate SSH host key:', error);
                // Create a fallback key
                fs.writeFileSync(this.hostKeyPath, '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA...\n-----END RSA PRIVATE KEY-----');
            }
        }
    }

    async start() {
        try {
            this.sshServer = new Server({
                hostKeys: [fs.readFileSync(this.hostKeyPath)],
                banner: 'Welcome to BeamFlow SSH Server\nSecure shell access system\n'
            });

            // Authentication handler
            this.sshServer.on('connection', (client, info) => {
                console.log(`SSH Client connected: ${info.ip}`);
                BeamPerformanceMonitor.recordSshConnection(info.ip);

                client.on('authentication', async (ctx) => {
                    try {
                        if (ctx.method === 'password') {
                            const user = await BeamAuth.authenticateUser(ctx.username, ctx.password);
                            
                            if (user && (user.role === 'admin' || user.role === 'user')) {
                                ctx.accept();
                                client.user = user;
                                client.userHome = path.join(__dirname, '../ssh-home', user.username);
                                
                                // Ensure user home directory exists
                                if (!fs.existsSync(client.userHome)) {
                                    fs.mkdirpSync(client.userHome);
                                }
                                
                                console.log(`SSH Authentication successful: ${user.username}`);
                                BeamPerformanceMonitor.recordSshLogin(user.username);
                            } else {
                                ctx.reject(['password'], false);
                                BeamErrorHandler.logError('SSH Authentication Failed', new Error('Invalid credentials'), {
                                    username: ctx.username,
                                    ip: info.ip
                                });
                            }
                        } else if (ctx.method === 'publickey') {
                            // Public key authentication (for future enhancement)
                            ctx.reject(['password'], false);
                        } else {
                            ctx.reject(['password'], false);
                        }
                    } catch (error) {
                        BeamErrorHandler.logError('SSH Authentication Error', error);
                        ctx.reject(['password'], false);
                    }
                });

                client.on('ready', () => {
                    console.log(`SSH Client authenticated: ${client.user.username}`);
                    
                    client.on('session', (accept, reject) => {
                        const session = accept();
                        
                        session.on('shell', (accept, reject) => {
                            const stream = accept();
                            this.handleShell(stream, client);
                        });

                        session.on('exec', (accept, reject, info) => {
                            const stream = accept();
                            this.handleExec(stream, info.command, client);
                        });

                        session.on('sftp', (accept, reject) => {
                            const sftp = accept();
                            this.handleSftp(sftp, client);
                        });
                    });
                });

                client.on('error', (err) => {
                    BeamErrorHandler.logError('SSH Client Error', err, {
                        user: client.user?.username,
                        ip: info.ip
                    });
                });

                client.on('close', () => {
                    console.log(`SSH Client disconnected: ${client.user?.username || 'unknown'}`);
                    BeamPerformanceMonitor.recordSshDisconnection(client.user?.username);
                });
            });

            this.sshServer.listen(this.port, '0.0.0.0', () => {
                console.log(` BeamFlow SSH Server running on port ${this.port}`);
                BeamPerformanceMonitor.recordSshStartup();
            });

        } catch (error) {
            BeamErrorHandler.logError('SSH Server Startup Error', error);
            throw error;
        }
    }

    handleShell(stream, client) {
        const user = client.user;
        const homeDir = client.userHome;
        
        // Set up environment
        const env = {
            ...process.env,
            USER: user.username,
            HOME: homeDir,
            PWD: homeDir,
            SHELL: '/bin/bash',
            TERM: 'xterm-256color'
        };

        // Start shell process
        const shell = spawn('/bin/bash', ['-i'], {
            cwd: homeDir,
            env: env,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        // Handle shell I/O
        stream.pipe(shell.stdin);
        shell.stdout.pipe(stream);
        shell.stderr.pipe(stream);

        // Handle shell exit
        shell.on('exit', (code) => {
            stream.end();
        });

        // Handle stream close
        stream.on('close', () => {
            shell.kill();
        });

        // Log shell session
        BeamPerformanceMonitor.recordSshShellSession(user.username);
    }

    handleExec(stream, command, client) {
        const user = client.user;
        const homeDir = client.userHome;
        
        // Security: restrict commands for non-admin users
        if (user.role !== 'admin') {
            const allowedCommands = ['ls', 'pwd', 'whoami', 'date', 'uptime'];
            const cmd = command.split(' ')[0];
            
            if (!allowedCommands.includes(cmd)) {
                stream.write(`Command '${cmd}' not allowed for user '${user.username}'\n`);
                stream.exit(1);
                return;
            }
        }

        const env = {
            ...process.env,
            USER: user.username,
            HOME: homeDir,
            PWD: homeDir
        };

        const exec = spawn('/bin/bash', ['-c', command], {
            cwd: homeDir,
            env: env,
            stdio: ['pipe', 'pipe', 'pipe']
        });

        exec.stdout.pipe(stream);
        exec.stderr.pipe(stream);

        exec.on('exit', (code) => {
            stream.exit(code);
        });

        // Log command execution
        BeamPerformanceMonitor.recordSshCommand(user.username, command);
    }

    handleSftp(sftp, client) {
        const user = client.user;
        const homeDir = client.userHome;

        sftp.on('READ', (reqid, handle) => {
            const filePath = path.join(homeDir, handle.toString());
            
            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err) {
                    sftp.status(reqid, 2); // SSH_FX_NO_SUCH_FILE
                    return;
                }
                
                const stream = fs.createReadStream(filePath);
                sftp.handle(reqid, stream);
            });
        });

        sftp.on('WRITE', (reqid, handle, offset, data) => {
            const filePath = path.join(homeDir, handle.toString());
            
            fs.appendFileSync(filePath, data);
            sftp.status(reqid, 0); // SSH_FX_OK
        });

        sftp.on('OPENDIR', (reqid, path) => {
            const dirPath = path.join(homeDir, path);
            
            fs.readdir(dirPath, (err, files) => {
                if (err) {
                    sftp.status(reqid, 2); // SSH_FX_NO_SUCH_FILE
                    return;
                }
                
                sftp.handle(reqid, files);
            });
        });

        sftp.on('READDIR', (reqid, handle) => {
            // Implementation for reading directory contents
            sftp.status(reqid, 0);
        });

        sftp.on('STAT', (reqid, path) => {
            const filePath = path.join(homeDir, path);
            
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    sftp.status(reqid, 2);
                    return;
                }
                
                sftp.attrs(reqid, {
                    size: stats.size,
                    uid: stats.uid,
                    gid: stats.gid,
                    mode: stats.mode,
                    atime: stats.atime.getTime() / 1000,
                    mtime: stats.mtime.getTime() / 1000
                });
            });
        });

        // Log SFTP session
        BeamPerformanceMonitor.recordSshSftpSession(user.username);
    }

    async stop() {
        if (this.sshServer) {
            this.sshServer.close();
            console.log('SSH Server stopped');
        }
    }

    getStats() {
        return {
            port: this.port,
            hostKeyPath: this.hostKeyPath,
            isRunning: !!this.sshServer,
            connections: this.sshServer ? this.sshServer.connections.length : 0
        };
    }
}

// Export singleton instance
module.exports = new BeamSshServer();

// Start server if this file is run directly
if (require.main === module) {
    const sshServer = require('./ssh-server');
    sshServer.start().catch(console.error);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down SSH server...');
        await sshServer.stop();
        process.exit(0);
    });
}
