# Beam Component Library

## Overview

The Beam Component Library provides a comprehensive set of reusable UI components designed specifically for GitHub Pages websites. All components follow the Beam naming convention and are optimized for performance, accessibility, and maintainability.

## Core Components

### Layout Components

#### BeamLayout
The main layout wrapper that provides consistent structure across all pages.

```jsx
import { BeamLayout } from './components/BeamLayout';

function App() {
  return (
    <BeamLayout>
      {/* Your page content */}
    </BeamLayout>
  );
}
```

#### BeamHeader
Responsive header component with navigation and search functionality.

**Props:**
- `isScrolled` (boolean): Controls header appearance based on scroll position

```jsx
import { BeamHeader } from './components/BeamHeader';

<BeamHeader isScrolled={isScrolled} />
```

#### BeamFooter
Consistent footer component with links and branding.

```jsx
import { BeamFooter } from './components/BeamFooter';

<BeamFooter />
```

### Widget Components

#### BeamButton
Versatile button component with multiple variants and states.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean - Shows loading spinner
- `disabled`: boolean - Disables the button

```jsx
import { BeamButton } from './components/widgets';

<BeamButton variant="primary" size="md" loading={false}>
  Click Me
</BeamButton>
```

#### BeamCard
Flexible card component for content containers.

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'flat'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `hover`: boolean - Adds hover effects
- `onClick`: function - Click handler

```jsx
import { BeamCard, BeamCardHeader, BeamCardBody, BeamCardFooter } from './components/widgets';

<BeamCard variant="elevated" padding="lg">
  <BeamCardHeader>
    <h3>Card Title</h3>
  </BeamCardHeader>
  <BeamCardBody>
    <p>Card content goes here</p>
  </BeamCardBody>
  <BeamCardFooter>
    <BeamButton>Action</BeamButton>
  </BeamCardFooter>
</BeamCard>
```

#### BeamModal
Modal dialog component with backdrop and keyboard support.

**Props:**
- `isOpen`: boolean - Controls modal visibility
- `onClose`: function - Close handler
- `title`: string - Modal title
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean - Shows close button
- `closeOnOverlayClick`: boolean - Closes on backdrop click

```jsx
import { BeamModal, BeamModalFooter } from './components/widgets';

<BeamModal 
  isOpen={isModalOpen} 
  onClose={() => setIsModalOpen(false)}
  title="Example Modal"
  size="md"
>
  <p>Modal content goes here</p>
  <BeamModalFooter>
    <BeamButton variant="secondary" onClick={() => setIsModalOpen(false)}>
      Cancel
    </BeamButton>
    <BeamButton variant="primary">
      Confirm
    </BeamButton>
  </BeamModalFooter>
</BeamModal>
```

#### BeamInput
Form input component with validation states and icons.

**Props:**
- `label`: string - Input label
- `error`: string - Error message
- `success`: string - Success message
- `helperText`: string - Helper text
- `leftIcon`: React component - Left icon
- `rightIcon`: React component - Right icon

```jsx
import { BeamInput } from './components/widgets';
import { Mail, Lock } from 'lucide-react';

<BeamInput
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  leftIcon={Mail}
  error="Please enter a valid email address"
/>

<BeamInput
  label="Password"
  type="password"
  placeholder="Enter your password"
  leftIcon={Lock}
  success="Password is strong"
/>
```

#### BeamSearchBar
Advanced search component with real-time results and debouncing.

**Props:**
- `placeholder`: string - Search placeholder text
- `onSearch`: function - Custom search handler
- `debounceMs`: number - Debounce delay (default: 300ms)
- `showClearButton`: boolean - Shows clear button
- `autoFocus`: boolean - Auto-focus on mount

```jsx
import { BeamSearchBar } from './components/BeamSearchBar';

// Basic usage
<BeamSearchBar placeholder="Search content..." />

// Custom search handler
<BeamSearchBar 
  placeholder="Search documentation..."
  onSearch={async (query) => {
    // Custom search logic
    const results = await searchAPI(query);
    return results;
  }}
  debounceMs={500}
/>
```

### Utility Components

#### BeamLoader
Loading spinner component for async operations.

```jsx
import { BeamLoader } from './components/BeamLoader';

<BeamLoader />
```

#### BeamDarkModeToggle
Dark mode toggle component with theme switching.

```jsx
import { BeamDarkModeToggle } from './components/BeamDarkModeToggle';

<BeamDarkModeToggle />
```

## Design System

### Color Palette
- **Primary**: Blue (#3B82F6)
- **Secondary**: Gray (#6B7280)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)

### Typography
- **Font Family**: Inter, system-ui, sans-serif
- **Font Sizes**: 12px, 14px, 16px, 18px, 20px, 24px, 30px, 36px, 48px
- **Font Weights**: 400, 500, 600, 700

### Spacing
- **Base Unit**: 4px
- **Spacing Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Border Radius
- **Small**: 4px
- **Medium**: 8px
- **Large**: 12px
- **Full**: 9999px

## Best Practices

### Component Usage
1. **Consistent Naming**: Always use the "Beam" prefix for custom components
2. **Props Validation**: Use TypeScript or PropTypes for type safety
3. **Accessibility**: Include proper ARIA labels and keyboard navigation
4. **Performance**: Use React.memo for expensive components
5. **Responsive Design**: Ensure components work on all screen sizes

### Styling Guidelines
1. **Tailwind CSS**: Use Tailwind classes for consistent styling
2. **Custom CSS**: Only use custom CSS for complex animations or unique requirements
3. **CSS Variables**: Use CSS custom properties for theme values
4. **Mobile First**: Design for mobile devices first, then enhance for desktop

### Performance Optimization
1. **Code Splitting**: Use dynamic imports for large components
2. **Lazy Loading**: Implement lazy loading for images and heavy content
3. **Memoization**: Use React.memo and useMemo for expensive operations
4. **Bundle Size**: Keep component bundles small and focused

## Examples

### Complete Page Example
```jsx
import React, { useState } from 'react';
import { BeamLayout } from './components/BeamLayout';
import { 
  BeamCard, 
  BeamCardHeader, 
  BeamCardBody, 
  BeamButton, 
  BeamInput,
  BeamModal 
} from './components/widgets';

function ExamplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  return (
    <BeamLayout>
      <div className="container mx-auto px-4 py-8">
        <BeamCard>
          <BeamCardHeader>
            <h1 className="text-2xl font-bold">Example Page</h1>
          </BeamCardHeader>
          <BeamCardBody>
            <div className="space-y-4">
              <BeamInput
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
              <BeamInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
              <BeamButton 
                variant="primary" 
                onClick={() => setIsModalOpen(true)}
              >
                Open Modal
              </BeamButton>
            </div>
          </BeamCardBody>
        </BeamCard>

        <BeamModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
        >
          <p>This is an example modal with the form data:</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </BeamModal>
      </div>
    </BeamLayout>
  );
}
```

## Contributing

When adding new components to the Beam library:

1. **Follow Naming Convention**: Use "Beam" prefix
2. **Include Documentation**: Add comprehensive JSDoc comments
3. **Add Examples**: Include usage examples in the documentation
4. **Test Responsiveness**: Ensure components work on all devices
5. **Accessibility**: Include proper ARIA attributes and keyboard support
6. **Performance**: Optimize for bundle size and runtime performance

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://reactjs.org/docs)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [GitHub Pages Documentation](https://pages.github.com/)
