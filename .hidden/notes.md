# BeamFlow Honeypot Setup Guide

This guide explains how to set up the dual-layer GitHub Pages system with hidden GitHub OAuth authentication.

## Overview

The system consists of:
1. **Public Layer**: A convincing fake documentation site visible to everyone
2. **Hidden Layer**: A real project accessible only after GitHub OAuth authentication
3. **Hidden Access Point**: A subtle login button in the bottom-right corner

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: `BeamFlow Dev Access`
   - **Homepage URL**: `https://yourusername.github.io/your-repo-name`
   - **Authorization callback URL**: `https://yourusername.github.io/your-repo-name/auth/callback`
   - **Description**: `Developer access for BeamFlow project`

4. Click "Register application"
5. Copy the **Client ID** (you'll need this)

### 2. Update Authentication Configuration

Edit `assets/js/auth.js` and replace the client ID:

```javascript
this.clientId = 'your-actual-github-client-id'; // Replace with your GitHub OAuth app client ID
```

### 3. Configure Allowed Users (Optional)

To restrict access to specific GitHub users, modify the `handleAuthCallback` method in `assets/js/auth.js`:

```javascript
async handleAuthCallback (code, state) {
  const savedState = localStorage.getItem('beamflow_auth_state');
  
  if (state !== savedState) {
    console.error('Invalid state parameter');
    return;
  }
  
  try {
    // In a real implementation, you'd exchange the code for an access token
    // and verify the user's GitHub username
    
    // For demo purposes, simulate authentication
    this.isAuthenticated = true;
    this.user = {
      login: 'your-github-username', // Replace with your GitHub username
      name: 'Your Name',
      avatar_url: 'https://github.com/github.png'
    };
    
    // Optional: Check if user is allowed
    const allowedUsers = ['your-github-username', 'another-user'];
    if (!allowedUsers.includes(this.user.login)) {
      throw new Error('Access denied');
    }
    
    localStorage.setItem('beamflow_authenticated', 'true');
    localStorage.setItem('beamflow_user', JSON.stringify(this.user));
    
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    
    this.showRealProject();
    
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

## Deployment

### 1. GitHub Pages Setup

1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Set source to "Deploy from a branch"
4. Select `main` branch and `/ (root)` folder
5. Click "Save"

### 2. Custom Domain (Optional)

If you want a custom domain:
1. Add your domain to the repository settings
2. Update the OAuth callback URL in your GitHub OAuth app
3. Update the `redirectUri` in `assets/js/auth.js`

## Security Considerations

### 1. Client-Side Security

The current implementation is client-side only for demonstration. For production use:

- Implement server-side OAuth token exchange
- Add proper session management
- Use secure cookies instead of localStorage
- Add rate limiting
- Implement proper error handling

### 2. Access Control

- Restrict access to specific GitHub users
- Add IP whitelisting if needed
- Implement audit logging
- Add session timeout

### 3. OAuth Best Practices

- Use state parameter (already implemented)
- Validate redirect URIs
- Store client secret securely (server-side only)
- Implement proper error handling
- Add CSRF protection

## Customization

### 1. Hidden Login Button

The hidden login button appears as a subtle lock icon in the bottom-right corner. To customize:

```css
.beamflow-hidden-login {
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  /* Customize appearance */
}
```

### 2. Real Project Content

Edit the `showRealProject()` method in `assets/js/auth.js` to customize the real project content:

```javascript
showRealProject () {
  // Customize the real project overlay content
  const realProject = document.createElement('div');
  realProject.className = 'beamflow-real-project show';
  realProject.innerHTML = `
    <div class="beamflow-real-header">
      <h2>Your Real Project Title</h2>
      <button class="beamflow-logout-btn" onclick="beamflowAuth.logout()">Logout</button>
    </div>
    <div class="beamflow-real-content">
      <!-- Your real project content here -->
    </div>
  `;
  
  document.body.appendChild(realProject);
}
```

### 3. Fake Documentation

The fake documentation is in:
- `README.md` - Main documentation page
- `docs/getting-started.md` - Getting started guide
- `docs/api-reference.md` - API documentation

Customize these files to match your desired fake project.

## Testing

### 1. Local Testing

1. Serve the site locally:
   ```bash
   npx serve .
   ```

2. Update OAuth callback URL to `http://localhost:3000/auth/callback`

3. Test the authentication flow

### 2. Production Testing

1. Deploy to GitHub Pages
2. Test the hidden login button
3. Verify authentication works
4. Check that unauthorized users can't access the real project

## Troubleshooting

### Common Issues

1. **OAuth callback fails**
   - Check callback URL matches GitHub OAuth app settings
   - Verify client ID is correct
   - Check browser console for errors

2. **Hidden button not visible**
   - Check CSS is loaded
   - Verify JavaScript is running
   - Check for JavaScript errors

3. **Authentication not working**
   - Check GitHub OAuth app settings
   - Verify allowed users list
   - Check browser console for errors

### Debug Mode

Enable debug logging by adding to `assets/js/auth.js`:

```javascript
constructor () {
  this.debug = true; // Enable debug mode
  // ... rest of constructor
}

// Add debug logging throughout the class
if (this.debug) {
  console.log('Debug:', message);
}
```

## Advanced Features

### 1. Server-Side Implementation

For better security, implement server-side OAuth:

```javascript
// Server-side token exchange
async exchangeCodeForToken(code) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code: code,
    }),
  });
  
  return response.json();
}
```

### 2. Session Management

Implement proper session management:

```javascript
// Set secure session cookie
document.cookie = `beamflow_session=${sessionToken}; Secure; SameSite=Strict; Max-Age=3600`;
```

### 3. Analytics

Track authentication attempts:

```javascript
// Track login attempts
trackEvent('auth_attempt', {
  user: this.user?.login,
  timestamp: new Date().toISOString(),
  success: true
});
```

## Support

For setup issues:
- Check the browser console for errors
- Verify GitHub OAuth app configuration
- Test with a simple OAuth flow first
- Review GitHub OAuth documentation

---

**Remember**: This is a demonstration system. For production use, implement proper server-side security measures.
