import React from 'react'

const Contributing: React.FC = () => {
  return (
    <div className="max-w-4xl">
      <h1>Contributing to BeamFlow</h1>
      <p className="text-xl text-gray-300 mb-8">
        Thank you for your interest in contributing to BeamFlow! We welcome contributions from the community.
      </p>

      <div className="space-y-8">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>How to Contribute</h2>
          <p className="text-gray-300 mb-4">
            There are many ways to contribute to BeamFlow:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>•  Report bugs and issues</li>
            <li>•  Suggest new features</li>
            <li>•  Improve documentation</li>
            <li>•  Submit code improvements</li>
            <li>•  Help with testing</li>
            <li>•  Translate documentation</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Development Setup</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>Prerequisites</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Unreal Engine 5.0+ source code</li>
                <li>• Visual Studio 2019+ (Windows)</li>
                <li>• Git and GitHub account</li>
                <li>• Basic knowledge of C++ and Unreal Engine</li>
              </ul>
            </div>
            
            <div>
              <h3>Getting the Source</h3>
              <pre>
                <code>{`# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/yourusername/beamflow-plugin.git

# Add the original repository as upstream
git remote add upstream https://github.com/original-owner/beamflow-plugin.git

# Create a new branch for your changes
git checkout -b feature/your-feature-name`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Coding Standards</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>C++ Guidelines</h3>
              <ul className="text-gray-300 space-y-2">
                <li>• Follow Unreal Engine coding standards</li>
                <li>• Use meaningful variable and function names</li>
                <li>• Add comments for complex logic</li>
                <li>• Include proper error handling</li>
                <li>• Write unit tests for new features</li>
              </ul>
            </div>
            
            <div>
              <h3>Code Style</h3>
              <pre>
                <code>{`// Good example
UCLASS(BlueprintType, Blueprintable)
class BEAMFLOW_API UBeamFlowManager : public UObject
{
    GENERATED_BODY()
    
public:
    /** Initialize the BeamFlow system */
    UFUNCTION(BlueprintCallable, Category = "BeamFlow")
    void Initialize();
    
private:
    /** Current performance mode */
    UPROPERTY(EditAnywhere, Category = "BeamFlow")
    EBeamFlowPerformanceMode PerformanceMode;
};`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Submitting Changes</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>Pull Request Process</h3>
              <ol className="text-gray-300 space-y-2">
                <li>1. Ensure your code follows our standards</li>
                <li>2. Test your changes thoroughly</li>
                <li>3. Update documentation if needed</li>
                <li>4. Create a descriptive pull request</li>
                <li>5. Respond to review comments</li>
              </ol>
            </div>
            
            <div>
              <h3>Pull Request Template</h3>
              <pre>
                <code>{`## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (please describe)

## Testing
Describe how you tested your changes.

## Checklist
- [ ] Code follows project standards
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes`}</code>
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Issue Reporting</h2>
          <p className="text-gray-300 mb-4">
            When reporting issues, please include:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• Detailed description of the problem</li>
            <li>• Steps to reproduce the issue</li>
            <li>• Expected vs actual behavior</li>
            <li>• System information (OS, UE version, etc.)</li>
            <li>• Screenshots or logs if applicable</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Community Guidelines</h2>
          <div className="space-y-4 mt-4">
            <div>
              <h3>Code of Conduct</h3>
              <p className="text-gray-300">
                We are committed to providing a welcoming and inclusive environment for all contributors. 
                Please be respectful and constructive in all interactions.
              </p>
            </div>
            
            <div>
              <h3>Getting Help</h3>
              <p className="text-gray-300">
                If you need help with contributing:
              </p>
              <ul className="text-gray-300 space-y-1">
                <li>• Check existing issues and discussions</li>
                <li>• Ask questions in GitHub Discussions</li>
                <li>• Join our community Discord server</li>
                <li>• Review the documentation</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h2>Recognition</h2>
          <p className="text-gray-300 mb-4">
            Contributors will be recognized in:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li>• Project README contributors list</li>
            <li>• Release notes</li>
            <li>• Community announcements</li>
            <li>• Special contributor badges</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Contributing
