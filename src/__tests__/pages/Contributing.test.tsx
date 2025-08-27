import React from 'react';
import { render, screen } from '../utils/test-utils';
import Contributing from '../../pages/Contributing';

describe('Contributing Page', () => {
  it('renders main heading', () => {
    render(<Contributing />);
    expect(screen.getByText('Contributing to BeamFlow')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Contributing />);
    expect(screen.getByText(/Thank you for your interest in contributing to BeamFlow/)).toBeInTheDocument();
  });

  it('renders how to contribute section', () => {
    render(<Contributing />);
    
    expect(screen.getByText('How to Contribute')).toBeInTheDocument();
    expect(screen.getByText(/There are many ways to contribute to BeamFlow/)).toBeInTheDocument();
  });

  it('renders contribution types', () => {
    render(<Contributing />);
    
    // Check that contribution types are present (using partial text matching)
    expect(screen.getByText(/Report bugs and issues/)).toBeInTheDocument();
    expect(screen.getByText(/Suggest new features/)).toBeInTheDocument();
    expect(screen.getByText(/Improve documentation/)).toBeInTheDocument();
    expect(screen.getByText(/Submit code improvements/)).toBeInTheDocument();
    expect(screen.getByText(/Help with testing/)).toBeInTheDocument();
    expect(screen.getByText(/Translate documentation/)).toBeInTheDocument();
  });

  it('renders development setup section', () => {
    render(<Contributing />);
    
    expect(screen.getByText('Development Setup')).toBeInTheDocument();
    expect(screen.getByText('Prerequisites')).toBeInTheDocument();
    expect(screen.getByText('Getting the Source')).toBeInTheDocument();
  });

  it('renders prerequisites', () => {
    render(<Contributing />);
    
    expect(screen.getByText('• Unreal Engine 5.0+ source code')).toBeInTheDocument();
    expect(screen.getByText('• Visual Studio 2019+ (Windows)')).toBeInTheDocument();
    expect(screen.getByText('• Git and GitHub account')).toBeInTheDocument();
    expect(screen.getByText('• Basic knowledge of C++ and Unreal Engine')).toBeInTheDocument();
  });

  it('renders git commands', () => {
    render(<Contributing />);
    
    // Check that git commands are present in the code blocks
    expect(screen.getByText(/Fork the repository on GitHub/)).toBeInTheDocument();
    expect(screen.getByText(/Clone your fork/)).toBeInTheDocument();
    expect(screen.getByText(/git clone https:\/\/github\.com\/yourusername\/beamflow-plugin\.git/)).toBeInTheDocument();
    expect(screen.getByText(/Add the original repository as upstream/)).toBeInTheDocument();
    expect(screen.getByText(/git remote add upstream https:\/\/github\.com\/original-owner\/beamflow-plugin\.git/)).toBeInTheDocument();
    expect(screen.getByText(/Create a new branch for your changes/)).toBeInTheDocument();
    expect(screen.getByText(/git checkout -b feature\/your-feature-name/)).toBeInTheDocument();
  });

  it('renders coding standards section', () => {
    render(<Contributing />);
    
    expect(screen.getByText('Coding Standards')).toBeInTheDocument();
    expect(screen.getByText('C++ Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Code Style')).toBeInTheDocument();
  });

  it('renders C++ guidelines', () => {
    render(<Contributing />);
    
    expect(screen.getByText('• Follow Unreal Engine coding standards')).toBeInTheDocument();
    expect(screen.getByText('• Use meaningful variable and function names')).toBeInTheDocument();
    expect(screen.getByText('• Add comments for complex logic')).toBeInTheDocument();
    expect(screen.getByText('• Include proper error handling')).toBeInTheDocument();
    expect(screen.getByText('• Write unit tests for new features')).toBeInTheDocument();
  });

  it('renders code style example', () => {
    render(<Contributing />);
    
    // Check that code elements are present in the code blocks
    expect(screen.getByText(/Good example/)).toBeInTheDocument();
    expect(screen.getByText(/UCLASS\(BlueprintType, Blueprintable\)/)).toBeInTheDocument();
    expect(screen.getByText(/class BEAMFLOW_API UBeamFlowManager : public UObject/)).toBeInTheDocument();
    expect(screen.getByText(/GENERATED_BODY\(\)/)).toBeInTheDocument();
    expect(screen.getByText(/UFUNCTION\(BlueprintCallable, Category = "BeamFlow"\)/)).toBeInTheDocument();
    expect(screen.getByText(/void Initialize\(\);/)).toBeInTheDocument();
    expect(screen.getByText(/UPROPERTY\(EditAnywhere, Category = "BeamFlow"\)/)).toBeInTheDocument();
    expect(screen.getByText(/EBeamFlowPerformanceMode PerformanceMode;/)).toBeInTheDocument();
  });

  it('renders submitting changes section', () => {
    render(<Contributing />);
    
    expect(screen.getByText('Submitting Changes')).toBeInTheDocument();
    expect(screen.getByText('Pull Request Process')).toBeInTheDocument();
    expect(screen.getByText('Pull Request Template')).toBeInTheDocument();
  });

  it('renders pull request process', () => {
    render(<Contributing />);
    
    expect(screen.getByText('1. Ensure your code follows our standards')).toBeInTheDocument();
    expect(screen.getByText('2. Test your changes thoroughly')).toBeInTheDocument();
    expect(screen.getByText('3. Update documentation if needed')).toBeInTheDocument();
    expect(screen.getByText('4. Create a descriptive pull request')).toBeInTheDocument();
    expect(screen.getByText('5. Respond to review comments')).toBeInTheDocument();
  });

  it('renders pull request template', () => {
    render(<Contributing />);
    
    // Check that markdown headers and content are present in the code blocks
    expect(screen.getByText(/## Description/)).toBeInTheDocument();
    expect(screen.getByText(/Brief description of the changes made/)).toBeInTheDocument();
    expect(screen.getByText(/## Type of Change/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Bug fix/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] New feature/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Documentation update/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Performance improvement/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Other \(please describe\)/)).toBeInTheDocument();
    expect(screen.getByText(/## Testing/)).toBeInTheDocument();
    expect(screen.getByText(/Describe how you tested your changes/)).toBeInTheDocument();
    expect(screen.getByText(/## Checklist/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Code follows project standards/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Tests pass/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Documentation updated/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] No breaking changes/)).toBeInTheDocument();
  });

  it('renders issue reporting section', () => {
    render(<Contributing />);
    
    expect(screen.getByText('Issue Reporting')).toBeInTheDocument();
    expect(screen.getByText(/When reporting issues, please include/)).toBeInTheDocument();
  });

  it('renders issue reporting requirements', () => {
    render(<Contributing />);
    
    expect(screen.getByText('• Detailed description of the problem')).toBeInTheDocument();
    expect(screen.getByText('• Steps to reproduce the issue')).toBeInTheDocument();
    expect(screen.getByText('• Expected vs actual behavior')).toBeInTheDocument();
    expect(screen.getByText('• System information (OS, UE version, etc.)')).toBeInTheDocument();
    expect(screen.getByText('• Screenshots or logs if applicable')).toBeInTheDocument();
  });

  it('renders community guidelines section', () => {
    render(<Contributing />);
    
    expect(screen.getByText('Community Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Code of Conduct')).toBeInTheDocument();
    expect(screen.getByText('Getting Help')).toBeInTheDocument();
  });

  it('renders code of conduct', () => {
    render(<Contributing />);
    
    expect(screen.getByText(/We are committed to providing a welcoming and inclusive environment/)).toBeInTheDocument();
    expect(screen.getByText(/Please be respectful and constructive in all interactions/)).toBeInTheDocument();
  });

  it('renders getting help section', () => {
    render(<Contributing />);
    
    expect(screen.getByText(/If you need help with contributing/)).toBeInTheDocument();
    expect(screen.getByText('• Check existing issues and discussions')).toBeInTheDocument();
    expect(screen.getByText('• Ask questions in GitHub Discussions')).toBeInTheDocument();
    expect(screen.getByText('• Join our community Discord server')).toBeInTheDocument();
    expect(screen.getByText('• Review the documentation')).toBeInTheDocument();
  });

  it('renders recognition section', () => {
    render(<Contributing />);
    
    expect(screen.getByText('Recognition')).toBeInTheDocument();
    expect(screen.getByText(/Contributors will be recognized in/)).toBeInTheDocument();
  });

  it('renders recognition items', () => {
    render(<Contributing />);
    
    expect(screen.getByText('• Project README contributors list')).toBeInTheDocument();
    expect(screen.getByText('• Release notes')).toBeInTheDocument();
    expect(screen.getByText('• Community announcements')).toBeInTheDocument();
    expect(screen.getByText('• Special contributor badges')).toBeInTheDocument();
  });

  it('has correct page structure and styling', () => {
    render(<Contributing />);
    
    const mainContainer = screen.getByText('Contributing to BeamFlow').closest('div');
    expect(mainContainer).toHaveClass('max-w-4xl');
  });

  it('renders all sections with correct styling', () => {
    render(<Contributing />);
    
    const sections = [
      'How to Contribute',
      'Development Setup',
      'Coding Standards',
      'Submitting Changes',
      'Issue Reporting',
      'Community Guidelines',
      'Recognition'
    ];
    
    sections.forEach(section => {
      const sectionElement = screen.getByText(section).closest('div');
      expect(sectionElement).toHaveClass('bg-gray-800', 'p-6', 'rounded-lg', 'border', 'border-gray-700');
    });
  });

  it('renders code blocks with correct styling', () => {
    render(<Contributing />);
    
    const codeBlocks = screen.getAllByText(/git clone|UCLASS|UFUNCTION|UPROPERTY|## Description/);
    codeBlocks.forEach(code => {
      expect(code.closest('code')).toBeInTheDocument();
      expect(code.closest('pre')).toBeInTheDocument();
    });
  });

  it('renders subheadings with correct hierarchy', () => {
    render(<Contributing />);
    
    expect(screen.getByText('Prerequisites')).toBeInTheDocument();
    expect(screen.getByText('Getting the Source')).toBeInTheDocument();
    expect(screen.getByText('C++ Guidelines')).toBeInTheDocument();
    expect(screen.getByText('Code Style')).toBeInTheDocument();
    expect(screen.getByText('Pull Request Process')).toBeInTheDocument();
    expect(screen.getByText('Pull Request Template')).toBeInTheDocument();
    expect(screen.getByText('Code of Conduct')).toBeInTheDocument();
    expect(screen.getByText('Getting Help')).toBeInTheDocument();
  });

  it('renders lists with correct structure', () => {
    render(<Contributing />);
    
    // Check that all list items are properly structured
    const listItems = screen.getAllByText(/•/);
    expect(listItems.length).toBeGreaterThan(0);
    
    listItems.forEach(item => {
      expect(item.closest('li')).toBeInTheDocument();
    });
  });

  it('renders ordered lists with correct structure', () => {
    render(<Contributing />);
    
    // Check that numbered steps are properly structured
    const numberedSteps = screen.getAllByText(/^\d+\./);
    expect(numberedSteps.length).toBeGreaterThan(0);
    
    numberedSteps.forEach(step => {
      expect(step.closest('li')).toBeInTheDocument();
    });
  });

  it('renders code comments correctly', () => {
    render(<Contributing />);
    
    // Check that code comments are present in the code blocks
    expect(screen.getByText(/Good example/)).toBeInTheDocument();
    expect(screen.getByText(/Fork the repository on GitHub/)).toBeInTheDocument();
    expect(screen.getByText(/Clone your fork/)).toBeInTheDocument();
    expect(screen.getByText(/Add the original repository as upstream/)).toBeInTheDocument();
    expect(screen.getByText(/Create a new branch for your changes/)).toBeInTheDocument();
  });

  it('renders markdown headers correctly', () => {
    render(<Contributing />);
    
    expect(screen.getByText(/## Description/)).toBeInTheDocument();
    expect(screen.getByText(/## Type of Change/)).toBeInTheDocument();
    expect(screen.getByText(/## Testing/)).toBeInTheDocument();
    expect(screen.getByText(/## Checklist/)).toBeInTheDocument();
  });

  it('renders checkbox items correctly', () => {
    render(<Contributing />);
    
    expect(screen.getByText(/- \[ \] Bug fix/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] New feature/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Documentation update/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Performance improvement/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Other \(please describe\)/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Code follows project standards/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Tests pass/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] Documentation updated/)).toBeInTheDocument();
    expect(screen.getByText(/- \[ \] No breaking changes/)).toBeInTheDocument();
  });
});
