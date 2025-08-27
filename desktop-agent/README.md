# BeamFlow Desktop Agent

A local desktop agent that enables secure communication between the BeamFlow web application and your local Unreal Engine installation.

## Features

- **Unreal Engine Integration**: Launch projects, build plugins, and manage Unreal Engine workflows
- **File System Access**: Read, write, and list files and directories
- **Process Execution**: Run commands and scripts locally
- **Secure Communication**: WebSocket-based communication with origin verification and pairing codes
- **Capability-based Permissions**: Granular control over what the web app can access

## Installation

1. **Prerequisites**:
   - Node.js 18+ installed
   - Unreal Engine 5.x installed (optional, for UE features)

2. **Install dependencies**:
   ```bash
   cd desktop-agent
   npm install
   ```

3. **Start the agent**:
   ```bash
   npm start
   ```

## Usage

### Starting the Agent

```bash
# From the desktop-agent directory
npm start
```

The agent will start and display:
- The pairing code (6-digit number)
- The listening port (default: 31245)
- Allowed origins

### Connecting from the Web App

1. Open the BeamFlow web application
2. Sign in with your account
3. The app will automatically detect and connect to the desktop agent
4. Enter the pairing code when prompted (first time only)

### Available Commands

#### Unreal Engine Commands

- `ue.open_project(path)` - Launch Unreal Editor with a project
- `ue.build_plugin(path, configuration)` - Build a plugin
- `ue.get_version()` - Get installed Unreal Engine version
- `ue.list_projects()` - List available Unreal projects

#### File System Commands

- `fs.read(path)` - Read file contents
- `fs.write(path, content)` - Write content to file
- `fs.list(path)` - List directory contents

#### Process Commands

- `process.execute(command, args)` - Execute a command with arguments

## Security

### Origin Verification

The agent only accepts connections from allowed origins:
- `https://millsy102.github.io` (GitHub Pages)
- `http://localhost:3000` (Local development)
- `http://127.0.0.1:3000` (Local development)

### Pairing Process

1. **First Connection**: Requires a 6-digit pairing code
2. **Subsequent Connections**: Uses stored pairing state
3. **Token Verification**: Validates web app authentication tokens

### Capability System

The agent uses a capability-based permission system:
- `unreal` - Unreal Engine operations
- `fs` - File system access
- `process` - Process execution

## Configuration

### Environment Variables

- `PORT` - Server port (default: 31245)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins

### Unreal Engine Paths

The agent automatically detects Unreal Engine installations in:
- `C:\Program Files\Epic Games\UE_5.3\`
- `C:\Program Files\Epic Games\UE_5.2\`
- `C:\Program Files\Epic Games\UE_5.1\`
- `C:\Program Files\Epic Games\UE_5.0\`

## Troubleshooting

### Agent Not Found

1. Ensure the agent is running (`npm start`)
2. Check that port 31245 is not blocked by firewall
3. Verify the agent is listening on `127.0.0.1:31245`

### Connection Issues

1. Check that your web app origin is in the allowed list
2. Verify the pairing code is entered correctly
3. Ensure no other process is using port 31245

### Unreal Engine Issues

1. Verify Unreal Engine is installed in a standard location
2. Check that the project file exists and is accessible
3. Ensure UBT (Unreal Build Tool) is available

## Development

### Adding New Commands

1. Add the command handler in the WebSocket message handler
2. Implement the command logic
3. Add appropriate error handling
4. Update this documentation

### Testing

```bash
# Test health endpoint
curl http://127.0.0.1:31245/health

# Test pairing code endpoint
curl http://127.0.0.1:31245/pair-code
```

## License

MIT License - see the main repository for details.
