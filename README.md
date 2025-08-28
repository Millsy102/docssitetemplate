# BeamFlow Documentation

A modern, responsive documentation site for the BeamFlow Unreal Engine plugin.

## Overview

BeamFlow is a powerful plugin that enhances Unreal Engine development with advanced AI integration, performance optimization tools, and enhanced development workflows.

## Features

-  **Modern React + Vite** - Fast development and build times
-  **Red & Black Theme** - Consistent with BeamFlow branding
-  **Responsive Design** - Works on all devices
-  **Static Site** - Optimized for GitHub Pages
-  **SEO Optimized** - Proper meta tags and structure
-  **Comprehensive Docs** - Installation, getting started, and contributing guides

## Quick Start

### Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Millsy102/docssitetemplate.git
   cd docssitetemplate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Testing

The project includes a comprehensive test suite to ensure code quality and functionality.

#### Running Tests

**All Tests**
```bash
npm test
```

**Tests with Coverage Report**
```bash
npm run test:coverage
```

**Watch Mode (for development)**
```bash
npm test -- --watch
```

**Specific Test Files**
```bash
# Run only component tests
npm test -- components/

# Run only page tests
npm test -- pages/

# Run a specific test file
npm test -- Header.test.tsx
```

**Verbose Output**
```bash
npm test -- --verbose
```

#### Test Coverage

The test suite includes:
- **Component Tests**: Header, Sidebar, and other UI components
- **Page Tests**: Home, Installation, Getting Started, and 404 pages
- **Integration Tests**: App routing and navigation
- **Accessibility Tests**: ARIA attributes and keyboard navigation

Coverage thresholds are set to 70% for branches, functions, lines, and statements.

#### Test Environment

Tests run in a JSDOM environment with:
- React Testing Library for component testing
- Jest for test framework
- TypeScript support
- CSS and static asset mocking

#### Additional Testing Tools

**Environment Testing**
```bash
npm run test:env
```

**Script Testing**
```bash
# Run script tests
node scripts/test-runner.js

# Run simple tests
node scripts/simple-test.js
```

For detailed testing documentation, see [`src/__tests__/README.md`](src/__tests__/README.md).

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

### Deployment

This site is automatically deployed to GitHub Pages via GitHub Actions when you push to the `main` branch.

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration
├── tailwind.config.js # Tailwind CSS config
└── package.json       # Dependencies and scripts
```

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing

## Customization

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route to `src/App.tsx`
3. Add navigation link to `src/components/Sidebar.tsx`

### Styling

The site uses Tailwind CSS with a custom red and black theme. Colors are defined in:
- `tailwind.config.js` - Tailwind configuration
- `src/index.css` - CSS custom properties
- `src/App.css` - Component styles

### Content

Update the content in the page components:
- `src/pages/Home.tsx` - Landing page
- `src/pages/Installation.tsx` - Installation guide
- `src/pages/GettingStarted.tsx` - Getting started guide
- `src/pages/Contributing.tsx` - Contributing guidelines

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run dev`
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

*BeamFlow Documentation - Powered by React + Vite*
