# Beam Website System User Guide

This guide will help you get started with Beam Website System and understand the public/private access pattern. The system provides a template site for public users and a full-featured site for authenticated users.

## Table of Contents

- [Overview](#overview)
- [Public vs Private Access](#public-vs-private-access)
- [Installation](#installation)
- [Authentication](#authentication)
- [Basic Usage](#basic-usage)
- [Plugin System](#plugin-system)
- [Component Library](#component-library)
- [Best Practices](#best-practices)

## Overview

Beam Website System implements a sophisticated access control architecture where:

- **Public Site**: A limited, generic "template docs site" that showcases basic features
- **Private Site**: The full, real site with complete functionality for authenticated users
- **Admin Panel**: Enhanced features and management capabilities for administrators

## Public vs Private Access

### Public Access (Template Site)
Public users see a curated subset of the system:

- **Basic Documentation**: Getting started guides and examples
- **Demo Features**: Limited functionality demonstrations
- **Marketing Content**: Showcase and promotional materials
- **Limited API**: Basic endpoints for demonstration

### Private Access (Real Site)
Authenticated users gain access to the complete system:

- **Full Documentation**: Complete guides and reference materials
- **All Features**: Full functionality and capabilities
- **Plugin Management**: Install and configure plugins
- **Admin Dashboard**: User and system management
- **Analytics**: Usage statistics and reporting

## Installation

### Prerequisites

Before installing Beam Website System, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Database** (PostgreSQL, MySQL, or SQLite)
- **Git**

### Quick Installation

```bash
# Clone the repository
git clone https://github.com/your-username/beam-website.git
cd beam-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Configuration

Create a `.env` file with the following variables:

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

## Authentication

### Setting Up Authentication

Beam Website System supports multiple authentication methods:

```javascript
const BeamWebsite = require('beam-website-system');

const website = new BeamWebsite({
  apiKey: process.env.BEAM_API_KEY,
  environment: 'production'
});

// Test the connection
await website.connect();
console.log('Connected to Beam Website System!');
```

### Authentication Methods

#### 1. Username/Password
Traditional authentication with email and password:

```javascript
const auth = await website.authenticate({
  email: 'user@example.com',
  password: 'secure-password'
});
```

#### 2. GitHub OAuth
Secure authentication via GitHub:

```javascript
const auth = await website.authenticateWithGitHub({
  code: 'github-oauth-code',
  state: 'csrf-protection-state'
});
```

#### 3. API Key
Direct API access for integrations:

```javascript
const auth = await website.authenticateWithApiKey({
  apiKey: 'your-api-key'
});
```

## Basic Usage

### Accessing Public Site

```javascript
// Get public template site
const publicSite = website.getPublicSite();

// Access public documentation
const docs = await publicSite.getDocumentation();

// Access demo features
const demos = await publicSite.getDemoFeatures();
```

### Accessing Private Site

```javascript
// Authenticate first
await website.authenticate(credentials);

// Get private real site
const privateSite = website.getPrivateSite();

// Access full documentation
const fullDocs = await privateSite.getDocumentation();

// Access all features
const features = await privateSite.getAllFeatures();
```

### Admin Access

```javascript
// Check if user has admin privileges
if (website.user.hasRole('admin')) {
  const adminPanel = website.getAdminPanel();
  
  // Manage users
  const users = await adminPanel.getUsers();
  
  // Manage plugins
  const plugins = await adminPanel.getPlugins();
  
  // System configuration
  const config = await adminPanel.getSystemConfig();
}
```

## Plugin System

### Understanding Plugins

The Beam system includes two types of functionality:

1. **Core Features**: Essential functionality built into the system
2. **Third-Party Plugins**: Extensible functionality through plugins

### Installing Plugins

```javascript
// Install a plugin
const plugin = await website.installPlugin('plugin-name');

// Configure the plugin
await plugin.configure({
  setting1: 'value1',
  setting2: 'value2'
});

// Enable the plugin
await plugin.enable();
```

### Using Plugins

```javascript
// Get installed plugins
const plugins = await website.getPlugins();

// Use a specific plugin
const imageGenerator = plugins.get('image-generator');
const result = await imageGenerator.generateImage('a beautiful sunset');
```

## Component Library

### Using Beam Components

Beam Website System includes a comprehensive component library:

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

### Theme Support

Components support multiple themes:

```javascript
// Switch to dark theme
website.setTheme('dark');

// Switch to light theme
website.setTheme('light');

// Use high contrast theme
website.setTheme('high-contrast');
```

## Best Practices

### 1. Security

- **Use Environment Variables**: Never hardcode sensitive information
- **Implement Proper Authentication**: Use secure authentication methods
- **Validate Input**: Always validate and sanitize user input
- **Regular Updates**: Keep the system and plugins updated

### 2. Performance

- **Optimize Images**: Use appropriate image formats and sizes
- **Minimize Requests**: Combine CSS and JavaScript files
- **Use Caching**: Implement proper caching strategies
- **Monitor Performance**: Use built-in analytics to track performance

### 3. Accessibility

- **Use Semantic HTML**: Follow proper HTML structure
- **Provide Alt Text**: Include alt text for images
- **Keyboard Navigation**: Ensure all features are keyboard accessible
- **Color Contrast**: Maintain sufficient color contrast ratios

### 4. User Experience

- **Responsive Design**: Ensure the site works on all devices
- **Fast Loading**: Optimize for quick page loads
- **Clear Navigation**: Provide intuitive navigation
- **Error Handling**: Show helpful error messages

### 5. Content Management

- **Regular Updates**: Keep content fresh and relevant
- **SEO Optimization**: Use proper meta tags and structure
- **Content Organization**: Organize content logically
- **Search Functionality**: Implement effective search

## Troubleshooting

### Common Issues

1. **Authentication Problems**
   - Check API keys and credentials
   - Verify OAuth configuration
   - Ensure proper permissions

2. **Plugin Issues**
   - Check plugin compatibility
   - Verify plugin configuration
   - Review plugin logs

3. **Performance Issues**
   - Monitor server resources
   - Check database performance
   - Review caching configuration

### Getting Help

- **Documentation**: Check the comprehensive documentation
- **Community Forum**: Ask questions in the community
- **Support**: Contact support for technical issues
- **GitHub Issues**: Report bugs and request features

## Next Steps

- Explore the [API Reference](api-reference.md) for detailed endpoint documentation
- Check out [Examples](examples.md) for more use cases
- Learn about [Plugin Development](plugin-system-guide.md)
- Review the [Component Library](component-library.md)

---

*Ready to build amazing websites with intelligent access control? Start with Beam Website System today!*
