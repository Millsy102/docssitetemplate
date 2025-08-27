#!/usr/bin/env bash
# Setup Personal Development Folder for Docs Façade Pattern
# This script creates the ~/millsy-admin structure for private app development

set -euo pipefail

PROJECT_NAME="${1:-beam-site}"
BASE_PATH="${2:-$HOME/millsy-admin}"

echo "Setting up personal development folder for docs façade pattern..."

# Create base directory structure
SITES_PATH="$BASE_PATH/sites/$PROJECT_NAME"
PRIVATE_APP_PATH="$SITES_PATH/private-app"
ENCRYPT_PATH="$SITES_PATH/encrypt"
BIN_PATH="$BASE_PATH/bin"
TEMPLATES_PATH="$BASE_PATH/templates"
TMP_PATH="$BASE_PATH/tmp"

# Create directories
DIRECTORIES=(
    "$BASE_PATH"
    "$BASE_PATH/sites"
    "$SITES_PATH"
    "$PRIVATE_APP_PATH"
    "$ENCRYPT_PATH"
    "$BIN_PATH"
    "$TEMPLATES_PATH"
    "$TMP_PATH"
)

for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo "Created: $dir"
    else
        echo "Exists: $dir"
    fi
done

# Create build script
BUILD_SCRIPT="#!/usr/bin/env bash
set -euo pipefail
PROJECT=\"\${1:-$PROJECT_NAME}\"
BASE=\"\$HOME/millsy-admin/sites/\$PROJECT\"
APP=\"\$BASE/private-app\"
OUT=\"\$APP/dist\"

cd \"\$APP\"
if [ -f package.json ]; then
  npm ci
  npm run build
else
  echo \"No package.json — place your private app here.\"; exit 1
fi

echo \"Build complete → \$OUT\"
"

BUILD_SCRIPT_PATH="$BIN_PATH/build_private.sh"
echo "$BUILD_SCRIPT" > "$BUILD_SCRIPT_PATH"
chmod +x "$BUILD_SCRIPT_PATH"
echo "Created build script: $BUILD_SCRIPT_PATH"

# Create encrypt script
ENCRYPT_SCRIPT="#!/usr/bin/env bash
set -euo pipefail
PROJECT=\"\${1:-$PROJECT_NAME}\"
BASE=\"\$HOME/millsy-admin/sites/\$PROJECT\"
APP=\"\$BASE/private-app\"
ENC=\"\$BASE/encrypt/encrypt.js\"
PUB_REPO_PATH=\"\${2:-\$HOME/code/docssitetemplate}\"

export BUNDLE_PASSPHRASE=\${BUNDLE_PASSPHRASE:-test-pass}
node \"\$ENC\"

mkdir -p \"\$PUB_REPO_PATH/encrypted\"
cp -r \"\$BASE/encrypted/\"* \"\$PUB_REPO_PATH/encrypted/\"

echo \"Encrypted artifacts synced → \$PUB_REPO_PATH/encrypted\"
"

ENCRYPT_SCRIPT_PATH="$BIN_PATH/encrypt_private.sh"
echo "$ENCRYPT_SCRIPT" > "$ENCRYPT_SCRIPT_PATH"
chmod +x "$ENCRYPT_SCRIPT_PATH"
echo "Created encrypt script: $ENCRYPT_SCRIPT_PATH"

# Create basic encrypt.js template
ENCRYPT_JS_TEMPLATE="// Encryption helper for private app
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PASSPHRASE = process.env.BUNDLE_PASSPHRASE || 'test-pass';
const PRIVATE_APP_PATH = path.join(__dirname, '..', 'private-app', 'dist');
const ENCRYPTED_PATH = path.join(__dirname, 'encrypted');

// Ensure encrypted directory exists
if (!fs.existsSync(ENCRYPTED_PATH)) {
  fs.mkdirSync(ENCRYPTED_PATH, { recursive: true });
}

