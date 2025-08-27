# Beam Website System - Public Documentation Façade

> **⚠️ IMPORTANT: This repository contains ONLY the public documentation façade.**  
> All private application code, admin tools, and real features live in `~/millsy-admin` (personal folder).  
> This repo serves as a generic docs template for GitHub Pages.

## 🚀 Overview

This is a **public documentation façade** that demonstrates a modern website system architecture. The actual application code and private features are kept separate in a personal development folder (`~/millsy-admin`) to maintain security and separation of concerns.

### Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC REPO (GitHub Pages)               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   Docs Façade   │  │  Encrypted      │  │  GitHub      │ │
│  │   (Template)    │  │  Blobs (opt)    │  │  Workflows   │ │
│  │                 │  │                 │  │              │ │
│  │ • Basic Docs    │  │ • manifest.enc  │  │ • CI/CD      │ │
│  │ • Demo Features │  │ • key.enc       │  │ • Pages      │ │
│  │ • Limited API   │  │ • chunks/*.enc  │  │ • Quality    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                 PRIVATE FOLDER (~/millsy-admin)             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Private App    │  │  Admin Tools    │  │  Build       │ │
│  │  (Real Site)    │  │  & Scripts      │  │  Scripts     │ │
│  │                 │  │                 │  │              │ │
│  │ • Full Features │  │ • build.sh      │  │ • encrypt.js │ │
│  │ • Admin Panel   │  │ • deploy.sh     │  │ • sync.sh    │ │
│  │ • Real API      │  │ • tools/        │  │ • dist/      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Repository Structure

### Public (GitHub Pages - This Repo)
```
docssitetemplate/              # public repo (visible to everyone)
├─ public/                     # façade: generic docs template only
│  ├─ index.html
│  ├─ css/
│  └─ js/
├─ docs/                       # public documentation
├─ encrypted/                  # encrypted blobs of private app (optional)
│  ├─ manifest.enc
│  ├─ key.enc
│  └─ chunks/*.js.enc
├─ .github/workflows/          # Pages deploy + CI quality
├─ .gitignore                  # ignores private/admin/local folders
└─ README.md                   # explains façade + setup
```

### Private (Personal Folder - NOT in this repo)
```
%USERPROFILE%/millsy-admin/    # Windows
~/millsy-admin/                # macOS/Linux

  sites/
    beam-site/
      private-app/             # ← your full real site lives here
        src/
        public/
        package.json
        tsconfig.json
        ...
        dist/                  # build output (never committed)

      encrypt/                 # encryption helpers
        encrypt.js

  bin/                         # admin scripts (non-essential)
  templates/                   # scaffolding templates
  tmp/                         # scratch builds
```

## 🔐 Security Model

### Public Access (GitHub Pages)
- **Generic documentation template** - showcases basic features
- **Demo content only** - no real functionality
- **Limited API endpoints** - public examples only
- **Marketing content** - project overview and setup guides

### Private Access (Personal Folder)
- **Full application code** - complete feature set
- **Admin tools and scripts** - development utilities
- **Real database and API** - production functionality
- **Sensitive configuration** - environment variables, secrets

## 🛠️ Development Workflow

### Option A: Personal Folder (Recommended)
```bash
# 1. Build the real site locally (personal folder)
~/millsy-admin/bin/build_private.sh beam-site

# 2. (Optional) Encrypt & sync ciphertext to public repo
~/millsy-admin/bin/encrypt_private.sh beam-site /path/to/public-repo

# 3. Commit + push from public repo (façade only)
cd /path/to/public-repo
git add encrypted public .github README.md .gitignore
git commit -m "chore: update encrypted bundle + façade"
git push origin main
```

### Option B: Private Repo + VPS
- **Public repo**: This façade (GitHub Pages)
- **Private repo**: `github.com/you/private-real-app`
- **VPS**: `app.yourdomain.tld` behind Cloudflare Access

## 📦 Installation (Public Façade Only)

This repository contains only the public documentation façade. To work with the full application:

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Personal development folder setup

### Quick Start (Public Façade)

```bash
# Clone the public façade repository
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate

# Install dependencies (for docs generation only)
npm install

# Start documentation server
npm run docs:serve
```

### Full Application Setup

The complete application setup is documented in the private development folder. This public repo contains only the façade and basic documentation.

## 🔧 Configuration

### Environment Variables (Public Façade)
```env
# Documentation server
DOCS_PORT=3000
DOCS_HOST=localhost

# Build configuration
NODE_ENV=production
```

### Private Application Configuration
Private application configuration lives in `~/millsy-admin/sites/beam-site/private-app/` and is not committed to this public repository.

## 🚀 Deployment

### GitHub Pages (Public Façade)
This repository is configured for automatic deployment to GitHub Pages via GitHub Actions. The workflow:

1. Builds the documentation site
2. Deploys to GitHub Pages
3. Runs quality checks and link validation

### Private Application Deployment
Private application deployment is handled by scripts in the personal development folder (`~/millsy-admin/bin/`).

## 📚 Documentation

### Public Documentation
- [Getting Started](./docs/getting-started.md) - Basic setup guide
- [Architecture](./docs/architecture.md) - System overview
- [Contributing](./CONTRIBUTING.md) - How to contribute to the façade

### Private Documentation
Private application documentation lives in the personal development folder and is not accessible from this public repository.

## 🤝 Contributing

This repository accepts contributions to the **public documentation façade only**. All private application code contributions should be made to the private development folder or private repository.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **Public Façade**: This repository (GitHub Pages)
- **Private App**: `~/millsy-admin/sites/beam-site/private-app/`
- **Admin Tools**: `~/millsy-admin/bin/`

---

> **Note**: This repository serves as a demonstration of the docs façade pattern. The actual application functionality is maintained separately in a private development environment for security and maintainability.
