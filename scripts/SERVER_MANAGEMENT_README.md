# BeamFlow Server Management

This directory contains scripts and tools for managing your BeamFlow FTP and SSH servers from your private side.

## Quick Start

### Using NPM Scripts (Recommended)

You can manage your servers directly using npm scripts:

```bash
# Start servers
npm run servers:start          # Start all servers
npm run ftp:start             # Start FTP server only
npm run ssh:start             # Start SSH server only

# Stop servers
npm run servers:stop           # Stop all servers
npm run ftp:stop              # Stop FTP server only
npm run ssh:stop              # Stop SSH server only

# Restart servers
npm run servers:restart        # Restart all servers
npm run ftp:restart           # Restart FTP server only
npm run ssh:restart           # Restart SSH server only

# Check status
npm run servers:status         # Show status of all servers
```

### Using PowerShell Script (Windows)

For Windows users, use the PowerShell script:

```powershell
# Start servers
.\scripts\manage-servers.ps1 start all      # Start all servers
.\scripts\manage-servers.ps1 start ftp      # Start FTP server only
.\scripts\manage-servers.ps1 start ssh      # Start SSH server only

# Stop servers
.\scripts\manage-servers.ps1 stop all       # Stop all servers
.\scripts\manage-servers.ps1 stop ftp       # Stop FTP server only
.\scripts\manage-servers.ps1 stop ssh       # Stop SSH server only

# Restart servers
.\scripts\manage-servers.ps1 restart all    # Restart all servers
.\scripts\manage-servers.ps1 restart ftp    # Restart FTP server only
.\scripts\manage-servers.ps1 restart ssh    # Restart SSH server only

# Check status
.\scripts\manage-servers.ps1 status         # Show server status
```

### Using Bash Script (Linux/Mac)

For Linux and Mac users, use the bash script:

```bash
# Make script executable (first time only)
chmod +x scripts/manage-servers.sh

# Start servers
./scripts/manage-servers.sh start all       # Start all servers
./scripts/manage-servers.sh start ftp       # Start FTP server only
./scripts/manage-servers.sh start ssh       # Start SSH server only

# Stop servers
./scripts/manage-servers.sh stop all        # Stop all servers
./scripts/manage-servers.sh stop ftp        # Stop FTP server only
./scripts/manage-servers.sh stop ssh        # Stop SSH server only

# Restart servers
./scripts/manage-servers.sh restart all     # Restart all servers
./scripts/manage-servers.sh restart ftp     # Restart FTP server only
./scripts/manage-servers.sh restart ssh     # Restart SSH server only

# Check status
./scripts/manage-servers.sh status          # Show server status
```

## Direct Process Manager Usage

You can also use the process manager directly:

```bash
# Start servers
node _internal/system/src/process-manager.js start all
node _internal/system/src/process-manager.js start ftp
node _internal/system/src/process-manager.js start ssh

# Stop servers
node _internal/system/src/process-manager.js stop all
node _internal/system/src/process-manager.js stop ftp
node _internal/system/src/process-manager.js stop ssh

# Restart servers
node _internal/system/src/process-manager.js restart all
node _internal/system/src/process-manager.js restart ftp
node _internal/system/src/process-manager.js restart ssh

# Check status
node _internal/system/src/process-manager.js status
```

## Server Information

### FTP Server
- **Default Port**: 21
- **Configuration**: Environment variables or `_internal/system/src/ftp-server.js`
- **Root Directory**: `_internal/system/ftp-root/`
- **Features**: 
  - Secure authentication
  - File upload/download
  - Directory management
  - Performance monitoring

### SSH Server
- **Default Port**: 22
- **Configuration**: Environment variables or `_internal/system/src/ssh-server.js`
- **Host Keys**: `_internal/system/keys/`
- **Features**:
  - Password authentication
  - SFTP support
  - Shell access
  - Performance monitoring

## Environment Variables

You can configure the servers using environment variables:

```bash
# FTP Server Configuration
FTP_PORT=21                    # FTP server port
FTP_PASV_URL=localhost         # Passive mode URL
FTP_TLS_ENABLED=false          # Enable TLS
FTP_TLS_KEY_PATH=/path/to/key  # TLS private key
FTP_TLS_CERT_PATH=/path/to/cert # TLS certificate

# SSH Server Configuration
SSH_PORT=22                    # SSH server port
SSH_HOST_KEY_PATH=/path/to/key # SSH host key path
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Check if another service is using the port
   - Change the port in environment variables
   - Stop conflicting services

2. **Permission denied**
   - Ensure you have proper permissions for the directories
   - Check file ownership for SSH keys

3. **Server won't start**
   - Check the logs for error messages
   - Verify all dependencies are installed
   - Ensure configuration files exist

### Logs and Monitoring

The servers automatically log activities to:
- Console output
- Performance monitoring system
- Error handling system

### Getting Help

If you encounter issues:
1. Check the server status: `npm run servers:status`
2. Review the console output for error messages
3. Check the process manager logs
4. Verify your configuration settings

## Security Notes

- Keep your SSH host keys secure
- Use strong passwords for authentication
- Regularly update your dependencies
- Monitor server logs for suspicious activity
- Consider using TLS for FTP connections in production
