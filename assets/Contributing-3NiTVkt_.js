import{j as e}from"./index-BZIbSz_R.js";const i=()=>e.jsxs("div",{className:"max-w-4xl",children:[e.jsx("h1",{children:"Contributing to BeamFlow"}),e.jsx("p",{className:"text-xl text-gray-300 mb-8",children:"Thank you for your interest in contributing to BeamFlow! We welcome contributions from the community."}),e.jsxs("div",{className:"space-y-8",children:[e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"How to Contribute"}),e.jsx("p",{className:"text-gray-300 mb-4",children:"There are many ways to contribute to BeamFlow:"}),e.jsxs("ul",{className:"text-gray-300 space-y-2",children:[e.jsx("li",{children:"•  Report bugs and issues"}),e.jsx("li",{children:"•  Suggest new features"}),e.jsx("li",{children:"•  Improve documentation"}),e.jsx("li",{children:"•  Submit code improvements"}),e.jsx("li",{children:"•  Help with testing"}),e.jsx("li",{children:"•  Translate documentation"})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Development Setup"}),e.jsxs("div",{className:"space-y-4 mt-4",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"Prerequisites"}),e.jsxs("ul",{className:"text-gray-300 space-y-2",children:[e.jsx("li",{children:"• Unreal Engine 5.0+ source code"}),e.jsx("li",{children:"• Visual Studio 2019+ (Windows)"}),e.jsx("li",{children:"• Git and GitHub account"}),e.jsx("li",{children:"• Basic knowledge of C++ and Unreal Engine"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{children:"Getting the Source"}),e.jsx("pre",{children:e.jsx("code",{children:`# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/yourusername/beamflow-plugin.git

# Add the original repository as upstream
git remote add upstream https://github.com/original-owner/beamflow-plugin.git

# Create a new branch for your changes
git checkout -b feature/your-feature-name`})})]})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Coding Standards"}),e.jsxs("div",{className:"space-y-4 mt-4",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"C++ Guidelines"}),e.jsxs("ul",{className:"text-gray-300 space-y-2",children:[e.jsx("li",{children:"• Follow Unreal Engine coding standards"}),e.jsx("li",{children:"• Use meaningful variable and function names"}),e.jsx("li",{children:"• Add comments for complex logic"}),e.jsx("li",{children:"• Include proper error handling"}),e.jsx("li",{children:"• Write unit tests for new features"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{children:"Code Style"}),e.jsx("pre",{children:e.jsx("code",{children:`// Good example
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
};`})})]})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Submitting Changes"}),e.jsxs("div",{className:"space-y-4 mt-4",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"Pull Request Process"}),e.jsxs("ol",{className:"text-gray-300 space-y-2",children:[e.jsx("li",{children:"1. Ensure your code follows our standards"}),e.jsx("li",{children:"2. Test your changes thoroughly"}),e.jsx("li",{children:"3. Update documentation if needed"}),e.jsx("li",{children:"4. Create a descriptive pull request"}),e.jsx("li",{children:"5. Respond to review comments"})]})]}),e.jsxs("div",{children:[e.jsx("h3",{children:"Pull Request Template"}),e.jsx("pre",{children:e.jsx("code",{children:`## Description
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
- [ ] No breaking changes`})})]})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Issue Reporting"}),e.jsx("p",{className:"text-gray-300 mb-4",children:"When reporting issues, please include:"}),e.jsxs("ul",{className:"text-gray-300 space-y-2",children:[e.jsx("li",{children:"• Detailed description of the problem"}),e.jsx("li",{children:"• Steps to reproduce the issue"}),e.jsx("li",{children:"• Expected vs actual behavior"}),e.jsx("li",{children:"• System information (OS, UE version, etc.)"}),e.jsx("li",{children:"• Screenshots or logs if applicable"})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Community Guidelines"}),e.jsxs("div",{className:"space-y-4 mt-4",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"Code of Conduct"}),e.jsx("p",{className:"text-gray-300",children:"We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions."})]}),e.jsxs("div",{children:[e.jsx("h3",{children:"Getting Help"}),e.jsx("p",{className:"text-gray-300",children:"If you need help with contributing:"}),e.jsxs("ul",{className:"text-gray-300 space-y-1",children:[e.jsx("li",{children:"• Check existing issues and discussions"}),e.jsx("li",{children:"• Ask questions in GitHub Discussions"}),e.jsx("li",{children:"• Join our community Discord server"}),e.jsx("li",{children:"• Review the documentation"})]})]})]})]}),e.jsxs("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e.jsx("h2",{children:"Recognition"}),e.jsx("p",{className:"text-gray-300 mb-4",children:"Contributors will be recognized in:"}),e.jsxs("ul",{className:"text-gray-300 space-y-2",children:[e.jsx("li",{children:"• Project README contributors list"}),e.jsx("li",{children:"• Release notes"}),e.jsx("li",{children:"• Community announcements"}),e.jsx("li",{children:"• Special contributor badges"})]})]})]})]});export{i as default};
