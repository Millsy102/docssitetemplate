import React from 'react';
import { render, screen } from '../utils/test-utils';
import Installation from '../../pages/Installation';

describe('Installation Page', () => {
  it('renders main heading', () => {
    render(<Installation />);
    expect(screen.getByText('Installation Guide')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Installation />);
    expect(screen.getByText(/Follow these steps to install BeamFlow in your Unreal Engine project/)).toBeInTheDocument();
  });

  it('renders prerequisites section', () => {
    render(<Installation />);
    
    expect(screen.getByText('Prerequisites')).toBeInTheDocument();
    expect(screen.getByText('• Unreal Engine 5.0 or later')).toBeInTheDocument();
    expect(screen.getByText('• Visual Studio 2019 or later (Windows)')).toBeInTheDocument();
    expect(screen.getByText('• Git installed on your system')).toBeInTheDocument();
    expect(screen.getByText('• C++ project (Blueprint-only projects not supported)')).toBeInTheDocument();
  });

  it('renders marketplace installation method', () => {
    render(<Installation />);
    
    expect(screen.getByText('Method 1: Plugin Marketplace (Recommended)')).toBeInTheDocument();
    expect(screen.getByText('1. Open your Unreal Engine project')).toBeInTheDocument();
    expect(screen.getAllByText('2. Go to')).toHaveLength(2); // Appears in both marketplace and manual sections
    expect(screen.getAllByText('Edit → Plugins')).toHaveLength(2); // Appears in both sections
    expect(screen.getByText(/3\. Click on the/)).toBeInTheDocument();
    expect(screen.getByText('Marketplace')).toBeInTheDocument();
    expect(screen.getByText(/tab/)).toBeInTheDocument();
    expect(screen.getByText('4. Search for "BeamFlow"')).toBeInTheDocument();
    expect(screen.getByText(/5\. Click/)).toBeInTheDocument();
    expect(screen.getByText('Install')).toBeInTheDocument();
    expect(screen.getByText(/and restart the editor/)).toBeInTheDocument();
  });

  it('renders manual installation method', () => {
    render(<Installation />);
    
    expect(screen.getByText('Method 2: Manual Installation')).toBeInTheDocument();
    expect(screen.getByText('Step 1: Download the Plugin')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Copy to Your Project')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Enable the Plugin')).toBeInTheDocument();
  });

  it('renders git clone command', () => {
    render(<Installation />);
    
    const gitCommand = screen.getByText('git clone https://github.com/yourusername/beamflow-plugin.git');
    expect(gitCommand).toBeInTheDocument();
    expect(gitCommand.closest('code')).toBeInTheDocument();
  });

  it('renders plugin directory path', () => {
    render(<Installation />);
    
    const pluginPath = screen.getByText('YourProject/Plugins/BeamFlow/');
    expect(pluginPath).toBeInTheDocument();
    expect(pluginPath.closest('code')).toBeInTheDocument();
  });

  it('renders manual installation steps', () => {
    render(<Installation />);
    
    expect(screen.getByText('1. Open your project in Unreal Engine')).toBeInTheDocument();
    expect(screen.getAllByText('2. Go to')).toHaveLength(2); // Appears in both marketplace and manual sections
    expect(screen.getAllByText('Edit → Plugins')).toHaveLength(2); // Appears in both sections
    expect(screen.getByText('3. Find "BeamFlow" in the list')).toBeInTheDocument();
    expect(screen.getByText('4. Check the box to enable it')).toBeInTheDocument();
    expect(screen.getByText('5. Restart the editor when prompted')).toBeInTheDocument();
  });

  it('renders verification section', () => {
    render(<Installation />);
    
    expect(screen.getByText('Verification')).toBeInTheDocument();
    expect(screen.getByText(/After installation, verify that BeamFlow is working correctly/)).toBeInTheDocument();
    expect(screen.getByText('• Check that "BeamFlow" appears in the Plugins list')).toBeInTheDocument();
    expect(screen.getByText('• Look for the BeamFlow menu in the editor toolbar')).toBeInTheDocument();
    expect(screen.getByText('• Verify no compilation errors in the Output Log')).toBeInTheDocument();
  });

  it('renders troubleshooting section', () => {
    render(<Installation />);
    
    expect(screen.getByText('Troubleshooting')).toBeInTheDocument();
    expect(screen.getByText('Common Issues')).toBeInTheDocument();
    expect(screen.getByText('Getting Help')).toBeInTheDocument();
  });

  it('renders common issues', () => {
    render(<Installation />);
    
    expect(screen.getByText('Compilation errors:')).toBeInTheDocument();
    expect(screen.getByText(/Make sure you have Visual Studio installed/)).toBeInTheDocument();
    expect(screen.getByText('Plugin not found:')).toBeInTheDocument();
    expect(screen.getByText(/Verify the plugin is in the correct directory/)).toBeInTheDocument();
    expect(screen.getByText('Engine version mismatch:')).toBeInTheDocument();
    expect(screen.getByText(/Ensure you're using UE5.0\+/)).toBeInTheDocument();
  });

  it('renders GitHub issues link', () => {
    render(<Installation />);
    
    const githubLink = screen.getByRole('link', { name: /github issues/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute('href', 'https://github.com/Millsy102/docssitetemplate/issues');
    expect(githubLink).toHaveClass('text-red-400', 'hover:text-red-300');
  });

  it('renders help text with GitHub link', () => {
    render(<Installation />);
    
    expect(screen.getByText(/If you encounter issues, please check our/)).toBeInTheDocument();
    expect(screen.getByText(/or create a new one with detailed information about your setup/)).toBeInTheDocument();
  });

  it('has correct page structure and styling', () => {
    render(<Installation />);
    
    const mainContainer = screen.getByText('Installation Guide').closest('div');
    expect(mainContainer).toHaveClass('max-w-4xl');
  });

  it('renders all sections with correct styling', () => {
    render(<Installation />);
    
    const sections = [
      'Prerequisites',
      'Method 1: Plugin Marketplace (Recommended)',
      'Method 2: Manual Installation',
      'Verification',
      'Troubleshooting'
    ];
    
    sections.forEach(section => {
      const sectionElement = screen.getByText(section).closest('div');
      expect(sectionElement).toHaveClass('bg-gray-800', 'p-6', 'rounded-lg', 'border', 'border-gray-700');
    });
  });

  it('renders code blocks with correct styling', () => {
    render(<Installation />);
    
    const codeBlocks = screen.getAllByText(/git clone|YourProject\/Plugins\/BeamFlow/);
    codeBlocks.forEach(code => {
      expect(code.closest('code')).toBeInTheDocument();
      expect(code.closest('pre')).toBeInTheDocument();
    });
  });

  it('renders step headings with correct hierarchy', () => {
    render(<Installation />);
    
    expect(screen.getByText('Step 1: Download the Plugin')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Copy to Your Project')).toBeInTheDocument();
    expect(screen.getByText('Step 3: Enable the Plugin')).toBeInTheDocument();
  });

  it('renders subheadings with correct hierarchy', () => {
    render(<Installation />);
    
    expect(screen.getByText('Common Issues')).toBeInTheDocument();
    expect(screen.getByText('Getting Help')).toBeInTheDocument();
  });

  it('renders lists with correct structure', () => {
    render(<Installation />);
    
    // Check that all list items are properly structured
    const listItems = screen.getAllByText(/•/);
    expect(listItems.length).toBeGreaterThan(0);
    
    listItems.forEach(item => {
      expect(item.closest('li')).toBeInTheDocument();
    });
  });

  it('renders ordered lists with correct structure', () => {
    render(<Installation />);
    
    // Check that numbered steps are properly structured
    const numberedSteps = screen.getAllByText(/^\d+\./);
    expect(numberedSteps.length).toBeGreaterThan(0);
    
    numberedSteps.forEach(step => {
      expect(step.closest('li')).toBeInTheDocument();
    });
  });
});
