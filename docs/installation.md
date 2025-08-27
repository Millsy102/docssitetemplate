# Installation Guide

This guide will help you install and set up the Documentation Site Template.

## Prerequisites

Before you begin, make sure you have:

- **Git** installed on your system
- **A GitHub account** for hosting
- **A text editor** (VS Code, Sublime Text, etc.)
- **Basic knowledge** of HTML, CSS, and Markdown

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate
```

### Step 2: Review the Structure

Take a look at the project structure:

```
docssitetemplate/
├── docs/              # Documentation content
├── assets/            # CSS, JS, and images
├── index.html         # Main page
├── mkdocs.yml         # Configuration
└── README.md          # Project README
```

### Step 3: Customize Content

Edit the files in the `docs/` folder:

- `docs/index.md` - Main documentation page
- `docs/getting-started.md` - Getting started guide
- `docs/installation.md` - This installation guide
- `docs/user-guide.md` - User guide

### Step 4: Update Configuration

Edit `mkdocs.yml` to customize your site:

```yaml
site_name: Your Project Name
site_description: Your project description
site_author: Your Name
repo_url: https://github.com/your-username/your-repo-name
```

### Step 5: Customize Styling

Modify the CSS files in `assets/css/`:

- `assets/css/main.css` - Main styles
- `assets/css/components.css` - Component styles
- `assets/css/animations.css` - Animation styles

### Step 6: Test Locally

If you have MkDocs installed:

```bash
# Install MkDocs (optional)
pip install mkdocs

# Start local server
mkdocs serve
```

Or simply open `index.html` in your browser to preview.

### Step 7: Deploy to GitHub Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial setup"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings"
   - Scroll down to "GitHub Pages"
   - Select "Deploy from a branch"
   - Choose "main" branch
   - Click "Save"

3. **Your site will be available at**
   `https://yourusername.github.io/your-repo-name/`

## Configuration Options

### Site Configuration

Edit `mkdocs.yml` for basic settings:

```yaml
site_name: My Documentation
site_description: Documentation for my project
site_author: John Doe
site_url: https://yourusername.github.io/your-repo-name/
```

### Theme Configuration

Customize the appearance:

```yaml
theme:
  name: material
  palette:
    - scheme: default
      primary: indigo
      accent: indigo
```

### Navigation

Configure the navigation structure:

```yaml
nav:
  - Home: index.md
  - Getting Started: getting-started.md
  - Installation: installation.md
  - User Guide: user-guide.md
```

## Customization

### Adding Pages

1. Create a new Markdown file in the `docs/` folder
2. Add it to the navigation in `mkdocs.yml`
3. Link to it from other pages

### Adding Images

1. Place images in `assets/images/`
2. Reference them in Markdown:
   ```markdown
   ![Alt text](assets/images/image.png)
   ```

### Custom CSS

Add custom styles in `assets/css/main.css`:

```css
/* Custom styles */
.my-custom-class {
    color: #333;
    font-weight: bold;
}
```

## Troubleshooting

### Common Issues

1. **Site not updating**
   - Check GitHub Pages settings
   - Ensure files are pushed to the main branch
   - Wait a few minutes for changes to propagate

2. **Styling not working**
   - Check file paths in CSS references
   - Ensure CSS files are properly linked
   - Clear browser cache

3. **Navigation issues**
   - Verify `mkdocs.yml` configuration
   - Check file names and paths
   - Ensure proper Markdown formatting

### Getting Help

- Check the [Getting Started](getting-started.md) guide
- Review the [User Guide](user-guide.md)
- Create an issue in the repository

## Next Steps

After installation:

1. Customize the content for your project
2. Add your own branding and styling
3. Set up custom domain (optional)
4. Add analytics (optional)

---

*Simple documentation template for GitHub Pages*
