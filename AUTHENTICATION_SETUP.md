# Authentication System Setup Guide

## Overview

Your BeamFlow site now has a complete authentication system with:
- **Hidden admin access** via the copyright symbol (©)
- **Supabase authentication** with Google/GitHub OAuth
- **Secure admin panel** that requires login
- **Environment variable configuration** for security

## Quick Setup

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings > API** to get your credentials:
   - **Project URL** (SUPABASE_URL)
   - **Anon public key** (SUPABASE_ANON_KEY)

### 2. Configure GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Configure OAuth Providers

In your Supabase dashboard:

#### Google OAuth
1. Go to **Authentication > Providers > Google**
2. Enable Google provider
3. Add your Google OAuth credentials

#### GitHub OAuth
1. Go to **Authentication > Providers > GitHub**
2. Enable GitHub provider
3. Add your GitHub OAuth credentials

### 4. Set Redirect URLs

In Supabase **Authentication > URL Configuration**, add:
```
https://millsy102.github.io/docssitetemplate/login/
https://millsy102.github.io/docssitetemplate/app/
```

## How It Works

### 1. Hidden Access
- Click the **©** symbol in the footer of any page
- This takes you to `/admin/` which checks authentication

### 2. Authentication Flow
- If not logged in → redirects to `/login/`
- Login page offers Google/GitHub OAuth
- After successful login → redirects to `/app/`

### 3. Admin Panel
- `/app/` contains your full admin interface
- Requires valid session to access
- Automatically logs out after session expires

## File Structure

```
docs/
├── admin/index.html          # Admin entry point (checks auth)
├── login/index.html          # Login page with OAuth
├── app/index.html           # Main admin panel
├── app/app.js              # Admin functionality
├── env.js                  # Environment configuration
└── index.html              # Public docs (with hidden © link)
```

## Environment Variables

The system uses these environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |

## Security Features

- **Hidden access point** - Only the copyright symbol is clickable
- **OAuth authentication** - No passwords stored locally
- **Session management** - Automatic logout after 24 hours
- **Environment variables** - Credentials not in code
- **GitHub Pages compatible** - Works with static hosting

## Troubleshooting

### Authentication not working?
1. Check GitHub Secrets are set correctly
2. Verify Supabase project is active
3. Check OAuth providers are configured
4. Ensure redirect URLs are correct

### Can't access admin?
1. Make sure you're logged in via OAuth
2. Check browser console for errors
3. Verify environment variables are loaded

### Local Development
For local testing, edit `docs/env.js` directly:
```javascript
window.SUPABASE_URL = 'your-actual-url';
window.SUPABASE_ANON_KEY = 'your-actual-key';
```

## Next Steps

1. **Set up Supabase** with your credentials
2. **Configure GitHub Secrets** with the environment variables
3. **Test the authentication flow** by clicking the © symbol
4. **Customize the admin panel** in `/app/` directory

Your authentication system is now ready and secure!
