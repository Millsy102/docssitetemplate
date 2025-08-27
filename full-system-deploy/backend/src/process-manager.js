const { spawn, exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const ftpServer = require('./ftp-server');
const sshServer = require('./ssh-server');

class BeamProcessManager {
    constructor() {
        this.processes = new Map();
        this.pidFile = path.join(__dirname, '../temp/processes.json');
        this.ensureTempDirectory();
    }

    ensureTempDirectory() {
        const tempDir = path.dirname(this.pidFile);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirpSync(tempDir);
        }
    }

    async startFtp() {
        try {
            console.log('Starting FTP server...');
            await ftpServer.start();
            
            // Save process info
            this.processes.set('ftp', {
                type: 'ftp',
                pid: process.pid,
                port: ftpServer.port,
                started: new Date().toISOString(),
                status: 'running'
            });
            
            this.saveProcessInfo();
            console.log(` FTP server started on port ${ftpServer.port}`);
            return true;
        } catch (error) {
            console.error(' Failed to start FTP server:', error.message);
            return false;
        }
    }

    async stopFtp() {
        try {
            console.log('Stopping FTP server...');
            await ftpServer.stop();
            
            this.processes.delete('ftp');
            this.saveProcessInfo();
            console.log(' FTP server stopped');
            return true;
        } catch (error) {
            console.error(' Failed to stop FTP server:', error.message);
            return false;
        }
    }

    async startSsh() {
        try {
            console.log('Starting SSH server...');
            await sshServer.start();
            
            // Save process info
            this.processes.set('ssh', {
                type: 'ssh',
                pid: process.pid,
                port: sshServer.port,
                started: new Date().toISOString(),
                status: 'running'
            });
            
            this.saveProcessInfo();
            console.log(` SSH server started on port ${sshServer.port}`);
            return true;
        } catch (error) {
            console.error(' Failed to start SSH server:', error.message);
            return false;
        }
    }

    async stopSsh() {
        try {
            console.log('Stopping SSH server...');
            await sshServer.stop();
            
            this.processes.delete('ssh');
            this.saveProcessInfo();
            console.log(' SSH server stopped');
            return true;
        } catch (error) {
            console.error(' Failed to stop SSH server:', error.message);
            return false;
        }
    }

    async startAll() {
        console.log('Starting all servers...');
        const results = await Promise.allSettled([
            this.startFtp(),
            this.startSsh()
        ]);
        
        const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const total = results.length;
        
        console.log(` Started ${success}/${total} servers successfully`);
        return success === total;
    }

    async stopAll() {
        console.log('Stopping all servers...');
        const results = await Promise.allSettled([
            this.stopFtp(),
            this.stopSsh()
        ]);
        
        const success = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const total = results.length;
        
        console.log(` Stopped ${success}/${total} servers successfully`);
        return success === total;
    }

    getStatus() {
        const status = {
            ftp: {
                running: this.processes.has('ftp'),
                port: ftpServer.port,
                stats: ftpServer.getStats()
            },
            ssh: {
                running: this.processes.has('ssh'),
                port: sshServer.port,
                stats: sshServer.getStats()
            },
            processes: Array.from(this.processes.values())
        };
        
        return status;
    }

    saveProcessInfo() {
        try {
            const data = Array.from(this.processes.values());
            fs.writeFileSync(this.pidFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save process info:', error.message);
        }
    }

    loadProcessInfo() {
        try {
            if (fs.existsSync(this.pidFile)) {
                const data = JSON.parse(fs.readFileSync(this.pidFile, 'utf8'));
                data.forEach(process => {
                    this.processes.set(process.type, process);
                });
            }
        } catch (error) {
            console.error('Failed to load process info:', error.message);
        }
    }

    async restartFtp() {
        console.log('Restarting FTP server...');
        await this.stopFtp();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return await this.startFtp();
    }

    async restartSsh() {
        console.log('Restarting SSH server...');
        await this.stopSsh();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return await this.startSsh();
    }

    async restartAll() {
        console.log('Restarting all servers...');
        await this.stopAll();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return await this.startAll();
    }
}

// Export singleton instance
module.exports = new BeamProcessManager();

// CLI interface
if (require.main === module) {
    const manager = require('./process-manager');
    const command = process.argv[2];
    const service = process.argv[3];

    async function runCommand() {
        switch (command) {
            case 'start':
                if (service === 'ftp') {
                    await manager.startFtp();
                } else if (service === 'ssh') {
                    await manager.startSsh();
                } else if (!service) {
                    await manager.startAll();
                } else {
                    console.log(' Invalid service. Use: ftp, ssh, or leave empty for all');
                }
                break;
                
            case 'stop':
                if (service === 'ftp') {
                    await manager.stopFtp();
                } else if (service === 'ssh') {
                    await manager.stopSsh();
                } else if (!service) {
                    await manager.stopAll();
                } else {
                    console.log(' Invalid service. Use: ftp, ssh, or leave empty for all');
                }
                break;
                
            case 'restart':
                if (service === 'ftp') {
                    await manager.restartFtp();
                } else if (service === 'ssh') {
                    await manager.restartSsh();
                } else if (!service) {
                    await manager.restartAll();
                } else {
                    console.log(' Invalid service. Use: ftp, ssh, or leave empty for all');
                }
                break;
                
            case 'status':
                const status = manager.getStatus();
                console.log('\n Server Status:');
                console.log('================');
                console.log(`FTP Server: ${status.ftp.running ? ' Running' : ' Stopped'} (Port: ${status.ftp.port})`);
                console.log(`SSH Server: ${status.ssh.running ? ' Running' : ' Stopped'} (Port: ${status.ssh.port})`);
                
                if (status.processes.length > 0) {
                    console.log('\n Active Processes:');
                    status.processes.forEach(proc => {
                        console.log(`  - ${proc.type.toUpperCase()}: PID ${proc.pid}, Started: ${proc.started}`);
                    });
                }
                break;
                
            default:
                console.log(' Invalid command. Available commands:');
                console.log('  start [ftp|ssh]  - Start server(s)');
                console.log('  stop [ftp|ssh]   - Stop server(s)');
                console.log('  restart [ftp|ssh] - Restart server(s)');
                console.log('  status           - Show server status');
                break;
        }
        
        process.exit(0);
    }

    runCommand().catch(console.error);
}
