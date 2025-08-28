# Vercel Deployment Setup Guide

##  Current Issue
Your builds are not being sent to Vercel because the required authentication token is missing.

##  Required Setup

### 1. Get Your Vercel Token

1. **Go to Vercel Account Settings**:
   - Visit: https://vercel.com/account/tokens
   - Sign in to your Vercel account

2. **Create a New Token**:
   - Click "Create Token"
   - Give it a name like "GitHub Actions Deployment"
   - Set expiration to "No expiration" (or choose a date)
   - Click "Create"

3. **Copy the Token**:
   - Copy the generated token (it starts with `vercel_`)
   - **Keep this secure** - you won't be able to see it again

### 2. Add Token to GitHub Secrets

1. **Go to Your Repository**:
   - Visit: https://github.com/[your-username]/[your-repo-name]

2. **Navigate to Settings**:
   - Click "Settings" tab
   - Click "Secrets and variables" → "Actions"

3. **Add the Secret**:
   - Click "New repository secret"
   - Name: `VERCEL_TOKEN`
   - Value: Paste your Vercel token
   - Click "Add secret"

### 3. Optional: Add Project IDs (Recommended)

For better deployment control, also add these secrets:

1. **Get Vercel Project ID**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings → General
   - Copy the "Project ID"

2. **Get Vercel Org ID**:
   - In the same settings page
   - Copy the "Team ID" (this is your org ID)

3. **Add to GitHub Secrets**:
   - `VERCEL_PROJECT_ID`: Your project ID
   - `VERCEL_ORG_ID`: Your team/org ID

##  Test the Deployment

### Option 1: Manual Trigger
1. Go to your repository's "Actions" tab
2. Select "Deploy to Vercel" workflow
3. Click "Run workflow" → "Run workflow"

### Option 2: Push to Main
1. Make any change to your code
2. Commit and push to the `main` branch
3. The workflow will automatically trigger

##  What Was Fixed

### 1. Updated `vercel.json`
- Added `buildCommand`: `npm run build`
- Added `outputDirectory`: `dist`
- Added `installCommand`: `npm ci`

### 2. Created New Workflow
- `vercel-deploy.yml`: Simplified deployment workflow
- Triggers on all pushes to main branch
- Better error handling and feedback

### 3. Updated Existing Workflow
- `deploy-secret.yml`: Removed path restrictions
- Added better error handling for missing tokens

##  Troubleshooting

### If Deployment Still Fails:

1. **Check GitHub Actions Logs**:
   - Go to Actions tab
   - Click on the failed workflow
   - Look for error messages

2. **Common Issues**:
   - **Token not set**: Add VERCEL_TOKEN to secrets
   - **Build fails**: Check if `npm run build` works locally
   - **Permission denied**: Ensure token has proper permissions

3. **Verify Vercel Project**:
   - Make sure your project exists on Vercel
   - Check that the domain is properly configured

##  Support

If you continue having issues:
1. Check the GitHub Actions logs for specific error messages
2. Verify your Vercel token has the correct permissions
3. Ensure your Vercel project is properly set up

##  Expected Result

After following these steps, you should see:
-  Successful deployments in GitHub Actions
-  Your site live at `[your-repo-name].vercel.app`
-  Automatic deployments on every push to main
