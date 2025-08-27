# Encrypted Directory

This directory contains encrypted artifacts from the private application (optional feature).

## Purpose

In the **docs façade pattern**, this directory serves as an optional storage location for encrypted versions of the private application code. This allows the private app to be distributed via the public repository while maintaining security.

## Contents

- `manifest.enc` - Encrypted manifest file containing metadata
- `key.enc` - Encrypted key file for decryption
- `chunks/*.js.enc` - Encrypted JavaScript chunks from the private app build

## Usage

### For Developers (Optional)

If you choose to use the encrypted-on-GH pattern:

1. Build your private app: `~/millsy-admin/bin/Build-Private.ps1`
2. Encrypt the build: `~/millsy-admin/bin/Encrypt-Private.ps1`
3. The encrypted artifacts will be synced here automatically

### For Users

The encrypted artifacts are automatically decrypted and loaded when needed by the façade application.

## Security

- All files in this directory are encrypted with AES-256-CBC
- The passphrase is stored securely and not committed to version control
- Without the correct passphrase, these files are cryptographically secure
- The encryption is handled by the `encrypt.js` script in the private development folder

## Alternative: Direct Deployment

Instead of using encrypted artifacts, you can deploy your private app directly to a VPS behind Cloudflare Access, eliminating the need for this directory entirely.

---

**Note**: This directory is optional. The docs façade pattern works with or without encrypted artifacts.
