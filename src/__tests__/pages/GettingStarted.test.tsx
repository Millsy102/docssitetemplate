import React from 'react';
import { render, screen } from '../utils/test-utils';
import GettingStarted from '../../pages/GettingStarted';

describe('GettingStarted Page', () => {
  it('renders main heading', () => {
    render(<GettingStarted />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<GettingStarted />);
    expect(screen.getByText(/Learn the basics of using BeamFlow in your Unreal Engine project/)).toBeInTheDocument();
  });

  it('renders first steps section', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText(/After installing BeamFlow, follow these steps to get started/)).toBeInTheDocument();
    expect(screen.getByText('1. Open your Unreal Engine project')).toBeInTheDocument();
    expect(screen.getByText('2. Navigate to the BeamFlow menu in the toolbar')).toBeInTheDocument();
    expect(screen.getByText('3. Click "Initialize BeamFlow" to set up the plugin')).toBeInTheDocument();
    expect(screen.getByText('4. Configure your project settings in the BeamFlow panel')).toBeInTheDocument();
  });

  it('renders basic configuration section', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText('Basic Configuration')).toBeInTheDocument();
    expect(screen.getByText('Project Settings')).toBeInTheDocument();
    expect(screen.getByText(/Configure BeamFlow settings for your project/)).toBeInTheDocument();
  });

  it('renders configuration code examples', () => {
    render(<GettingStarted />);
    
    // Check for Build.cs configuration
    expect(screen.getByText(/PublicDependencyModuleNames\.AddRange/)).toBeInTheDocument();
    expect(screen.getAllByText(/BeamFlow/)).toHaveLength(11); // Multiple instances
    
    // Check for .uproject configuration
    expect(screen.getByText(/Plugins/)).toBeInTheDocument();
    expect(screen.getByText(/Name.*BeamFlow/)).toBeInTheDocument();
    expect(screen.getByText(/Enabled.*true/)).toBeInTheDocument();
  });

  it('renders core features section', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText('Core Features')).toBeInTheDocument();
    expect(screen.getByText('AI Integration')).toBeInTheDocument();
    expect(screen.getByText('Performance Tools')).toBeInTheDocument();
  });

  it('renders AI integration features', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText(/BeamFlow provides advanced AI capabilities/)).toBeInTheDocument();
    expect(screen.getByText('• Smart asset management')).toBeInTheDocument();
    expect(screen.getByText('• Automated optimization')).toBeInTheDocument();
    expect(screen.getByText('• Intelligent debugging')).toBeInTheDocument();
    expect(screen.getByText('• Performance analysis')).toBeInTheDocument();
  });

  it('renders performance tools features', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText(/Monitor and optimize your project/)).toBeInTheDocument();
    expect(screen.getByText('• Real-time performance metrics')).toBeInTheDocument();
    expect(screen.getByText('• Memory usage tracking')).toBeInTheDocument();
    expect(screen.getByText('• Frame rate analysis')).toBeInTheDocument();
    expect(screen.getByText('• Bottleneck detection')).toBeInTheDocument();
  });

  it('renders example usage section', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText('Example Usage')).toBeInTheDocument();
    expect(screen.getByText('Basic Setup in C++')).toBeInTheDocument();
    expect(screen.getByText('Blueprint Integration')).toBeInTheDocument();
  });

  it('renders C++ code examples', () => {
    render(<GettingStarted />);
    
    // Check for include statement
    expect(screen.getByText(/include.*BeamFlow\/Public\/BeamFlowManager\.h/)).toBeInTheDocument();
    
    // Check for class and function names
    expect(screen.getByText(/UBeamFlowManager::Get\(\)\.Initialize\(\)/)).toBeInTheDocument();
    expect(screen.getByText(/UBeamFlowManager::Get\(\)\.SetPerformanceMode/)).toBeInTheDocument();
    expect(screen.getByText(/UBeamFlowManager::Get\(\)\.RecordPerformanceMetric/)).toBeInTheDocument();
  });

  it('renders blueprint integration features', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText(/BeamFlow also supports Blueprint integration/)).toBeInTheDocument();
    expect(screen.getByText('• Drag and drop BeamFlow nodes')).toBeInTheDocument();
    expect(screen.getByText('• Access performance metrics')).toBeInTheDocument();
    expect(screen.getByText('• Configure AI settings')).toBeInTheDocument();
    expect(screen.getByText('• Monitor system health')).toBeInTheDocument();
  });

  it('renders next steps section', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText(/Now that you have the basics, explore these advanced features/)).toBeInTheDocument();
  });

  it('renders next steps cards', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText('Advanced AI')).toBeInTheDocument();
    expect(screen.getByText(/Learn about advanced AI features and customization options/)).toBeInTheDocument();
    
    expect(screen.getByText('Performance Tuning')).toBeInTheDocument();
    expect(screen.getByText(/Optimize your project for maximum performance/)).toBeInTheDocument();
    
    expect(screen.getByText('API Reference')).toBeInTheDocument();
    expect(screen.getByText(/Explore the complete API documentation/)).toBeInTheDocument();
  });

  it('has correct page structure and styling', () => {
    render(<GettingStarted />);
    
    const mainContainer = screen.getByText('Getting Started').closest('div');
    expect(mainContainer).toHaveClass('max-w-4xl');
  });

  it('renders all sections with correct styling', () => {
    render(<GettingStarted />);
    
    const sections = [
      'First Steps',
      'Basic Configuration',
      'Core Features',
      'Example Usage',
      'Next Steps'
    ];
    
    sections.forEach(section => {
      const sectionElement = screen.getByText(section).closest('div');
      expect(sectionElement).toHaveClass('bg-gray-800', 'p-6', 'rounded-lg', 'border', 'border-gray-700');
    });
  });

  it('renders code blocks with correct styling', () => {
    render(<GettingStarted />);
    
    const codeBlocks = screen.getAllByText(/PublicDependencyModuleNames|#include|UBeamFlowManager/);
    codeBlocks.forEach(code => {
      expect(code.closest('code')).toBeInTheDocument();
      expect(code.closest('pre')).toBeInTheDocument();
    });
  });

  it('renders feature grid with correct styling', () => {
    render(<GettingStarted />);
    
    const featureGrid = screen.getByText('AI Integration').closest('div').parentElement!;
    expect(featureGrid).toHaveClass('grid', 'md:grid-cols-2', 'gap-6');
  });

  it('renders next steps cards with correct styling', () => {
    render(<GettingStarted />);
    
    const nextStepsGrid = screen.getByText('Advanced AI').closest('div').parentElement!;
    expect(nextStepsGrid).toHaveClass('grid', 'md:grid-cols-3', 'gap-4');
    
    const cards = screen.getAllByText(/Advanced AI|Performance Tuning|API Reference/);
    cards.forEach(card => {
      const cardContainer = card.closest('div');
      expect(cardContainer).toHaveClass('p-4', 'bg-gray-700', 'rounded-lg');
    });
  });

  it('renders card headings with correct styling', () => {
    render(<GettingStarted />);
    
    const cardHeadings = screen.getAllByText(/Advanced AI|Performance Tuning|API Reference/);
    cardHeadings.forEach(heading => {
      expect(heading).toHaveClass('text-red-400', 'mb-2');
    });
  });

  it('renders lists with correct structure', () => {
    render(<GettingStarted />);
    
    // Check that all list items are properly structured
    const listItems = screen.getAllByText(/•/);
    expect(listItems.length).toBeGreaterThan(0);
    
    listItems.forEach(item => {
      expect(item.closest('li')).toBeInTheDocument();
    });
  });

  it('renders ordered lists with correct structure', () => {
    render(<GettingStarted />);
    
    // Check that numbered steps are properly structured
    const numberedSteps = screen.getAllByText(/^\d+\./);
    expect(numberedSteps.length).toBeGreaterThan(0);
    
    numberedSteps.forEach(step => {
      expect(step.closest('li')).toBeInTheDocument();
    });
  });

  it('renders subheadings with correct hierarchy', () => {
    render(<GettingStarted />);
    
    expect(screen.getByText('Project Settings')).toBeInTheDocument();
    expect(screen.getByText('AI Integration')).toBeInTheDocument();
    expect(screen.getByText('Performance Tools')).toBeInTheDocument();
    expect(screen.getByText('Basic Setup in C++')).toBeInTheDocument();
    expect(screen.getByText('Blueprint Integration')).toBeInTheDocument();
  });

  it('renders code comments correctly', () => {
    render(<GettingStarted />);
    
    // Check that code comments are present in the code blocks
    const codeBlock = screen.getByText(/In your project's Build.cs file/);
    expect(codeBlock).toBeInTheDocument();
    
    const uprojectComment = screen.getByText(/Add to your project's .uproject file/);
    expect(uprojectComment).toBeInTheDocument();
    
    const gameModuleComment = screen.getByText(/In your game module/);
    expect(gameModuleComment).toBeInTheDocument();
    
    const initializeComments = screen.getAllByText(/Initialize BeamFlow/);
    expect(initializeComments.length).toBeGreaterThan(0);
    
    const configureComment = screen.getByText(/Configure settings/);
    expect(configureComment).toBeInTheDocument();
    
    const actorComment = screen.getByText(/In your actor/);
    expect(actorComment).toBeInTheDocument();
    
    const monitoringComment = screen.getByText(/Use BeamFlow performance monitoring/);
    expect(monitoringComment).toBeInTheDocument();
  });

  it('renders function calls with correct syntax', () => {
    render(<GettingStarted />);
    
    // Check that function calls are present in the code blocks
    const initializeCall = screen.getByText(/UBeamFlowManager::Get\(\)\.Initialize\(\)/);
    expect(initializeCall).toBeInTheDocument();
    
    const setPerformanceModeCall = screen.getByText(/UBeamFlowManager::Get\(\)\.SetPerformanceMode/);
    expect(setPerformanceModeCall).toBeInTheDocument();
    
    const recordMetricCall = screen.getByText(/UBeamFlowManager::Get\(\)\.RecordPerformanceMetric/);
    expect(recordMetricCall).toBeInTheDocument();
  });
});
