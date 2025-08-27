# Getting Started

Welcome to the Documentation Site Template! This guide will help you get started with creating your own documentation site.

## Overview

This template provides a simple foundation for creating documentation sites. It's designed to be easy to use and customize.

## Prerequisites

Before you begin, make sure you have:

- A GitHub account
- Basic knowledge of Markdown
- A text editor

## Quick Start

### 1. Clone the Template

```bash
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate
```

### 2. Customize Content

Edit the files in the `docs/` folder to add your own content:

- `docs/index.md` - Main page
- `docs/getting-started.md` - This guide
- `docs/installation.md` - Installation instructions
- `docs/user-guide.md` - User guide

### 3. Update Configuration

Edit `mkdocs.yml` to customize your site:

```yaml
site_name: Your Project Name
site_description: Your project description
site_author: Your Name
```

### 4. Customize Styling

Modify the CSS files in `assets/css/` to change the appearance:

- `assets/css/main.css` - Main styles
- `assets/css/components.css` - Component styles

### 5. Deploy to GitHub Pages

1. Push your changes to GitHub
2. Go to your repository settings
3. Enable GitHub Pages
4. Your site will be available at `https://yourusername.github.io/your-repo-name/`

## File Structure

```
├── docs/                 # Documentation content
│   ├── index.md         # Main page
│   ├── getting-started.md
│   ├── installation.md
│   └── user-guide.md
├── assets/              # CSS, JS, images
│   ├── css/
│   ├── js/
│   └── images/
├── index.html           # Main HTML file
├── mkdocs.yml          # MkDocs configuration
└── README.md           # Repository README
```

## Customization Tips

### Adding Pages

Create new Markdown files in the `docs/` folder and they'll automatically appear in the navigation.

### Changing Colors

Edit the CSS variables in `assets/css/main.css` to change the color scheme.

### Adding Images

Place images in `assets/images/` and reference them in your Markdown files.

## Next Steps

- Read the [Installation Guide](installation.md) for detailed setup instructions
- Check the [User Guide](user-guide.md) for advanced features
- Customize the styling to match your brand

## Support

If you need help, please refer to the documentation or create an issue in the repository.

---

*Simple documentation template for GitHub Pages*
