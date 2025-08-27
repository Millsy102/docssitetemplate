# React Application Test Suite

This directory contains comprehensive unit tests for the BeamFlow documentation site React application. The test suite ensures all components and pages work correctly and maintain their functionality across updates.

## 📁 Test Structure

```
src/__tests__/
├── __mocks__/
│   └── fileMock.js              # Mock for static assets
├── components/
│   ├── Header.test.tsx          # Header component tests
│   └── Sidebar.test.tsx         # Sidebar component tests
├── pages/
│   ├── Home.test.tsx            # Home page tests
│   ├── Installation.test.tsx    # Installation page tests
│   └── NotFound.test.tsx        # 404 page tests
├── utils/
│   └── test-utils.tsx           # Custom test utilities
├── App.test.tsx                 # Main App component tests
└── README.md                    # This file
```

## 🧪 Test Categories

### Component Tests

#### Header Component (`Header.test.tsx`)
Tests the main navigation header component:

- **Rendering Tests**
  - Logo and title display
  - Desktop navigation links
  - Mobile menu button

- **Mobile Menu Functionality**
  - Menu toggle on button click
  - Menu close on Escape key
  - Menu close on navigation link click
  - Menu close on logo click
  - Mobile navigation items

- **Accessibility Tests**
  - ARIA attributes
  - Keyboard navigation
  - Screen reader compatibility

- **Styling Tests**
  - CSS class application
  - Responsive design elements

#### Sidebar Component (`Sidebar.test.tsx`)
Tests the sidebar navigation component:

- **Navigation Items**
  - All navigation links present
  - Correct routing paths
  - Icon display

- **Active State Management**
  - Current page highlighting
  - Inactive page styling
  - Route-based state changes

- **External Links**
  - GitHub repository link
  - Issues link
  - Proper target and rel attributes

- **Quick Links Section**
  - Quick links display
  - External link functionality

### Page Tests

#### Home Page (`Home.test.tsx`)
Tests the main landing page:

- **Content Rendering**
  - Main heading and description
  - Key features section
  - Quick start section
  - System requirements

- **Navigation Links**
  - Installation link
  - Getting started link
  - Internal routing

- **External Links**
  - GitHub issues link
  - Community discussions link
  - Contributing link

- **Styling Verification**
  - Card layouts
  - Color scheme application
  - Responsive design

#### Installation Page (`Installation.test.tsx`)
Tests the installation guide page:

- **Content Sections**
  - Prerequisites list
  - Marketplace installation method
  - Manual installation steps
  - Verification checklist
  - Troubleshooting guide

- **Code Elements**
  - Command examples
  - File paths
  - UI element references

- **External Resources**
  - GitHub issues link
  - Help documentation

#### NotFound Page (`NotFound.test.tsx`)
Tests the 404 error page:

- **Error Display**
  - 404 error code
  - Error message
  - User-friendly description

- **Navigation Options**
  - Go home button
  - Alternative page links
  - Internal routing

- **Styling**
  - Error page layout
  - Button styling
  - Link styling

### App Component Tests (`App.test.tsx`)
Tests the main application wrapper:

- **Component Integration**
  - Header rendering
  - Sidebar rendering
  - Main content area
  - Router setup

- **Navigation Structure**
  - Route configuration
  - Link presence
  - Component hierarchy

## 🚀 Running Tests

### Prerequisites
Ensure all dependencies are installed:
```bash
npm install
```

### Running All Tests
```bash
npm test
```

### Running Tests with Coverage
```bash
npm run test:coverage
```

### Running Specific Test Files
```bash
# Run only component tests
npm test -- components/

# Run only page tests
npm test -- pages/

# Run a specific test file
npm test -- Header.test.tsx
```

### Watch Mode
```bash
npm test -- --watch
```

## 📊 Test Coverage

The test suite aims for comprehensive coverage including:

- **Component Rendering**: All components render without errors
- **User Interactions**: Click events, keyboard navigation, form interactions
- **Navigation**: Internal routing, external links, active states
- **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
- **Styling**: CSS class application, responsive design
- **Error Handling**: 404 pages, error states
- **Content**: Text content, images, links

### Coverage Thresholds
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## 🛠️ Test Utilities

### Custom Render Function (`test-utils.tsx`)
Provides a custom render function that includes:
- React Router context
- Browser environment simulation
- Common test helpers

### Mock Files
- **fileMock.js**: Mocks static assets (images, CSS, etc.)
- **setupTests.ts**: Global test configuration and mocks

## 🔧 Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom for browser simulation
- **Transform**: TypeScript support with ts-jest
- **Coverage**: HTML, LCOV, and text reports
- **Mocking**: CSS and static asset mocking

### Test Setup (`setupTests.ts`)
- **Testing Library**: Jest DOM matchers
- **Global Mocks**: Window APIs, IntersectionObserver, ResizeObserver
- **Configuration**: Custom test ID attribute

## 📝 Writing New Tests

### Component Test Template
```typescript
import React from 'react';
import { render, screen, fireEvent } from '../utils/test-utils';
import YourComponent from '../../components/YourComponent';

describe('YourComponent', () => {
  it('renders without crashing', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    render(<YourComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Assert expected behavior
  });

  it('has correct styling', () => {
    render(<YourComponent />);
    const element = screen.getByText('Text');
    expect(element).toHaveClass('expected-class');
  });
});
```

### Test Best Practices
1. **Test Behavior, Not Implementation**: Focus on what users see and do
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test Accessibility**: Ensure components work with screen readers
4. **Mock External Dependencies**: Mock APIs, timers, and browser APIs
5. **Group Related Tests**: Use describe blocks to organize test cases
6. **Write Descriptive Test Names**: Clear, action-oriented test descriptions

## 🐛 Debugging Tests

### Common Issues
1. **Import Errors**: Check file paths and TypeScript configuration
2. **Mock Issues**: Ensure mocks are properly configured
3. **Async Tests**: Use `waitFor` for asynchronous operations
4. **Router Context**: Use custom render function for components with routing

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run tests with coverage and watch
npm test -- --coverage --watch

# Debug specific test
npm test -- --testNamePattern="Component Name"
```

## 📈 Continuous Integration

Tests are automatically run in CI/CD pipelines:
- **Pre-commit**: Linting and basic tests
- **Pull Requests**: Full test suite with coverage
- **Deployment**: Integration tests and build verification

## 🤝 Contributing

When adding new features or components:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage thresholds
4. Update this documentation if needed

For questions about testing, refer to:
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
