# Security Audit Guide

This document outlines the security audit setup and procedures for the BeamFlow Documentation Site.

##  Automated Security Audits

### GitHub Actions Workflow

The project includes a comprehensive security audit workflow (`.github/workflows/security-audit.yml`) that runs automatically on:

- **Push to main branch**: Triggers full security audit
- **Pull requests**: Runs security checks before merge
- **Weekly schedule**: Automated weekly security scans (Sundays at 2 AM UTC)
- **Manual trigger**: Can be run manually via GitHub Actions

### Security Checks Performed

1. **NPM Security Audit**
   - Scans dependencies for known vulnerabilities
   - Generates detailed audit reports
   - Checks for malicious packages

2. **Snyk Security Scan**
   - Advanced vulnerability scanning
   - License compliance checking
   - Real-time security monitoring

3. **CodeQL Analysis**
   - Static code analysis for security vulnerabilities
   - Identifies potential security issues in code
   - GitHub's advanced security scanning

4. **Security Headers Check**
   - Validates security headers configuration
   - Ensures proper security middleware setup
   - Tests for common security misconfigurations

5. **Dependency Vulnerability Check**
   - Identifies outdated packages
   - Checks for known malicious dependencies
   - Monitors dependency health

6. **Secrets Detection**
   - Scans for accidentally committed secrets
   - Uses TruffleHog and Gitleaks
   - Prevents credential exposure

7. **Security Best Practices**
   - Code pattern analysis
   - Configuration file security checks
   - Environment variable validation

##  Local Security Auditing

### Quick Security Checks

```bash
# Basic npm security audit
npm run security:audit

# Check for outdated packages
npm run security:outdated

# Check dependency tree
npm run security:check-deps

# Run all security scans
npm run security:scan
```

### Comprehensive Security Audit

```bash
# Run full security audit with detailed reporting
npm run security:audit:full
```

This command runs a comprehensive security audit that includes:
- Dependency vulnerability scanning
- Code pattern analysis
- Configuration file checks
- Security headers validation
- Environment variable analysis
- Detailed report generation

### Pre-commit Security Checks

Security checks are automatically run before each commit via Husky hooks:
- NPM security audit
- Code linting
- Test suite execution

##  Security Reports

### Generated Reports

1. **NPM Audit Report**: `audit-report.json`
2. **Security Audit Report**: `security-audit-report.json`
3. **GitHub Actions Artifacts**: Available in workflow runs

### Report Structure

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "summary": {
    "total": 5,
    "issues": 2,
    "warnings": 3,
    "passed": 10
  },
  "issues": [
    {
      "severity": "high",
      "category": "dependencies",
      "message": "Vulnerability description",
      "file": "package.json",
      "line": 42
    }
  ],
  "warnings": [...],
  "passed": [...]
}
```

##  Configuration

### Security Configuration File

The `.securityrc.json` file contains security policies and thresholds:

```json
{
  "security": {
    "audit": {
      "level": "moderate",
      "failOnError": true
    },
    "dependencies": {
      "checkOutdated": true,
      "checkVulnerabilities": true,
      "autoFix": false
    }
  }
}
```

### Customizing Security Checks

1. **Audit Level**: Set to `low`, `moderate`, or `high`
2. **Fail on Error**: Whether to fail builds on security issues
3. **Auto-fix**: Enable automatic vulnerability fixes
4. **Patterns**: Customize forbidden code patterns

##  Security Alerts

### GitHub Security Alerts

The repository is configured to receive:
- Dependabot security alerts
- GitHub Security Advisories
- Automated vulnerability notifications

### Response Procedures

1. **Critical Issues**: Immediate attention required
2. **High Severity**: Address within 24 hours
3. **Medium Severity**: Address within 1 week
4. **Low Severity**: Address within 1 month

##  Security Best Practices

### Code Security

-  Use environment variables for secrets
-  Implement proper input validation
-  Use HTTPS in production
-  Keep dependencies updated
-  Avoid `eval()` and `innerHTML`
-  Don't commit secrets to version control

### Configuration Security

-  Use security headers (Helmet)
-  Implement CORS properly
-  Use secure session management
-  Enable HTTPS redirects
-  Don't expose sensitive configs

### Dependency Security

-  Regular security audits
-  Pin dependency versions
-  Use lockfiles
-  Monitor for vulnerabilities
-  Don't use deprecated packages

##  Security Contacts

For security issues or questions:

1. **GitHub Issues**: Create a security issue
2. **Private Reports**: Use GitHub Security Advisories
3. **Emergency**: Contact maintainers directly

##  Continuous Security

### Automated Monitoring

- Weekly automated security scans
- Real-time vulnerability alerts
- Dependency update notifications
- Security header validation

### Manual Audits

- Monthly comprehensive security reviews
- Quarterly penetration testing
- Annual security assessments
- Regular dependency updates

---

**Note**: This security setup is designed to provide comprehensive protection while maintaining development velocity. All security checks are automated and integrated into the development workflow.
