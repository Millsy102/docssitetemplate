import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock the CSS imports
jest.mock('../App.css', () => ({}));

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('BeamFlow')).toBeInTheDocument();
  });

  it('renders header component', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('BeamFlow')).toBeInTheDocument();
    expect(screen.getByText('for Unreal Engine')).toBeInTheDocument();
  });

  it('renders sidebar component', () => {
    render(<App />);
    expect(screen.getByRole('complementary')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getAllByText('Installation')).toHaveLength(2); // Appears in both header and sidebar
    expect(screen.getAllByText('Getting Started')).toHaveLength(2); // Appears in both header and sidebar
    expect(screen.getAllByText('Contributing')).toHaveLength(2); // Appears in both header and sidebar
  });

  it('renders main content area', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders home page by default', () => {
    render(<App />);
    // Check for content that should be on the home page
    expect(screen.getByText('BeamFlow for Unreal Engine')).toBeInTheDocument();
  });

  it('has correct navigation structure', () => {
    render(<App />);
    
    // Check desktop navigation (there are multiple nav elements, so use getAllByRole)
    const navElements = screen.getAllByRole('navigation');
    expect(navElements.length).toBeGreaterThan(0);
    
    // Check navigation links (there are multiple instances, so use getAllByRole)
    expect(screen.getAllByRole('link', { name: /home/i })).toHaveLength(1); // Only in header
    expect(screen.getAllByRole('link', { name: /installation/i })).toHaveLength(2); // Header and sidebar
    expect(screen.getAllByRole('link', { name: /getting started/i })).toHaveLength(2); // Header and sidebar
    expect(screen.getAllByRole('link', { name: /contributing/i })).toHaveLength(2); // Header and sidebar
  });

  it('has correct app structure with proper CSS classes', () => {
    render(<App />);
    
    const appContainer = screen.getByText('BeamFlow').closest('.app');
    expect(appContainer).toBeInTheDocument();
    
    const mainContent = screen.getByRole('main').closest('.main-content');
    expect(mainContent).toBeInTheDocument();
    
    const content = screen.getByRole('main');
    expect(content).toHaveClass('content');
  });
});
