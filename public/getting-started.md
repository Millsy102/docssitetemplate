# Getting Started with Beam Website System

Welcome to Beam Website System! This guide will help you understand the unique public/private access pattern and get started with the system.

## 🚀 Overview

Beam Website System implements a sophisticated access control architecture where:

- **Public Site**: A limited, generic "template docs site" that showcases basic features
- **Private Site**: The full, real site with complete functionality for authenticated users
- **Admin Panel**: Enhanced features and management capabilities for administrators

## 🔐 Understanding Access Levels

### Public Access (Template Site)
When you first visit the site, you'll see the public template site which includes:

- **Basic Documentation**: Getting started guides and examples
- **Demo Features**: Limited functionality demonstrations
- **Marketing Content**: Showcase and promotional materials
- **Limited API**: Basic endpoints for demonstration

### Private Access (Real Site)
After authentication, you gain access to the complete system:

- **Full Documentation**: Complete guides and reference materials
- **All Features**: Full functionality and capabilities
- **Plugin Management**: Install and configure plugins
- **Admin Dashboard**: User and system management
- **Analytics**: Usage statistics and reporting

## 📦 Installation

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Database** (PostgreSQL, MySQL, or SQLite)
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/beam-website.git
   cd beam-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure your environment**
   Edit the `.env` file with your settings:
   ```env
   # Database
   DATABASE_URL=postgresql://localhost/beam_website
   
   # Authentication
   JWT_SECRET=your-jwt-secret
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   
   # Server
   PORT=3000
   NODE_ENV=development
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - **Public Site**: http://localhost:3000
   - **Login**: http://localhost:3000/login
   - **Dashboard**: http://localhost:3000/dashboard (after login)

## 🔐 Authentication Setup

### GitHub OAuth (Recommended)

1. **Create a GitHub OAuth App**
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Set Application name: "Beam Website System"
   - Set Homepage URL: `http://localhost:3000`
   - Set Authorization callback URL: `http://localhost:3000/auth/github/callback`
   - Click "Register application"

2. **Get your credentials**
   - Copy the Client ID and Client Secret
   - Add them to your `.env` file

### Traditional Authentication

You can also use traditional username/password authentication:

```javascript
// Example authentication
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password'
  })
});
```

## 🧩 Plugin System

### Understanding Plugins

The Beam system includes two types of functionality:

1. **Core Features**: Essential functionality built into the system
2. **Third-Party Plugins**: Extensible functionality through plugins

### Installing Your First Plugin

```javascript
// Example: Install a plugin
const plugin = await website.installPlugin('image-generator');

// Configure the plugin
await plugin.configure({
  apiKey: 'your-api-key',
  model: 'dall-e-2'
});

// Enable the plugin
await plugin.enable();
```

## 🎨 Component System

### Using Beam Components

The system includes a comprehensive component library:

```jsx
import { 
  BeamButton, 
  BeamCard, 
  BeamInput,
  BeamModal 
} from '@beam/components';

function MyComponent() {
  return (
    <BeamCard>
      <BeamInput 
        label="Email" 
        type="email" 
        placeholder="Enter your email" 
      />
      <BeamButton variant="primary">
        Submit
      </BeamButton>
    </BeamCard>
  );
}
```

## 🔧 Configuration

### Access Control Configuration

Configure the public/private access pattern:

```javascript
// Example configuration
const config = {
  public: {
    // Public site settings
    documentation: ['getting-started', 'installation', 'examples'],
    features: ['demo', 'showcase'],
    api: ['health', 'public-content']
  },
  private: {
    // Private site settings
    documentation: ['all'],
    features: ['all'],
    api: ['all']
  }
};
```

### Theme Configuration

```javascript
// Set theme
website.setTheme('dark'); // or 'light', 'high-contrast'

// Custom theme
website.setCustomTheme({
  primary: '#3b82f6',
  secondary: '#6b7280',
  background: '#ffffff',
  text: '#1f2937'
});
```

## 📚 Next Steps

### For Public Users
1. Explore the [Examples](examples.md) to see basic functionality
2. Check the [FAQ](faq.md) for common questions
3. Review the [API Reference](api-reference.md) for public endpoints

### For Authenticated Users
1. Complete the [Installation Guide](installation.md)
2. Review the [Architecture Guide](architecture.md)
3. Explore the [Plugin System](plugin-system-guide.md)
4. Customize with the [Component Library](component-library.md)

### For Administrators
1. Set up [User Management](admin-docs/user-management.md)
2. Configure [System Settings](admin-docs/system-configuration.md)
3. Manage [Plugins](admin-docs/plugin-management.md)
4. Monitor [Analytics](admin-docs/analytics.md)

## 🆘 Getting Help

### Documentation
- **Public Docs**: Available to all users
- **Private Docs**: Available after authentication
- **Admin Docs**: Available to administrators

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Community Forum**: Ask questions and share solutions
- **Discord**: Real-time chat and support

### Professional Support
- **Email Support**: Direct support for technical issues
- **Documentation**: Comprehensive guides and tutorials
- **Training**: Custom training sessions available

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check database connection
   npm run db:test
   
   # Reset database
   npm run db:reset
   ```

2. **Authentication Issues**
   - Verify OAuth credentials
   - Check JWT secret configuration
   - Ensure proper redirect URLs

3. **Plugin Problems**
   - Check plugin compatibility
   - Verify plugin configuration
   - Review plugin logs

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
export DEBUG=beam:*

# Start with debug logging
npm run dev:debug
```

## 🚀 Deployment

### Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Ensure all production environment variables are properly configured:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret
```

---

**Ready to get started?** Follow this guide to set up your Beam Website System and explore the unique public/private access pattern!
