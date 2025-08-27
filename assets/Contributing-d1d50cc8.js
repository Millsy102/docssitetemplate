import{j as i,a as e}from"./main-de056cc1.js";import"./vendor-3c8011bb.js";import"./router-efb9e7eb.js";const t=()=>i("div",{className:"max-w-4xl",children:[e("h1",{children:"Contributing to BeamFlow"}),e("p",{className:"text-xl text-gray-300 mb-8",children:"Thank you for your interest in contributing to BeamFlow! We welcome contributions from the community."}),i("div",{className:"space-y-8",children:[i("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"How to Contribute"}),e("p",{className:"text-gray-300 mb-4",children:"There are many ways to contribute to BeamFlow:"}),i("ul",{className:"text-gray-300 space-y-2",children:[e("li",{children:"• 🐛 Report bugs and issues"}),e("li",{children:"• 💡 Suggest new features"}),e("li",{children:"• 📝 Improve documentation"}),e("li",{children:"• 🔧 Submit code improvements"}),e("li",{children:"• 🧪 Help with testing"}),e("li",{children:"• 🌍 Translate documentation"})]})]}),i("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Development Setup"}),i("div",{className:"space-y-4 mt-4",children:[i("div",{children:[e("h3",{children:"Prerequisites"}),i("ul",{className:"text-gray-300 space-y-2",children:[e("li",{children:"• Unreal Engine 5.0+ source code"}),e("li",{children:"• Visual Studio 2019+ (Windows)"}),e("li",{children:"• Git and GitHub account"}),e("li",{children:"• Basic knowledge of C++ and Unreal Engine"})]})]}),i("div",{children:[e("h3",{children:"Getting the Source"}),e("pre",{children:e("code",{children:`# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/yourusername/beamflow-plugin.git

# Add the original repository as upstream
git remote add upstream https://github.com/original-owner/beamflow-plugin.git

# Create a new branch for your changes
git checkout -b feature/your-feature-name`})})]})]})]}),i("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Coding Standards"}),i("div",{className:"space-y-4 mt-4",children:[i("div",{children:[e("h3",{children:"C++ Guidelines"}),i("ul",{className:"text-gray-300 space-y-2",children:[e("li",{children:"• Follow Unreal Engine coding standards"}),e("li",{children:"• Use meaningful variable and function names"}),e("li",{children:"• Add comments for complex logic"}),e("li",{children:"• Include proper error handling"}),e("li",{children:"• Write unit tests for new features"})]})]}),i("div",{children:[e("h3",{children:"Code Style"}),e("pre",{children:e("code",{children:`// Good example
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
};`})})]})]})]}),i("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Submitting Changes"}),i("div",{className:"space-y-4 mt-4",children:[i("div",{children:[e("h3",{children:"Pull Request Process"}),i("ol",{className:"text-gray-300 space-y-2",children:[e("li",{children:"1. Ensure your code follows our standards"}),e("li",{children:"2. Test your changes thoroughly"}),e("li",{children:"3. Update documentation if needed"}),e("li",{children:"4. Create a descriptive pull request"}),e("li",{children:"5. Respond to review comments"})]})]}),i("div",{children:[e("h3",{children:"Pull Request Template"}),e("pre",{children:e("code",{children:`## Description
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
- [ ] No breaking changes`})})]})]})]}),i("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Issue Reporting"}),e("p",{className:"text-gray-300 mb-4",children:"When reporting issues, please include:"}),i("ul",{className:"text-gray-300 space-y-2",children:[e("li",{children:"• Detailed description of the problem"}),e("li",{children:"• Steps to reproduce the issue"}),e("li",{children:"• Expected vs actual behavior"}),e("li",{children:"• System information (OS, UE version, etc.)"}),e("li",{children:"• Screenshots or logs if applicable"})]})]}),i("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Community Guidelines"}),i("div",{className:"space-y-4 mt-4",children:[i("div",{children:[e("h3",{children:"Code of Conduct"}),e("p",{className:"text-gray-300",children:"We are committed to providing a welcoming and inclusive environment for all contributors. Please be respectful and constructive in all interactions."})]}),i("div",{children:[e("h3",{children:"Getting Help"}),e("p",{className:"text-gray-300",children:"If you need help with contributing:"}),i("ul",{className:"text-gray-300 space-y-1",children:[e("li",{children:"• Check existing issues and discussions"}),e("li",{children:"• Ask questions in GitHub Discussions"}),e("li",{children:"• Join our community Discord server"}),e("li",{children:"• Review the documentation"})]})]})]})]}),i("div",{className:"bg-gray-800 p-6 rounded-lg border border-gray-700",children:[e("h2",{children:"Recognition"}),e("p",{className:"text-gray-300 mb-4",children:"Contributors will be recognized in:"}),i("ul",{className:"text-gray-300 space-y-2",children:[e("li",{children:"• Project README contributors list"}),e("li",{children:"• Release notes"}),e("li",{children:"• Community announcements"}),e("li",{children:"• Special contributor badges"})]})]})]})]});export{t as default};
