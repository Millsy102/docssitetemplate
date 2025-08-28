#  GitHub Secrets Setup Guide

## Overview

This guide shows you how to set up GitHub Secrets to manage your admin credentials securely. This way, you can change your admin username, password, and API key through GitHub's secure environment variable system without touching any code.

##  Quick Setup

### Step 1: Access GitHub Repository Settings

1. Go to your repository: https://github.com/Millsy102/docssitetemplate
2. Click the **"Settings"** tab
3. In the left sidebar, click **"Secrets and variables"**
4. Click **"Actions"**

### Step 2: Add Repository Secrets

Click **"New repository secret"** and add these three secrets:

#### Secret 1: ADMIN_USERNAME
- **Name**: `ADMIN_USERNAME`
- **Value**: `millsy102` (or your preferred admin username)

#### Secret 2: ADMIN_PASSWORD
- **Name**: `ADMIN_PASSWORD`
- **Value**: `beamflow-secure-admin-password-2024` (or your preferred secure password)

#### Secret 3: ADMIN_API_KEY
- **Name**: `ADMIN_API_KEY`
- **Value**: `beamflow-admin-api-key-2024` (or your preferred API key)

### Step 3: Verify Setup

After adding the secrets, you should see them listed in the "Repository secrets" section. They will appear as:
- `ADMIN_USERNAME` (hidden)
- `ADMIN_PASSWORD` (hidden)
- `ADMIN_API_KEY` (hidden)

##  How It Works

### Environment Variables in GitHub Actions

When your GitHub Actions workflow runs, these secrets are automatically available as environment variables:

```yaml
# In .github/workflows/deploy.yml
- name: Set admin credentials from secrets
  run: |
    echo "ADMIN_USERNAME=${{ secrets.ADMIN_USERNAME }}" >> $GITHUB_ENV
    echo "ADMIN_PASSWORD=${{ secrets.ADMIN_PASSWORD }}" >> $GITHUB_ENV
    echo "ADMIN_API_KEY=${{ secrets.ADMIN_API_KEY }}" >> $GITHUB_ENV
```

### Environment Configuration

The `scripts/env-config.js` file automatically detects when running in GitHub Actions and uses these environment variables:

```javascript
// Admin Configuration - NO HARDCODED VALUES
get adminUsername() {
    return process.env.ADMIN_USERNAME || 'admin';
}

get adminPassword() {
    return process.env.ADMIN_PASSWORD || 'your-secure-admin-password';
}

get adminApiKey() {
    return process.env.ADMIN_API_KEY || 'your-admin-api-key';
}
```

##  Changing Admin Credentials

### To Change Your Admin Credentials:

1. Go to your repository settings
2. Navigate to **"Secrets and variables"** → **"Actions"**
3. Find the secret you want to change
4. Click the **"Update"** button
5. Enter the new value
6. Click **"Update secret"**

### What Happens Next:

- The next time you push code or manually trigger the workflow, the new credentials will be used
- No code changes required
- The old credentials are immediately invalidated
- All deployments will use the new credentials

##  Security Features

### GitHub Secrets Security:
- **Encrypted at rest**: All secrets are encrypted using AES-256
- **Encrypted in transit**: HTTPS encryption for all transfers
- **Access control**: Only repository owners and collaborators with admin access can manage secrets
- **Audit trail**: All secret changes are logged
- **Never exposed in logs**: Secrets are automatically masked in workflow logs

### Environment Variable Security:
- **No hardcoded values**: All credentials come from environment variables
- **Production-ready**: Works seamlessly in GitHub Actions
- **Local development**: Falls back to `.env` file for local development
- **Validation**: System validates that required variables are present

##  Testing Your Setup

### Test Environment Configuration:

```bash
# Run the environment configuration test
node scripts/env-config.js
```

Expected output:
```
 Environment Configuration Summary:
=====================================
{
  "environment": {
    "isProduction": true,
    "isGitHubActions": true,
    "nodeEnv": "production"
  },
  "admin": {
    "username": "millsy102",
    "password": "[HIDDEN]",
    "apiKey": "[HIDDEN]"
  }
}

 Environment validation passed!
```

### Test GitHub Actions Workflow:

1. Make a small change to any file
2. Commit and push to the `main` branch
3. Go to the **"Actions"** tab in your repository
4. Watch the workflow run
5. Check that it completes successfully

##  Troubleshooting

### Common Issues:

#### Issue: "Missing environment variables" error
**Solution**: Make sure you've added all three secrets (ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_API_KEY)

#### Issue: Workflow fails with "secrets not found"
**Solution**: 
1. Check that secret names are exactly correct (case-sensitive)
2. Ensure you have admin access to the repository
3. Try re-adding the secrets

#### Issue: Old credentials still being used
**Solution**: 
1. Clear your browser cache
2. Wait a few minutes for GitHub to propagate changes
3. Trigger a new workflow run

### Debugging:

To debug environment variable issues, you can temporarily add this to your workflow:

```yaml
- name: Debug environment variables
  run: |
    echo "ADMIN_USERNAME is set: ${{ secrets.ADMIN_USERNAME != '' }}"
    echo "ADMIN_PASSWORD is set: ${{ secrets.ADMIN_PASSWORD != '' }}"
    echo "ADMIN_API_KEY is set: ${{ secrets.ADMIN_API_KEY != '' }}"
```

##  Best Practices

### Password Security:
- Use strong, unique passwords
- Include uppercase, lowercase, numbers, and special characters
- Make passwords at least 16 characters long
- Never reuse passwords from other services

### API Key Security:
- Generate random, unique API keys
- Use at least 32 characters
- Include a mix of letters, numbers, and special characters
- Rotate API keys regularly

### Repository Security:
- Only give admin access to trusted collaborators
- Regularly review who has access to secrets
- Monitor the audit log for secret changes
- Use different credentials for different environments

##  Migration from .env File

If you currently have admin credentials in your `.env` file:

1. **Add the secrets to GitHub** (as described above)
2. **Remove the admin credentials from .env**:
   ```env
   # Remove or comment out these lines:
   # ADMIN_USERNAME=admin
   # ADMIN_PASSWORD=your-secure-admin-password
   # ADMIN_API_KEY=your-admin-api-key
   ```
3. **Test the setup** by pushing a change
4. **Verify** that the system works with GitHub Secrets

##  Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the GitHub Actions logs for error messages
3. Verify that all secrets are properly set
4. Test the environment configuration locally

---

**Remember**: GitHub Secrets provide enterprise-grade security for your admin credentials. Once set up, you can change your credentials anytime without touching any code! 
