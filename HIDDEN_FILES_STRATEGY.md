# Hidden Files Strategy

## 🎯 Goal
Keep sensitive files in the repository but make them less discoverable to casual browsers.

## 📁 File Hiding Strategies

### 1. Rename Sensitive Files
Instead of obvious names, use generic names:

**Before:**
- `SETUP.md` → `notes.md`
- `GITHUB_PAGES_README.md` → `dev-notes.md`
- `private/` → `internal/`
- `index.html` → `main.html`

### 2. Use Hidden Folders
Create folders that look innocent:
- `.hidden/` (starts with dot)
- `_internal/` (starts with underscore)
- `backup/` (looks like backup files)

### 3. Generic File Names
Use names that don't reveal purpose:
- `config.json` instead of `admin-config.json`
- `data/` instead of `sensitive-data/`
- `temp/` instead of `secret-files/`

### 4. Scatter Files
Don't put all sensitive files in one place:
- Spread them across different folders
- Mix with legitimate files
- Use subdirectories

## 🔧 Implementation

### Step 1: Create Hidden Structure
```
.hidden/
├── setup.md
├── config.json
└── admin/

_internal/
├── system/
├── data/
└── backup/

backup/
├── old-files/
└── archive/
```

### Step 2: Move Sensitive Files
- Move `SETUP.md` → `.hidden/setup.md`
- Move `private/` → `_internal/system/`
- Move `dist/` → `backup/build/`
- Move `assets/` → `_internal/assets/`

### Step 3: Update References
- Update any internal links
- Update build scripts
- Update documentation references

## ✅ Benefits
- Files stay in repository
- Less obvious to casual browsers
- Still accessible when needed
- Maintains functionality

## ⚠️ Considerations
- Need to remember where files are
- May need to update scripts
- Should document the structure privately
