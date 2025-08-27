# Documentation Site Template

A modern, professional documentation site template built with MkDocs and Material theme. Perfect for creating beautiful documentation for your projects, APIs, or technical guides.

## 🚀 Features

### Modern Documentation
- **MkDocs + Material Theme** - Professional, responsive documentation
- **Search Functionality** - Fast, full-text search across all content
- **Dark/Light Mode** - Automatic theme switching
- **Mobile Responsive** - Works perfectly on all devices
- **SEO Optimized** - Built-in SEO features and meta tags

### Developer Experience
- **Hot Reload** - Instant preview during development
- **Markdown Support** - Write content in Markdown with extensions
- **Code Highlighting** - Syntax highlighting for 100+ languages
- **Version Control** - Git-based content management
- **CI/CD Ready** - Automated deployment to GitHub Pages

### Customization
- **Theme Customization** - Easy color schemes and branding
- **Plugin System** - Extensible with MkDocs plugins
- **Custom CSS/JS** - Add your own styling and functionality
- **Multi-language** - Support for internationalization
- **Analytics** - Built-in Google Analytics support

## 📦 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+ (for development tools)
- Git

### Installation

```bash
# Clone the template
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

### Build and Deploy

```bash
# Build documentation
npm run docs:build

# Deploy to GitHub Pages
npm run docs:deploy
```

## 🏗️ Project Structure

```
docssitetemplate/
├─ docs/                    # Documentation source
│  ├─ index.md             # Homepage
│  ├─ getting-started.md   # Quick start guide
│  ├─ api-reference.md     # API documentation
│  └─ assets/              # Images and static files
├─ public/                 # Public assets
│  ├─ css/                 # Custom stylesheets
│  ├─ js/                  # Custom JavaScript
│  └─ images/              # Public images
├─ scripts/                # Build and utility scripts
├─ .github/                # GitHub Actions workflows
├─ mkdocs.yml             # MkDocs configuration
└─ package.json           # Node.js dependencies
```

## 🎨 Customization

### Theme Configuration

Edit `mkdocs.yml` to customize your site:

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
```

### Adding Content

1. Create new Markdown files in the `docs/` directory
2. Update `mkdocs.yml` to include them in navigation
3. Use Material theme features like admonitions and code blocks

### Custom Styling

Add custom CSS in `public/css/custom.css`:

```css
/* Custom styles */
:root {
  --md-primary-fg-color: #3f51b5;
  --md-primary-fg-color--light: #757de8;
  --md-primary-fg-color--dark: #002984;
}
```

## 🔧 Development

### Local Development

```bash
# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Validate links
npm run validate-links
```

### Adding New Pages

1. Create a new `.md` file in `docs/`
2. Add it to the navigation in `mkdocs.yml`
3. Use Material theme features for rich content

### Custom Plugins

Install and configure MkDocs plugins in `mkdocs.yml`:

```yaml
plugins:
  - search
  - git-revision-date-localized
  - minify:
      minify_html: true
```

## 🚀 Deployment

### GitHub Pages

This template is configured for automatic deployment to GitHub Pages:

1. Push to `main` branch
2. GitHub Actions builds and deploys automatically
3. Site available at `https://yourusername.github.io/docssitetemplate`

### Custom Domain

1. Add your domain to repository settings
2. Update `mkdocs.yml` with your domain
3. Configure DNS records

## 📚 Documentation Features

### Code Blocks

```python
def hello_world():
    print("Hello, World!")
```

### Admonitions

!!! note "Note"
    This is a note block with important information.

!!! warning "Warning"
    This is a warning block.

!!! tip "Tip"
    This is a helpful tip.

### Tabs

=== "Python"
    ```python
    print("Hello from Python!")
    ```

=== "JavaScript"
    ```javascript
    console.log("Hello from JavaScript!");
    ```

### Math Support

Inline math: $E = mc^2$

Block math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/docssitetemplate.git

# Install dependencies
npm install

# Start development
npm run docs:dev

# Run tests
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/docssitetemplate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/docssitetemplate/discussions)

## 🚀 What's Next?

- [Getting Started Guide](docs/getting-started.md)
- [API Reference](docs/api-reference.md)
- [Customization Guide](docs/customization.md)
- [Deployment Guide](docs/deployment.md)

---

**Documentation Site Template** - Create beautiful, professional documentation with ease.
