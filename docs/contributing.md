# Contributing

Thank you for your interest in contributing to the Documentation Site Template! This guide will help you get started.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion:

1. **Check existing issues** - Search the repository to see if the issue has already been reported
2. **Create a new issue** - Use the appropriate issue template
3. **Provide details** - Include steps to reproduce, expected behavior, and actual behavior

### Suggesting Features

We welcome feature suggestions! When suggesting a feature:

1. **Describe the feature** - What would you like to see?
2. **Explain the use case** - How would this benefit users?
3. **Consider implementation** - Is this feasible and maintainable?

### Code Contributions

#### Setting Up Development

1. **Fork the repository**
   ```bash
   git clone https://github.com/Millsy102/docssitetemplate.git
   cd docssitetemplate
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Edit files in the `docs/` folder
   - Update `mkdocs.yml` if needed
   - Test your changes locally

4. **Test your changes**
   ```bash
   mkdocs serve
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

6. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

#### Code Style Guidelines

- **Markdown**: Follow standard Markdown conventions
- **YAML**: Use consistent indentation (2 spaces)
- **Commit messages**: Use clear, descriptive messages
- **Documentation**: Update relevant documentation when adding features

### Documentation Contributions

#### Adding New Pages

1. **Create a new Markdown file** in the `docs/` folder
2. **Add front matter** (optional):
   ```markdown
   ---
   title: Your Page Title
   description: Brief description
   ---
   ```
3. **Write clear, concise content**
4. **Add to navigation** in `mkdocs.yml`

#### Improving Existing Content

- Fix typos and grammar errors
- Clarify unclear explanations
- Add missing information
- Update outdated content

### Translation Contributions

If you'd like to translate the documentation:

1. **Create a new branch** for your language
2. **Translate the content** in the `docs/` folder
3. **Update navigation** in `mkdocs.yml`
4. **Test the translation** locally

## Development Guidelines

### Local Development

1. **Install dependencies**
   ```bash
   pip install mkdocs mkdocs-material
   ```

2. **Start development server**
   ```bash
   mkdocs serve
   ```

3. **Make changes** and see them live at `http://127.0.0.1:8000`

### Testing

Before submitting a pull request:

1. **Test locally** - Ensure the site builds and runs correctly
2. **Check links** - Verify all internal and external links work
3. **Validate Markdown** - Use a Markdown linter if available
4. **Test responsiveness** - Check the site on different screen sizes

### Pull Request Process

1. **Create a descriptive title** - Summarize your changes
2. **Write a detailed description** - Explain what you changed and why
3. **Reference issues** - Link to any related issues
4. **Include screenshots** - If your changes affect the visual appearance
5. **Test thoroughly** - Ensure everything works as expected

## Community Guidelines

### Be Respectful

- Treat all contributors with respect
- Use inclusive language
- Be patient with newcomers
- Provide constructive feedback

### Communication

- Use clear, concise language
- Ask questions when you're unsure
- Help others when you can
- Stay on topic in discussions

### Quality Standards

- Write clear, well-documented code
- Follow established conventions
- Test your changes thoroughly
- Consider the impact on other users

## Recognition

Contributors will be recognized in:

- The project README
- Release notes
- Contributor statistics

## Getting Help

If you need help contributing:

1. **Check the documentation** - Start with the getting started guide
2. **Search existing issues** - Your question might already be answered
3. **Create an issue** - Ask for help with specific problems
4. **Join discussions** - Participate in community conversations

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project.

---

*Thank you for contributing to the Documentation Site Template!*
