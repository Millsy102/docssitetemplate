# Documentation Site Template

Welcome to the Documentation Site Template - a modern, professional template for creating beautiful documentation with MkDocs and Material theme.

## 🚀 Quick Start

Get started in minutes with our easy-to-use documentation template:

```bash
# Clone the template
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate

# Install dependencies
npm install

# Start development server
npm run docs:dev
```

## ✨ Features

### Modern Documentation
- **MkDocs + Material Theme** - Professional, responsive design
- **Search Functionality** - Fast, full-text search across all content
- **Dark/Light Mode** - Automatic theme switching
- **Mobile Responsive** - Perfect on all devices
- **SEO Optimized** - Built-in SEO features

### Developer Experience
- **Hot Reload** - Instant preview during development
- **Markdown Support** - Write content in Markdown with extensions
- **Code Highlighting** - Syntax highlighting for 100+ languages
- **Version Control** - Git-based content management
- **CI/CD Ready** - Automated deployment to GitHub Pages

## 📚 Documentation Sections

### Getting Started
Learn how to set up and customize your documentation site:

- [Installation Guide](getting-started/installation.md)
- [Configuration](getting-started/configuration.md)
- [Customization](getting-started/customization.md)
- [Deployment](getting-started/deployment.md)

### Features
Explore the powerful features of this template:

- [Theme Customization](features/theme.md)
- [Search Functionality](features/search.md)
- [Code Highlighting](features/code-blocks.md)
- [Admonitions](features/admonitions.md)
- [Navigation](features/navigation.md)

### Advanced
Take your documentation to the next level:

- [Custom Plugins](advanced/plugins.md)
- [Custom CSS/JS](advanced/styling.md)
- [Multi-language](advanced/i18n.md)
- [Analytics](advanced/analytics.md)
- [Performance](advanced/performance.md)

## 🎨 Customization

### Theme Configuration

Customize the appearance of your site by editing `mkdocs.yml`:

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
3. Use Material theme features for rich content

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

### Project Structure

```
docs/
├─ index.md              # This homepage
├─ getting-started/      # Getting started guides
├─ features/            # Feature documentation
├─ advanced/            # Advanced topics
├─ api-reference/       # API documentation
└─ assets/              # Images and static files
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
    return "Documentation is awesome!"
```

### Admonitions

!!! note "Note"
    This template provides a solid foundation for creating professional documentation.

!!! tip "Tip"
    Use Material theme features to create rich, interactive documentation.

!!! warning "Warning"
    Always test your documentation before deploying to production.

### Tabs

=== "Python"
    ```python
    print("Hello from Python!")
    ```

=== "JavaScript"
    ```javascript
    console.log("Hello from JavaScript!");
    ```

=== "Bash"
    ```bash
    echo "Hello from Bash!"
    ```

### Math Support

Inline math: $E = mc^2$

Block math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](../CONTRIBUTING.md) for details.

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

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Documentation**: Browse the docs you're reading right now
- **Issues**: [GitHub Issues](https://github.com/your-username/docssitetemplate/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/docssitetemplate/discussions)

## 🚀 What's Next?

- [Installation Guide](getting-started/installation.md) - Get started quickly
- [Configuration](getting-started/configuration.md) - Customize your site
- [Features](features/theme.md) - Explore powerful features
- [API Reference](api-reference/index.md) - Technical documentation

---

**Documentation Site Template** - Create beautiful, professional documentation with ease.
