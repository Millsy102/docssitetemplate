# GitHub Pages Secret Website Setup

This guide will help you set up GitHub Pages to host your website as a secret/private site.

##  Quick Setup

### 1. Repository Settings
1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**

### 2. Enable GitHub Pages
- The workflow files are already configured
- GitHub will automatically detect and use the `.github/workflows/deploy.yml` file
- Your site will be built and deployed automatically on every push to the `main` branch

### 3. Access Your Site
- Your site will be available at: `https://[your-username].github.io/[repository-name]/`
- For example: `https://yourusername.github.io/your-repo-name/`

##  Making Your Site "Secret"

### Option 1: Private Repository
1. Go to repository **Settings** → **General**
2. Scroll down to **Danger Zone**
3. Click **Change repository visibility**
4. Select **Make private**
5. Only you and collaborators you invite will be able to see the repository

### Option 2: Password Protection (Advanced)
- You can add basic authentication using JavaScript
- Add a simple login form to your `index.html`
- Store credentials in environment variables

### Option 3: Custom Domain (Optional)
1. In repository **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Add a `CNAME` file in your `public` folder with your domain
4. Configure DNS settings with your domain provider

##  File Structure
```
your-repo/
├── public/                 # Your website files
│   ├── index.html         # Main page
│   ├── assets/            # CSS, JS, images
│   └── components/        # Additional components
├── .github/workflows/
│   ├── deploy.yml         # Main deployment workflow
│   └── pages.yml          # GitHub Pages workflow
└── README.md
```

##  Customization

### Update Site Content
- Edit files in the `public/` folder
- Push changes to trigger automatic deployment
- Your site updates within minutes

### Custom Build Process
- Modify the build steps in `.github/workflows/deploy.yml`
- Add build tools like Webpack, Vite, or other bundlers
- The workflow will run your build process before deployment

### Environment Variables
- Add secrets in repository **Settings** → **Secrets and variables** → **Actions**
- Use them in your workflow with `${{ secrets.SECRET_NAME }}`

##  Security Tips

1. **Never commit sensitive data** (API keys, passwords, etc.)
2. **Use environment variables** for configuration
3. **Keep dependencies updated** regularly
4. **Review workflow permissions** in Settings → Actions → General

##  Monitoring

- Check deployment status in **Actions** tab
- View build logs for debugging
- Monitor site performance with GitHub's built-in analytics

##  Troubleshooting

### Common Issues:
1. **Build fails**: Check the Actions tab for error logs
2. **Site not updating**: Ensure you're pushing to the `main` branch
3. **404 errors**: Verify `index.html` exists in the `public` folder
4. **Permission errors**: Check repository settings and workflow permissions

### Getting Help:
- Check GitHub Pages documentation
- Review workflow logs in the Actions tab
- Ensure all file paths are correct

---

Your secret website is now ready! 
