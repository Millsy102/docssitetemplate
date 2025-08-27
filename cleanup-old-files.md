# Cleanup Guide: Removing Old Server Dependencies

This guide helps you clean up the old server dependencies and files that are no longer needed for the static documentation site.

## Files to Remove

### Server Dependencies (Already Removed from package.json)
The following dependencies have been removed from package.json as they're not needed for a static site:

- **Express and related**: `express`, `express-session`, `express-validator`, etc.
- **Database**: `mongoose`, `redis`, `pg`, etc.
- **Authentication**: `passport`, `bcrypt`, `jsonwebtoken`, etc.
- **File handling**: `multer`, `fs-extra`, `archiver`, etc.
- **Security**: `helmet`, `cors`, `express-rate-limit`, etc.
- **Monitoring**: `winston`, `morgan`, etc.
- **Email**: `nodemailer`
- **FTP/SSH**: `ftp-srv`, `ssh2`
- **And many more...**

### Directories to Consider Removing

These directories contain server-side code that's no longer needed:

```
_internal/system/          # Entire server system
api/                      # API endpoints
scripts/                  # Server management scripts
backup/                   # Backup files
temp/                     # Temporary files
uploads/                  # File upload directory
keys/                     # SSL/SSH keys
models/                   # Database models
```

### Files to Consider Removing

```
_internal/system/src/vercel-server.js
_internal/system/src/server.js
_internal/system/src/ftp-server.js
_internal/system/src/ssh-server.js
_internal/system/src/process-manager.js
_internal/system/package.json
_internal/system/package-lock.json
_internal/system/node_modules/
api/index.js
scripts/manage-servers.ps1
scripts/manage-servers.sh
scripts/remove-emojis.js
scripts/remove-emojis.ps1
scripts/remove-emojis.bat
scripts/simple-test.js
scripts/test-runner.js
scripts/jest.config.js
scripts/__tests__/
deploy-config.json
vercel.json
env.example
generate-secrets.js
test-env.js
test-vercel-server.js
test-pc-link.js
test-unreal-integration.js
start-ai-game-engine.js
start-enhanced-server.js
```

## New Static Site Structure

The new static site uses:

```
src/
├── components/          # React components
├── pages/              # Page components
├── App.tsx             # Main app
├── main.tsx            # Entry point
└── index.css           # Global styles

public/                 # Static assets
index.html              # HTML template
vite.config.ts          # Vite config
tailwind.config.js      # Tailwind config
postcss.config.js       # PostCSS config
package.json            # Dependencies
```

## Benefits of the New Setup

1. **Faster Development**: Vite provides instant hot reload
2. **Smaller Bundle**: Only includes what's needed
3. **Better Performance**: Static site with no server overhead
4. **Easier Deployment**: Simple GitHub Pages deployment
5. **Modern Stack**: React 18, TypeScript, Tailwind CSS
6. **Better SEO**: Static site with proper meta tags
7. **Reduced Complexity**: No database, authentication, or server management

## Migration Notes

- The old server system was over-engineered for a documentation site
- The new setup is specifically designed for static documentation
- All content has been migrated to React components
- The red and black theme has been preserved
- GitHub Actions workflow has been simplified

## Next Steps

1. Test the new development server: `npm run dev`
2. Build the production version: `npm run build`
3. Deploy to GitHub Pages
4. Remove old files once you're confident the new setup works
5. Update any external links to point to the new structure
