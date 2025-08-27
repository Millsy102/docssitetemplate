const { FtpSrv } = require('ftp-srv');
const path = require('path');
const fs = require('fs-extra');
const BeamAuth = require('./middleware/BeamAuth');
const BeamErrorHandler = require('./utils/BeamErrorHandler');
const BeamPerformanceMonitor = require('./utils/BeamPerformanceMonitor');

class BeamFtpServer {
    constructor() {
        this.ftpServer = null;
        this.port = process.env.FTP_PORT || 21;
        this.rootDir = path.join(__dirname, '../ftp-root');
        this.ensureRootDirectory();
    }

    ensureRootDirectory() {
        if (!fs.existsSync(this.rootDir)) {
            fs.mkdirpSync(this.rootDir);
            // Create default directories
            fs.mkdirpSync(path.join(this.rootDir, 'uploads'));
            fs.mkdirpSync(path.join(this.rootDir, 'downloads'));
            fs.mkdirpSync(path.join(this.rootDir, 'plugins'));
            fs.mkdirpSync(path.join(this.rootDir, 'backups'));
        }
    }

    async start() {
        try {
            this.ftpServer = new FtpSrv({
                url: `ftp://0.0.0.0:${this.port}`,
                anonymous: false,
                pasv_url: process.env.FTP_PASV_URL || 'localhost',
                pasv_min: 1024,
                pasv_max: 1050,
                greeting: ['Welcome to BeamFlow FTP Server', 'Secure file transfer system'],
                tls: process.env.FTP_TLS_ENABLED === 'true' ? {
                    key: process.env.FTP_TLS_KEY_PATH,
                    cert: process.env.FTP_TLS_CERT_PATH
                } : false
            });

            // Authentication handler
            this.ftpServer.on('login', async ({ connection, username, password }, resolve, reject) => {
                try {
                    // Use existing BeamAuth system for authentication
                    const user = await BeamAuth.authenticateUser(username, password);
                    
                    if (user && user.role === 'admin') {
                        // Admin gets access to all directories
                        connection.user = user;
                        connection.rootDir = this.rootDir;
                        resolve({ fs: this.createFileSystem(connection) });
                    } else if (user && user.role === 'user') {
                        // Regular users get limited access
                        connection.user = user;
                        connection.rootDir = path.join(this.rootDir, 'uploads');
                        resolve({ fs: this.createFileSystem(connection) });
                    } else {
                        reject(new Error('Invalid credentials'));
                    }
                } catch (error) {
                    BeamErrorHandler.logError('FTP Authentication Error', error);
                    reject(new Error('Authentication failed'));
                }
            });

            // Connection events
            this.ftpServer.on('client-error', ({ connection, context, error }) => {
                BeamErrorHandler.logError('FTP Client Error', error, {
                    user: connection.user?.username,
                    ip: connection.ip
                });
            });

            this.ftpServer.on('disconnect', ({ connection }) => {
                console.log(`FTP Client disconnected: ${connection.ip}`);
                BeamPerformanceMonitor.recordFtpDisconnection(connection.user?.username);
            });

            await this.ftpServer.listen();
            console.log(` BeamFlow FTP Server running on port ${this.port}`);
            
            // Log startup
            BeamPerformanceMonitor.recordFtpStartup();
            
        } catch (error) {
            BeamErrorHandler.logError('FTP Server Startup Error', error);
            throw error;
        }
    }

    createFileSystem(connection) {
        return {
            get(fileName) {
                const fullPath = path.join(connection.rootDir, fileName);
                return fs.createReadStream(fullPath);
            },
            
            list(path = '.') {
                const fullPath = path.join(connection.rootDir, path);
                return new Promise((resolve, reject) => {
                    fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        
                        const fileList = files.map(file => ({
                            name: file.name,
                            size: file.isFile() ? fs.statSync(path.join(fullPath, file.name)).size : 0,
                            type: file.isDirectory() ? 'dir' : 'file',
                            modifyTime: fs.statSync(path.join(fullPath, file.name)).mtime
                        }));
                        
                        resolve(fileList);
                    });
                });
            },
            
            chdir(path) {
                const fullPath = path.join(connection.rootDir, path);
                return new Promise((resolve, reject) => {
                    fs.access(fullPath, fs.constants.F_OK, (err) => {
                        if (err) {
                            reject(new Error('Directory not found'));
                        } else {
                            resolve(fullPath);
                        }
                    });
                });
            },
            
            write(fileName) {
                const fullPath = path.join(connection.rootDir, fileName);
                const writeStream = fs.createWriteStream(fullPath);
                
                // Log file upload
                BeamPerformanceMonitor.recordFtpUpload(connection.user?.username, fileName);
                
                return writeStream;
            },
            
            delete(fileName) {
                const fullPath = path.join(connection.rootDir, fileName);
                return new Promise((resolve, reject) => {
                    fs.unlink(fullPath, (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            BeamPerformanceMonitor.recordFtpDelete(connection.user?.username, fileName);
                            resolve();
                        }
                    });
                });
            },
            
            mkdir(dirName) {
                const fullPath = path.join(connection.rootDir, dirName);
                return fs.mkdirp(fullPath);
            },
            
            rmdir(dirName) {
                const fullPath = path.join(connection.rootDir, dirName);
                return fs.rmdir(fullPath);
            },
            
            rename(from, to) {
                const fromPath = path.join(connection.rootDir, from);
                const toPath = path.join(connection.rootDir, to);
                return fs.rename(fromPath, toPath);
            }
        };
    }

    async stop() {
        if (this.ftpServer) {
            await this.ftpServer.close();
            console.log('FTP Server stopped');
        }
    }

    getStats() {
        return {
            port: this.port,
            rootDir: this.rootDir,
            isRunning: !!this.ftpServer,
            connections: this.ftpServer ? this.ftpServer.connections.size : 0
        };
    }
}

// Export singleton instance
module.exports = new BeamFtpServer();

// Start server if this file is run directly
if (require.main === module) {
    const ftpServer = require('./ftp-server');
    ftpServer.start().catch(console.error);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down FTP server...');
        await ftpServer.stop();
        process.exit(0);
    });
}
