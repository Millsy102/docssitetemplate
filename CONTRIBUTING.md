# Contributing to BeamFlow Documentation

Thank you for your interest in contributing to the BeamFlow Documentation site! This document provides guidelines and information for contributors.

##  Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Repository Structure](#repository-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)

##  Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

##  Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/Millsy102/docssitetemplate.git
   cd docssitetemplate
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

##  Development Workflow

### Repository Structure

Follow the established repository structure:

```
<repo-root>/
├─ .github/                    # CI/CD workflows and templates
├─ docs/                       # Documentation markdown files
├─ assets/                     # Static assets (images, etc.)
├─ src/                        # React source code
│  ├─ components/              # React components
│  ├─ pages/                   # Page components
│  ├─ App.tsx                  # Main app component
│  └─ main.tsx                 # Entry point
├─ public/                     # Public static files
├─ scripts/                    # Build-time helpers
└─ dist/                       # Build output (ignored)
```

### Personal Admin Tools

**Important**: All non-essential, sensitive, or admin-only scripts should be placed outside the repository in your personal admin tools directory:

```
$env:ADMIN_TOOLS/gh-pages/
├─ deploy-local.ps1           # Manual deployment scripts
├─ purge-cloudflare.ps1       # Cache management
├─ secrets.json               # API keys (never commit)
└─ ...
```

##  Coding Standards

### Naming Convention

- All code elements should start with the "Beam" prefix
- Avoid duplicate names across the codebase
- Use descriptive, meaningful names

### Code Style

- Follow existing code formatting
- Use consistent indentation (2 spaces)
- Add comments for complex logic
- Keep functions focused and small

### File Organization

- Group related functionality together
- Use clear, descriptive file names
- Follow the established directory structure

##  Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testPathPattern=filename
```

### Writing Tests

- Write tests for new features
- Ensure good test coverage
- Use descriptive test names
- Follow the existing test patterns

##  Documentation

### Documentation Standards

- Write clear, concise documentation
- Include code examples where appropriate
- Keep documentation up to date
- Use proper markdown formatting

### Documentation Locations

- **Public docs**: `/docs/` directory
- **Component documentation**: Update component files with JSDoc comments
- **README**: Update main README.md for significant changes
- **Installation guide**: `/docs/installation.md`
- **Getting started**: `/docs/getting-started.md`

##  Submitting Changes

### Commit Guidelines

- Use clear, descriptive commit messages
- Follow conventional commit format:
  ```
  type(scope): description
  
  [optional body]
  [optional footer]
  ```
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process

1. Ensure your code follows the coding standards
2. Update documentation as needed
3. Add tests for new functionality
4. Run the full test suite
5. Update the CHANGELOG.md if applicable
6. Submit a pull request with a clear description

### Pull Request Template

Use the provided pull request template and fill in all required sections:

- **Description**: What does this PR do?
- **Type of change**: Bug fix, feature, documentation, etc.
- **Testing**: How was this tested?
- **Checklist**: Confirm all requirements are met

##  Build and Deployment

### Local Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### CI/CD

- All CI/CD workflows are in `.github/workflows/`
- Automated testing and deployment
- Quality checks run on every PR
- Deployment to GitHub Pages on merge to main

##  Getting Help

- Check existing documentation
- Search existing issues
- Create a new issue with clear details
- Join our community discussions

##  License

By contributing to BeamFlow Documentation, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to BeamFlow Documentation! 
