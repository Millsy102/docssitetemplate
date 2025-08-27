# Contributing

Thank you for your interest in contributing to Project Name! This document provides guidelines and information for contributors.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- A code editor (VS Code recommended)
- Basic knowledge of JavaScript/TypeScript

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/your-username/project-name.git
cd project-name
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/original-owner/project-name.git
```

## Development Setup

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file with the following variables:

```bash
# API Configuration
API_BASE_URL=http://localhost:3000
API_KEY=your-api-key

# Database
DATABASE_URL=postgresql://localhost/project_name_dev

# Authentication
JWT_SECRET=your-jwt-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=debug
NODE_ENV=development
```

### Running the Application

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm start
```

### Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed database
npm run db:seed

# Reset database
npm run db:reset
```

## Code Style

### JavaScript/TypeScript

We use ESLint and Prettier for code formatting. Configure your editor to format on save.

```bash
# Check code style
npm run lint

# Fix code style issues
npm run lint:fix

# Type checking
npm run type-check
```

### ESLint Configuration

```json
{
  "extends": [
    "@projectname/eslint-config",
    "@projectname/eslint-config/typescript"
  ],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.jsx`)
- **Utilities**: camelCase (e.g., `formatDate.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.js`)
- **Types**: PascalCase (e.g., `UserTypes.ts`)

### Import Organization

```javascript
// 1. External libraries
import React from 'react';
import { useState, useEffect } from 'react';

// 2. Internal modules
import { api } from '@/lib/api';
import { formatDate } from '@/utils/date';

// 3. Components
import { Button } from '@/components/Button';
import { UserCard } from '@/components/UserCard';

// 4. Types
import type { User } from '@/types/user';
```

## Testing

### Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # End-to-end tests
└── fixtures/      # Test data
```

### Writing Tests

```javascript
// Example test
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';

describe('UserProfile', () => {
  it('displays user information correctly', () => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    };

    render(<UserProfile user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<UserProfile user={null} loading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- UserProfile.test.js

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

### Coverage Requirements

- **Unit tests**: 80% minimum coverage
- **Integration tests**: 70% minimum coverage
- **Critical paths**: 100% coverage required

## Pull Request Process

### Before Submitting

1. **Update documentation** for any new features
2. **Add tests** for new functionality
3. **Update changelog** if needed
4. **Ensure all tests pass**
5. **Check code style** with linter

### Pull Request Template

```markdown
## Description

Brief description of changes made.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

## Screenshots (if applicable)

Add screenshots to help explain your changes.

## Additional Notes

Any additional information or context.
```

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Approval** from at least one maintainer
4. **Merge** after approval

### Commit Message Format

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

Examples:

```
feat(auth): add OAuth2 authentication support

fix(api): resolve user creation validation error

docs(readme): update installation instructions

test(components): add unit tests for UserProfile component
```

## Issue Reporting

### Bug Reports

Use the bug report template:

```markdown
## Bug Description

Clear and concise description of the bug.

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

What you expected to happen.

## Actual Behavior

What actually happened.

## Environment

- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Node.js version: [e.g. 18.0.0]

## Additional Context

Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
## Problem Statement

A clear and concise description of what the problem is.

## Proposed Solution

A clear and concise description of what you want to happen.

## Alternative Solutions

A clear and concise description of any alternative solutions you've considered.

## Additional Context

Add any other context or screenshots about the feature request here.
```

## Community Guidelines

### Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

### Communication

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Discord**: For real-time chat and community support
- **Email**: For security issues (security@projectname.com)

### Recognition

Contributors are recognized in several ways:

- **Contributors list** on GitHub
- **Release notes** for significant contributions
- **Hall of Fame** on our website
- **Swag** for major contributions

### Mentorship

New contributors can:

- Ask for help in GitHub Discussions
- Request a mentor through our mentorship program
- Join our contributor onboarding sessions
- Review our [Contributor Guide](CONTRIBUTOR_GUIDE.md)

## Getting Help

### Resources

- [Documentation](https://docs.projectname.com)
- [API Reference](https://docs.projectname.com/api)
- [Examples](https://github.com/projectname/examples)
- [Community Forum](https://community.projectname.com)

### Contact

- **General Questions**: GitHub Discussions
- **Security Issues**: security@projectname.com
- **Maintainers**: @maintainers on GitHub

## License

By contributing to Project Name, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

Thank you for contributing to Project Name! 🚀
