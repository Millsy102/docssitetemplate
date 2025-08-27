# BeamFlow Authentication Guide

## 🔐 Current Authentication Issue

You're getting an "invalid user" error because the system is using hardcoded credentials instead of your environment variables.

## 🚀 Quick Fix

### Option 1: Use Default Credentials (Immediate)
The system currently uses these default credentials:
- **Username:** `admin`
- **Password:** `secret123`

Try logging in with these credentials first.

### Option 2: Set Up Environment Variables (Recommended)

1. **Create a `.env` file** in the `_internal/system` directory:

```env
# Authentication Settings
ADMIN_USERNAME=your-chosen-username
ADMIN_PASSWORD=your-chosen-password

# Other settings...
NODE_ENV=production
PORT=3000
```

2. **Restart the server** after creating the `.env` file

3. **Clear browser cache** and try logging in again

## 🔧 How to Set Up Custom Credentials

### Step 1: Create Environment File
```bash
# Navigate to the system directory
cd _internal/system

# Copy the example file
cp env.example .env

# Edit the file with your credentials
# Use any text editor to modify ADMIN_USERNAME and ADMIN_PASSWORD
```

### Step 2: Set Your Credentials
Edit the `.env` file and change these lines:
```env
ADMIN_USERNAME=your-username-here
ADMIN_PASSWORD=your-password-here
```

### Step 3: Restart the Application
```powershell
# Stop the current server (Ctrl+C)
# Then restart it
.\build-and-deploy.ps1 -DeployTarget local
```

### Step 4: Test Login
- Go to your application
- Click the login button (🔐)
- Use your new username and password

## 🔍 Troubleshooting

### If you still get "invalid user":

1. **Check the console** (F12 → Console) for any error messages
2. **Verify your `.env` file** is in the correct location: `_internal/system/.env`
3. **Make sure the server restarted** after creating the `.env` file
4. **Clear browser cache** and try again

### Debug Steps:

1. **Check if environment variables are loaded:**
   ```bash
   # In the _internal/system directory
   node -e "require('dotenv').config(); console.log('Username:', process.env.ADMIN_USERNAME); console.log('Password:', process.env.ADMIN_PASSWORD);"
   ```

2. **Check the authentication endpoint:**
   - Visit: `http://localhost:3000/api/auth/config`
   - You should see your credentials in the response

3. **Check browser console:**
   - Press F12 → Console
   - Look for any error messages about authentication

## 🔒 Security Notes

- **Never commit your `.env` file** to version control
- **Use strong passwords** for production
- **Change default credentials** immediately after setup
- **Consider using JWT tokens** for more secure authentication

## 📝 Example .env File

```env
# Authentication Settings
ADMIN_USERNAME=myadmin
ADMIN_PASSWORD=MySecurePassword123!

# Application Settings
NODE_ENV=production
PORT=3000
HOST=localhost

# Database Configuration
DATABASE_URL=mongodb://localhost:27017/beamflow
REDIS_URL=redis://localhost:6379

# JWT Settings
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
SESSION_SECRET=your-session-secret-key-change-this-in-production
```

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. **Check the server logs** for any error messages
2. **Verify the `.env` file format** (no spaces around `=`)
3. **Try the default credentials** first to confirm the system works
4. **Check if the server is running** on the correct port

---

**Need more help?** Check the console logs and server output for specific error messages.
