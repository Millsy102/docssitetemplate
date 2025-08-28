import React from 'react';
import { render, screen } from '../utils/test-utils';
import Home from '../../pages/Home';

describe('Home Page', () => {
  it('renders main heading', () => {
    render(<Home />);
    expect(screen.getByText('BeamFlow for Unreal Engine')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Home />);
    expect(screen.getByText(/A powerful streaming and processing plugin for Unreal Engine/)).toBeInTheDocument();
  });

  it('renders key features section', () => {
    render(<Home />);
    
    expect(screen.getByText(' Key Features')).toBeInTheDocument();
    expect(screen.getByText('• Real-time streaming capabilities')).toBeInTheDocument();
    expect(screen.getByText('• Advanced data processing')).toBeInTheDocument();
    expect(screen.getByText('• Seamless Unreal Engine integration')).toBeInTheDocument();
    expect(screen.getByText('• High-performance optimization')).toBeInTheDocument();
    expect(screen.getByText('• Scalable architecture')).toBeInTheDocument();
  });

  it('renders quick start section', () => {
    render(<Home />);
    
    expect(screen.getByText(' Quick Start')).toBeInTheDocument();
    expect(screen.getByText('Get started with BeamFlow in minutes')).toBeInTheDocument();
  });

  it('renders installation link', () => {
    render(<Home />);
    
    const installLink = screen.getByRole('link', { name: /install plugin/i });
    expect(installLink).toBeInTheDocument();
    expect(installLink).toHaveAttribute('href', '/installation');
    expect(installLink).toHaveClass('bg-red-600', 'hover:bg-red-700');
  });

  it('renders learn more link', () => {
    render(<Home />);
    
    const learnMoreLink = screen.getByRole('link', { name: /learn more/i });
    expect(learnMoreLink).toBeInTheDocument();
    expect(learnMoreLink).toHaveAttribute('href', '/getting-started');
    expect(learnMoreLink).toHaveClass('bg-gray-700', 'hover:bg-gray-600');
  });

  it('renders system requirements section', () => {
    render(<Home />);
    
    expect(screen.getByText('System Requirements')).toBeInTheDocument();
    expect(screen.getByText('Minimum Requirements')).toBeInTheDocument();
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('renders minimum requirements', () => {
    render(<Home />);
    
    expect(screen.getByText('• Unreal Engine 5.0+')).toBeInTheDocument();
    expect(screen.getByText('• Windows 10/11')).toBeInTheDocument();
    expect(screen.getByText('• 8GB RAM')).toBeInTheDocument();
    expect(screen.getByText('• DirectX 11 compatible GPU')).toBeInTheDocument();
  });

  it('renders recommended requirements', () => {
    render(<Home />);
    
    expect(screen.getByText('• Unreal Engine 5.3+')).toBeInTheDocument();
    expect(screen.getByText('• Windows 11')).toBeInTheDocument();
    expect(screen.getByText('• 16GB+ RAM')).toBeInTheDocument();
    expect(screen.getByText('• RTX 3060 or better')).toBeInTheDocument();
  });

  it('renders getting help section', () => {
    render(<Home />);
    
    expect(screen.getByText('Getting Help')).toBeInTheDocument();
    expect(screen.getByText(/Need assistance with BeamFlow/)).toBeInTheDocument();
  });

  it('renders report issues link', () => {
    render(<Home />);
    
    const reportIssuesLink = screen.getByRole('link', { name: /report issues/i });
    expect(reportIssuesLink).toBeInTheDocument();
    expect(reportIssuesLink).toHaveAttribute('href', 'https://github.com/Millsy102/docssitetemplate/issues');
    expect(reportIssuesLink).toHaveAttribute('target', '_blank');
    expect(reportIssuesLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(' Report Issues')).toBeInTheDocument();
    expect(screen.getByText('Found a bug? Let us know!')).toBeInTheDocument();
  });

  it('renders community link', () => {
    render(<Home />);
    
    const communityLink = screen.getByRole('link', { name: /community/i });
    expect(communityLink).toBeInTheDocument();
    expect(communityLink).toHaveAttribute('href', 'https://github.com/Millsy102/docssitetemplate/discussions');
    expect(communityLink).toHaveAttribute('target', '_blank');
    expect(communityLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(screen.getByText(' Community')).toBeInTheDocument();
    expect(screen.getByText('Join the discussion')).toBeInTheDocument();
  });

  it('renders contribute link', () => {
    render(<Home />);
    
    const contributeLink = screen.getByRole('link', { name: /contribute/i });
    expect(contributeLink).toBeInTheDocument();
    expect(contributeLink).toHaveAttribute('href', '/contributing');
    expect(screen.getByText(' Contribute')).toBeInTheDocument();
    expect(screen.getByText('Help improve BeamFlow')).toBeInTheDocument();
  });

  it('has correct page structure and styling', () => {
    render(<Home />);
    
    const mainContainer = screen.getByText('BeamFlow for Unreal Engine').closest('div').parentElement;
    expect(mainContainer).toHaveClass('max-w-4xl');
  });

  it('renders feature cards with correct styling', () => {
    render(<Home />);
    
    const featureCards = screen.getAllByText(/Key Features|Quick Start/);
    featureCards.forEach(card => {
      const cardContainer = card.closest('div');
      expect(cardContainer).toHaveClass('bg-gray-800', 'p-6', 'rounded-lg', 'border', 'border-gray-700');
    });
  });

  it('renders system requirements with correct styling', () => {
    render(<Home />);
    
    const systemRequirementsSection = screen.getByText('System Requirements').closest('div');
    expect(systemRequirementsSection).toHaveClass('bg-gray-800', 'p-6', 'rounded-lg', 'border', 'border-gray-700');
  });

  it('renders help section with correct styling', () => {
    render(<Home />);
    
    const helpSection = screen.getByText('Getting Help').closest('div');
    expect(helpSection).toHaveClass('bg-gray-800', 'p-6', 'rounded-lg', 'border', 'border-gray-700');
  });

  it('renders help cards with correct styling', () => {
    render(<Home />);
    
    const helpCards = screen.getAllByText(/Report Issues|Community|Contribute/);
    helpCards.forEach(card => {
      const cardContainer = card.closest('a, div');
      expect(cardContainer).toHaveClass('bg-gray-700', 'hover:bg-gray-600', 'rounded-lg');
    });
  });
});
