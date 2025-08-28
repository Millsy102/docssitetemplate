# Getting Started

Welcome to the Documentation Site Template! This guide will help you get started with creating your own documentation site.

## Prerequisites

Before you begin, make sure you have:

- A GitHub account
- Basic knowledge of Markdown
- A text editor (VS Code, Sublime Text, etc.)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[your-username]/[your-repo-name].git
   cd [your-repo-name]
   ```

2. **Install dependencies** (if using MkDocs)
   ```bash
   pip install mkdocs mkdocs-material
   ```

3. **Start the development server**
   ```bash
   mkdocs serve
   ```

## Basic Configuration

### Site Information

Edit `mkdocs.yml` to customize your site:

```yaml
site_name: Your Documentation Site
site_description: Your site description
site_author: Your Name
site_url: https://[your-username].github.io/[your-repo-name]/
```

### Navigation

Update the navigation in `mkdocs.yml`:

```yaml
nav:
  - Home: index.md
  - Getting Started: getting-started.md
  - Installation: installation.md
  - Contributing: contributing.md
```

## Adding Content

### Creating New Pages

1. Create a new `.md` file in the `docs/` folder
2. Add front matter (optional):
   ```markdown
   ---
   title: Your Page Title
   description: Page description
   ---
   ```
3. Write your content using Markdown
4. Add the page to navigation in `mkdocs.yml`

### Markdown Features

This template supports extended Markdown features:

- **Admonitions**
  ```markdown
  !!! note "Note"
      This is a note.
  ```

- **Code blocks with syntax highlighting**
  ```markdown
  ```python
  def hello_world():
      print("Hello, World!")
  ```
  ```

- **Tables**
  ```markdown
  | Feature | Description |
  |--------|-------------|
  | Markdown | Full support |
  | Search | Built-in |
  | Responsive | Mobile-friendly |
  ```

## Customization

### Theme

The template uses Material for MkDocs theme. You can customize it in `mkdocs.yml`:

```yaml
theme:
  name: material
  palette:
    - scheme: default
      primary: indigo
      accent: indigo
```

### CSS Customization

Add custom CSS by creating `public/components/styles/custom.css`:

```css
/* Your custom styles */
.custom-class {
    color: #ff6b6b;
}
```

## Deployment

### GitHub Pages

1. Push your changes to GitHub
2. Go to repository Settings > Pages
3. Select source: "Deploy from a branch"
4. Choose branch: `main` and folder: `/docs`
5. Click Save

Your site will be available at `https://[your-username].github.io/[your-repo-name]/`

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file in the `docs/` folder with your domain
2. Configure DNS settings with your domain provider
3. Update `site_url` in `mkdocs.yml`

## Next Steps

- Read the [Installation Guide](installation.md) for detailed setup instructions
- Check out the [Contributing Guide](contributing.md) to learn how to contribute
- Customize the theme and styling to match your brand
- Add more content and documentation

## Support

If you need help:

1. Check the [MkDocs documentation](https://www.mkdocs.org/)
2. Review the [Material for MkDocs documentation](https://squidfunk.github.io/mkdocs-material/)
3. Create an issue in this repository

---

*Happy documenting!*
