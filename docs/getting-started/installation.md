# Installation Guide

## Prerequisites

- Python 3.8+
- Node.js 18+ (for development tools)
- Git

## Quick Installation

### 1. Clone the Repository

`ash
git clone https://github.com/your-username/docssitetemplate.git
cd docssitetemplate
`

### 2. Install Dependencies

`ash
npm install
`

### 3. Start Development Server

`ash
npm run docs:dev
`

Your documentation site will be available at http://localhost:8000

## Manual Installation

If you prefer to install dependencies manually:

### Install Python Dependencies

`ash
pip install mkdocs mkdocs-material
`

### Install Node.js Dependencies

`ash
npm install broken-link-checker markdownlint-cli
`

## Verification

After installation, verify everything is working:

`ash
# Check MkDocs installation
mkdocs --version

# Check Node.js dependencies
npm list

# Start development server
npm run docs:dev
`

## Next Steps

- [Configuration Guide](configuration.md)
- [Customization Guide](customization.md)
- [Deployment Guide](../advanced/deployment.md)
