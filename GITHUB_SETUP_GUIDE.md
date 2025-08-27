# Complete GitHub Setup Guide

## Current Issue
Your Git is configured with the wrong GitHub account. It's currently set to `[old-username]` but your actual GitHub account is `[your-username]`.

## Step-by-Step Fix

### 1. Configure Git with Correct GitHub Account

```bash
# Set your correct GitHub username
git config --global user.name "[your-username]"

# Set your GitHub email (you'll need to provide this)
git config --global user.email "your-email@example.com"

# Verify the configuration
git config --global user.name
git config --global user.email
```

### 2. Set Up GitHub Authentication

#### Option A: Personal Access Token (Recommended)
1. Go to GitHub.com and sign in as `[your-username]`
2. Click your profile picture → Settings
3. Scroll down to "Developer settings" (bottom left)
4. Click "Personal access tokens" → "Tokens (classic)"
5. Click "Generate new token" → "Generate new token (classic)"
6. Give it a name like "Local Git Access"
7. Select scopes: `repo`, `workflow`, `write:packages`
8. Click "Generate token"
9. **Copy the token immediately** (you won't see it again)

#### Option B: SSH Keys
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Start SSH agent
eval "$(ssh-agent -s)"

# Add SSH key to agent
ssh-add ~/.ssh/id_ed25519

# Copy public key to clipboard (Windows)
clip < ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to GitHub Settings → SSH and GPG keys
# 2. Click "New SSH key"
# 3. Paste the key and save
```

### 3. Update Repository Remote URL

```bash
# Check current remote
git remote -v

# Update to use your correct account
git remote set-url origin https://github.com/[your-username]/[your-repo-name].git

# Or for SSH (if you set up SSH keys):
git remote set-url origin git@github.com:[your-username]/[your-repo-name].git
```

### 4. Test Authentication

```bash
# Test HTTPS with token
git push origin main

# Or test SSH
ssh -T git@github.com
```

### 5. Environment Variables (Optional but Recommended)

Create a `.env` file in your project root:
```bash
# .env
GITHUB_USERNAME=[your-username]
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_REPO=[your-username]/[your-repo-name]
```

### 6. Verify GitHub Pages Settings

1. Go to your repository: https://github.com/[your-username]/[your-repo-name]
2. Click "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", make sure it's set to "GitHub Actions"
5. Your site should be available at: https://[your-username].github.io/[your-repo-name]/

## Troubleshooting

### If you get "Authentication failed":
1. Make sure you're using the correct username (`[your-username]`)
2. If using HTTPS, use your Personal Access Token as password
3. If using SSH, make sure your SSH key is added to GitHub

### If you get "Repository not found":
1. Make sure you have access to the repository
2. Check that the remote URL is correct
3. Verify you're logged into the right GitHub account

### If GitHub Pages isn't working:
1. Check the "Actions" tab in your repository
2. Look for any failed deployment workflows
3. Make sure the `main` branch has the latest code

## Your Repository Status

✅ **Repository exists**: https://github.com/[your-username]/[your-repo-name]  
✅ **Public repository**: GitHub Pages enabled  
✅ **GitHub Actions**: Configured for deployment  
✅ **Site URL**: https://[your-username].github.io/[your-repo-name]/  

## Next Steps

1. Run the Git configuration commands above
2. Set up authentication (Personal Access Token or SSH)
3. Test with a small commit and push
4. Check your site at the GitHub Pages URL
5. Test the login system on your live site

## Login System Credentials

Once your site is properly deployed, you'll need to set up authentication:

### For Testing Only:
⚠️ **SECURITY WARNING**: Only use these for initial testing!

- **Username**: `admin`
- **Password**: `secret123`

### For Production:
1. Create a `.env` file in your project root
2. Set secure credentials:
   ```env
   ADMIN_USERNAME=your-secure-username
   ADMIN_PASSWORD=your-secure-password
   ```
3. Restart the server after setting environment variables
4. **IMPORTANT:** Change default credentials immediately after setup

The login button should appear in the bottom-right corner of your site.