function encryptFile(inputPath, outputPath) {
  const content = fs.readFileSync(inputPath);
  const cipher = crypto.createCipher('aes-256-cbc', PASSPHRASE);
  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  fs.writeFileSync(outputPath, encrypted);
}

function encryptDirectory() {
  if (!fs.existsSync(PRIVATE_APP_PATH)) {
    console.error('Private app dist directory not found:', PRIVATE_APP_PATH);
    return;
  }

  const files = fs.readdirSync(PRIVATE_APP_PATH, { recursive: true });
  
  files.forEach(file => {
    if (fs.statSync(path.join(PRIVATE_APP_PATH, file)).isFile()) {
      const inputPath = path.join(PRIVATE_APP_PATH, file);
      const outputPath = path.join(ENCRYPTED_PATH, file + '.enc');
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      encryptFile(inputPath, outputPath);
      console.log('Encrypted:', file);
    }
  });

  // Create manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    files: files.filter(f => fs.statSync(path.join(PRIVATE_APP_PATH, f)).isFile()),
    version: '1.0.0'
  };
  
  const manifestPath = path.join(ENCRYPTED_PATH, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Created manifest:', manifestPath);
}

encryptDirectory();
"

ENCRYPT_JS_PATH="$ENCRYPT_PATH/encrypt.js"
echo "$ENCRYPT_JS_TEMPLATE" > "$ENCRYPT_JS_PATH"
echo "Created encrypt.js template: $ENCRYPT_JS_PATH"

# Create README for private folder
PRIVATE_README="# Private App Development Folder

This folder contains the real application code that is NOT committed to the public repository.

## Structure

- \`private-app/\` - Your full real site (source of truth)
- \`encrypt/\` - Encryption utilities for optional encrypted-on-GH pattern
- \`dist/\` - Build output (never committed)

## Usage

1. Place your private application code in \`private-app/\`
2. Build with: \`~/millsy-admin/bin/build_private.sh $PROJECT_NAME\`
3. (Optional) Encrypt with: \`~/millsy-admin/bin/encrypt_private.sh $PROJECT_NAME\`

## Security

- This folder is NOT in version control
- Contains sensitive configuration and real application code
- Only you have access to this content
- Public repo sees only the façade + optional encrypted blobs
"

PRIVATE_README_PATH="$SITES_PATH/README-private.md"
echo "$PRIVATE_README" > "$PRIVATE_README_PATH"
echo "Created private README: $PRIVATE_README_PATH"

# Create basic package.json template for private app
PACKAGE_JSON_TEMPLATE="{
  \"name\": \"$PROJECT_NAME-private\",
  \"version\": \"1.0.0\",
  \"description\": \"Private application code (not in public repo)\",
  \"private\": true,
  \"scripts\": {
    \"dev\": \"vite\",
    \"build\": \"vite build\",
    \"preview\": \"vite preview\",
    \"test\": \"jest\"
  },
  \"dependencies\": {
    \"react\": \"^18.2.0\",
    \"react-dom\": \"^18.2.0\"
  },
  \"devDependencies\": {
    \"@vitejs/plugin-react\": \"^4.0.0\",
    \"vite\": \"^4.4.0\"
  }
}
"

PACKAGE_JSON_PATH="$PRIVATE_APP_PATH/package.json"
if [ ! -f "$PACKAGE_JSON_PATH" ]; then
    echo "$PACKAGE_JSON_TEMPLATE" > "$PACKAGE_JSON_PATH"
    echo "Created package.json template: $PACKAGE_JSON_PATH"
fi

echo ""
echo "Personal development folder setup complete!"
echo ""
echo "Next steps:"
echo "1. Move your private app code to: $PRIVATE_APP_PATH"
echo "2. Build with: $BIN_PATH/build_private.sh"
echo "3. (Optional) Encrypt with: $BIN_PATH/encrypt_private.sh"
echo ""
echo "Remember: This folder is NOT in version control!"
