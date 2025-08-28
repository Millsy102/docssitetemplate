import React from 'react';
import { render, screen } from '../utils/test-utils';
import Sidebar from '../../components/Sidebar';

// Mock react-router-dom's useLocation
const mockUseLocation = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockUseLocation(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('Sidebar Component', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
  });

  it('renders sidebar with navigation items', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Contributing')).toBeInTheDocument();
  });

  it('renders navigation icons', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('')).toBeInTheDocument(); // Overview
    expect(screen.getByText('')).toBeInTheDocument(); // Installation
    expect(screen.getByText('')).toBeInTheDocument(); // Getting Started
    expect(screen.getByText('')).toBeInTheDocument(); // Contributing
  });

  it('renders quick links section', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('Quick Links')).toBeInTheDocument();
    expect(screen.getByText('GitHub Repository')).toBeInTheDocument();
    expect(screen.getByText('Report Issues')).toBeInTheDocument();
  });

  it('renders quick links icons', () => {
    render(<Sidebar />);
    
    expect(screen.getByText('')).toBeInTheDocument(); // GitHub Repository
    expect(screen.getByText('')).toBeInTheDocument(); // Report Issues
  });

  it('has correct navigation links', () => {
    render(<Sidebar />);
    
    const overviewLink = screen.getByRole('link', { name: /overview/i });
    const installationLink = screen.getByRole('link', { name: /installation/i });
    const gettingStartedLink = screen.getByRole('link', { name: /getting started/i });
    const contributingLink = screen.getByRole('link', { name: /contributing/i });
    
    expect(overviewLink).toHaveAttribute('href', '/');
    expect(installationLink).toHaveAttribute('href', '/installation');
    expect(gettingStartedLink).toHaveAttribute('href', '/getting-started');
    expect(contributingLink).toHaveAttribute('href', '/contributing');
  });

  it('has correct external links', () => {
    render(<Sidebar />);
    
    const githubLink = screen.getByRole('link', { name: /github repository/i });
    const issuesLink = screen.getByRole('link', { name: /report issues/i });
    
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Millsy102/docssitetemplate');
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    
    expect(issuesLink).toHaveAttribute('href', 'https://github.com/Millsy102/docssitetemplate/issues');
    expect(issuesLink).toHaveAttribute('target', '_blank');
    expect(issuesLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('applies active state styling to current page', () => {
    mockUseLocation.mockReturnValue({ pathname: '/installation' });
    render(<Sidebar />);
    
    const installationLink = screen.getByRole('link', { name: /installation/i });
    expect(installationLink).toHaveClass('bg-red-600', 'text-white');
  });

  it('applies inactive state styling to other pages', () => {
    mockUseLocation.mockReturnValue({ pathname: '/installation' });
    render(<Sidebar />);
    
    const overviewLink = screen.getByRole('link', { name: /overview/i });
    const gettingStartedLink = screen.getByRole('link', { name: /getting started/i });
    const contributingLink = screen.getByRole('link', { name: /contributing/i });
    
    expect(overviewLink).toHaveClass('text-gray-300', 'hover:bg-gray-800', 'hover:text-red-400');
    expect(gettingStartedLink).toHaveClass('text-gray-300', 'hover:bg-gray-800', 'hover:text-red-400');
    expect(contributingLink).toHaveClass('text-gray-300', 'hover:bg-gray-800', 'hover:text-red-400');
  });

  it('applies active state to home page when on root path', () => {
    mockUseLocation.mockReturnValue({ pathname: '/' });
    render(<Sidebar />);
    
    const overviewLink = screen.getByRole('link', { name: /overview/i });
    expect(overviewLink).toHaveClass('bg-red-600', 'text-white');
  });

  it('has correct sidebar structure and styling', () => {
    render(<Sidebar />);
    
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-64', 'bg-gray-900', 'border-r', 'border-gray-700', 'p-6');
  });

  it('has correct navigation structure', () => {
    render(<Sidebar />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('space-y-2');
  });

  it('has correct quick links section styling', () => {
    render(<Sidebar />);
    
    const quickLinksSection = screen.getByText('Quick Links').closest('div');
    expect(quickLinksSection).toHaveClass('mt-8', 'pt-8', 'border-t', 'border-gray-700');
  });

  it('renders all navigation items with correct structure', () => {
    render(<Sidebar />);
    
    const navItems = [
      { label: 'Overview', icon: '', path: '/' },
      { label: 'Installation', icon: '', path: '/installation' },
      { label: 'Getting Started', icon: '', path: '/getting-started' },
      { label: 'Contributing', icon: '', path: '/contributing' },
    ];
    
    navItems.forEach(item => {
      const link = screen.getByRole('link', { name: new RegExp(item.label, 'i') });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', item.path);
      
      // Check that icon is present
      const iconElement = screen.getByText(item.icon);
      expect(iconElement).toBeInTheDocument();
    });
  });
});
