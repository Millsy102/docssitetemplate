# Dual-Layer Website Setup

This repository implements a **dual-layer website system** where there are two distinct layers:

## Layer 1: Public Documentation Template (`docs/` folder)

**Purpose**: A basic, clean documentation template visible to everyone

**Location**: `docs/` folder in the repository root

**Content**:
- Basic documentation template
- Getting started guide
- Installation instructions
- Contributing guidelines
- Simple, generic content

**Access**: Public - visible to anyone who visits the repository

**Deployment**: Can be deployed to GitHub Pages as a basic docs site

## Layer 2: Private Full Website (Root directory)

**Purpose**: The complete, full-featured website with all functionality

**Location**: Root directory and various folders (`assets/`, `scripts/`, `dist/`, etc.)

**Content**:
- Complete website with all features
- Authentication system
- Admin dashboard
- Full functionality
- Secret content and features

**Access**: Private - only accessible after login/authentication

**Deployment**: Hosted separately with proper authentication

## How It Works

### Public View (GitHub/Unauthenticated)
- Visitors see only the basic documentation template in `docs/`
- Clean, professional appearance
- No access to private content
- Appears as a standard documentation site

### Private View (Authenticated)
- After login, users access the full website
- Complete functionality and features
- Admin tools and private content
- Full website experience

## File Organization

```
Repository Root/
├── docs/                    # PUBLIC - Basic template
│   ├── index.md
│   ├── getting-started.md
│   ├── installation.md
│   ├── contributing.md
│   └── README.md
├── assets/                  # PRIVATE - Full website assets
├── scripts/                 # PRIVATE - Full website scripts
├── dist/                    # PRIVATE - Built full website
├── private/                 # PRIVATE - Secret content
├── index.html              # PRIVATE - Main website
├── mkdocs.yml              # PUBLIC - Docs configuration
└── .gitignore              # Controls what's public/private
```

## Security Considerations

### What's Public
- `docs/` folder contents
- `mkdocs.yml` configuration
- Basic template files
- Repository README

### What's Private
- Full website files in root directory
- `assets/`, `scripts/`, `dist/` folders
- `private/` folder
- Authentication and security files
- Database and sensitive data

## Benefits

1. **Security**: Private content is properly separated
2. **Professional Appearance**: Public docs look clean and professional
3. **Flexibility**: Can deploy docs separately from full website
4. **Maintenance**: Easy to update docs without affecting private content
5. **Compliance**: Clear separation of public vs private content

## Deployment Strategy

### Documentation Site
- Deploy `docs/` folder to GitHub Pages
- Use as public-facing documentation
- Separate from main website

### Full Website
- Deploy from root directory with authentication
- Host on secure server with proper access controls
- Separate domain/subdomain if needed

## Maintenance

### Updating Public Docs
- Edit files in `docs/` folder
- Update `mkdocs.yml` if needed
- Push changes to GitHub
- Docs site updates automatically

### Updating Private Website
- Edit files in root directory
- Build and deploy to secure hosting
- Ensure authentication is working
- Test private functionality

## Best Practices

1. **Keep docs simple**: Don't reveal private functionality in public docs
2. **Regular updates**: Keep both layers current
3. **Security first**: Never commit sensitive data to public repository
4. **Clear separation**: Maintain clear boundaries between public and private content
5. **Documentation**: Keep this setup documented for team members

---

*This dual-layer approach provides both security and flexibility for your website deployment.*
