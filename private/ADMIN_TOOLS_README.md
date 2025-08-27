# Admin Tools Structure

**⚠️ IMPORTANT: This file is for documentation only. The actual admin tools should be placed OUTSIDE the repository.**

## Personal Admin Tools Location

All non-essential, sensitive, or admin-only scripts should be placed in your personal admin tools directory:

```
$env:ADMIN_TOOLS/gh-pages/
├─ deploy-local.ps1           # Manual deployment scripts
├─ purge-cloudflare.ps1       # Cache management
├─ secrets.json               # API keys (never commit)
├─ encrypt-app.ps1            # Wrapper around encryption
└─ ...
```

## What Goes in Admin Tools

### ✅ Include in Admin Tools:
- Deployment scripts with sensitive credentials
- Cache purging utilities
- Database reset scripts
- Private API calls
- Local-only configuration files
- Backup and restore scripts
- Performance monitoring tools
- Security audit scripts

### ❌ Never Include in Repository:
- API keys or secrets
- Personal credentials
- Local-only configurations
- Admin-only utilities
- Sensitive deployment scripts

## Setup Instructions

1. **Set Environment Variable** (PowerShell):
   ```powershell
   $env:ADMIN_TOOLS = "C:\Users\YourUsername\AdminTools"
   ```

2. **Create Project Directory**:
   ```powershell
   mkdir "$env:ADMIN_TOOLS\gh-pages"
   ```

3. **Add to Global Gitignore**:
   Add this to your global `.gitignore`:
   ```
   $env:ADMIN_TOOLS/
   Admin/
   admin-tools/
   **/millsy-tools/**
   *.secrets.json
   *.env
   ```

## Example Admin Tools

### deploy-local.ps1
```powershell
# Manual deployment script
param(
    [string]$Environment = "staging"
)

$secrets = Get-Content "$env:ADMIN_TOOLS\gh-pages\secrets.json" | ConvertFrom-Json

# Deployment logic here
Write-Host "Deploying to $Environment..."
```

### purge-cloudflare.ps1
```powershell
# Clear Cloudflare cache
$secrets = Get-Content "$env:ADMIN_TOOLS\gh-pages\secrets.json" | ConvertFrom-Json

$headers = @{
    "Authorization" = "Bearer $($secrets.cloudflare.token)"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$($secrets.cloudflare.zone_id)/purge_cache" -Method POST -Headers $headers -Body '{"purge_everything":true}'
```

### secrets.json
```json
{
  "cloudflare": {
    "token": "your-cloudflare-api-token",
    "zone_id": "your-zone-id"
  },
  "deployment": {
    "api_key": "your-deployment-key"
  }
}
```

## Security Best Practices

1. **Never commit admin tools to the repository**
2. **Use environment variables for sensitive data**
3. **Encrypt sensitive files when possible**
4. **Regularly rotate API keys and tokens**
5. **Limit access to admin tools directory**
6. **Use separate accounts for different environments**

## Integration with Repository

The repository's `.gitignore` includes patterns to prevent accidental commits:

```gitignore
# Personal admin tools (local only)
Admin/
admin-tools/
**/millsy-tools/**
$env:ADMIN_TOOLS/
*.secrets.json
*.env
```

This ensures that even if admin tools are accidentally placed in the repository, they won't be committed.

---

**Remember**: Keep your admin tools separate, secure, and never commit them to the repository!
