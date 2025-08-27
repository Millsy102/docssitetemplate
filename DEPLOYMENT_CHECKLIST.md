# Deployment Checklist

## Pre-Deployment Checks
- [ ] All private content moved to personal folder
- [ ] Only façade content remains in repository
- [ ] .gitignore properly configured
- [ ] GitHub workflows updated for façade only
- [ ] Security notice added
- [ ] Documentation updated

## Files to Commit (Public Façade Only)
- [ ] public/
- [ ] docs/
- [ ] scripts/setup-*.ps1
- [ ] scripts/setup-*.sh
- [ ] .github/
- [ ] README.md
- [ ] SECURITY.md
- [ ] .gitignore
- [ ] .gitattributes
- [ ] package.json (façade version)
- [ ] mkdocs.yml
- [ ] encrypted/ (if using encrypted pattern)

## Files NOT to Commit (Private)
- [ ] src/ (moved to personal folder)
- [ ] private/ (moved to personal folder)
- [ ] admin-docs/ (moved to personal folder)
- [ ] dist/ (moved to personal folder)
- [ ] node_modules/ (moved to personal folder)
- [ ] coverage/ (moved to personal folder)
- [ ] .snapshots/ (moved to personal folder)

## Post-Deployment
- [ ] Test GitHub Pages deployment
- [ ] Verify private content is not accessible
- [ ] Test build scripts in personal folder
- [ ] Update documentation links
