# Installation Guide

This guide provides detailed instructions for installing and setting up the Documentation Site Template.

## System Requirements

- **Operating System**: Windows, macOS, or Linux
- **Python**: 3.7 or higher
- **Git**: Latest version
- **Web Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## Installation Methods

### Method 1: Using Git Clone (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/[your-username]/[your-repo-name].git
   cd [your-repo-name]
   ```

2. **Install Python dependencies**

   ```bash
   pip install mkdocs mkdocs-material
   ```

3. **Verify installation**

   ```bash
   mkdocs --version
   ```

### Method 2: Manual Download

1. **Download the repository**
   - Go to the GitHub repository
   - Click "Code" → "Download ZIP"
   - Extract the ZIP file

2. **Install dependencies**

   ```bash
   cd [your-repo-name]
   pip install mkdocs mkdocs-material
   ```

## Configuration

### Basic Setup

1. **Edit site configuration**
   Open `mkdocs.yml` and update the basic information:

   ```yaml
   site_name: Your Documentation Site
   site_description: Your site description
   site_author: Your Name
   site_url: https://[your-username].github.io/[your-repo-name]/
   ```

2. **Update repository information**

   ```yaml
   repo_name: [your-username]/[your-repo-name]
   repo_url: https://github.com/[your-username]/[your-repo-name]
   edit_uri: edit/main/docs/
   ```

### Theme Configuration

The template uses Material for MkDocs theme. You can customize it:

```yaml
theme:
  name: material
  palette:
    - scheme: default
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch
        name: Switch to dark mode
    - scheme: slate
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch-off-outline
        name: Switch to light mode
  features:
    - navigation.tabs
    - navigation.sections
    - navigation.expand
    - search.suggest
    - search.highlight
    - content.code.copy
    - content.code.annotate
```

### Navigation Setup

Configure the navigation structure in `mkdocs.yml`:

```yaml
nav:
  - Home: index.md
  - Getting Started:
    - Installation: getting-started.md
    - Configuration: installation.md
  - Contributing: contributing.md
```

## Development

### Local Development Server

1. **Start the development server**

   ```bash
   mkdocs serve
   ```

2. **Access your site**
   Open your browser and go to `http://127.0.0.1:8000`

3. **Live reload**
   The server automatically reloads when you make changes to your files.

### Building the Site

1. **Build for production**

   ```bash
   mkdocs build
   ```

2. **Build output**
   The built site will be in the `site/` directory.

## Customization

### Adding Custom CSS

1. **Create custom CSS file**

   ```bash
   mkdir -p public/components/styles
   touch public/components/styles/custom.css
   ```

2. **Add your styles**

   ```css
   /* Custom styles */
   .custom-header {
       background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
       color: white;
       padding: 2rem;
   }
   ```

3. **Include in configuration**

   ```yaml
   extra_css:
     - public/components/styles/custom.css
   ```

### Adding Custom JavaScript

1. **Create custom JS file**

   ```bash
   mkdir -p public/components/scripts
   touch public/components/scripts/custom.js
   ```

2. **Add your scripts**

   ```javascript
   // Custom JavaScript
   document.addEventListener('DOMContentLoaded', function() {
       console.log('Documentation site loaded!');
   });
   ```

3. **Include in configuration**

   ```yaml
   extra_javascript:
     - public/components/scripts/custom.js
   ```

## Deployment

### GitHub Pages

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial documentation site"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages"
   - Select "Deploy from a branch"
   - Choose branch: `main` and folder: `/docs`
   - Click "Save"

3. **Your site is live**
   Your documentation will be available at `https://[your-username].github.io/[your-repo-name]/`

### Netlify

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Set build command: `mkdocs build`
   - Set publish directory: `site`

2. **Deploy**
   Netlify will automatically build and deploy your site.

### Custom Domain

1. **Add CNAME file**
   Create `docs/CNAME` with your domain:

   ```
   yourdomain.com
   ```

2. **Configure DNS**
   Add a CNAME record pointing to `millsy102.github.io`

3. **Update configuration**

   ```yaml
   site_url: https://yourdomain.com
   ```

## Troubleshooting

### Common Issues

**Issue**: `mkdocs: command not found`
**Solution**: Make sure Python and pip are installed correctly.

**Issue**: Theme not loading
**Solution**: Install the Material theme: `pip install mkdocs-material`

**Issue**: Site not updating on GitHub Pages
**Solution**: Check that you're using the `/docs` folder as the source.

### Getting Help

- Check the [MkDocs documentation](https://www.mkdocs.org/)
- Review the [Material for MkDocs documentation](https://squidfunk.github.io/mkdocs-material/)
- Create an issue in this repository

## Next Steps

- Read the [Getting Started Guide](getting-started.md)
- Check out the [Contributing Guide](contributing.md)
- Customize the theme and styling
- Add your own content and documentation

---

*Your documentation site is ready!*
