@echo off
echo 🚀 BeamFlow Complete Build and Deploy System
echo ===========================================
echo.

echo 📦 Step 1: Setting environment variables...
set SITE_TITLE=BeamFlow Documentation
set SITE_DESCRIPTION=Comprehensive documentation for the BeamFlow Unreal Engine plugin
set SITE_URL=https://millsy102.github.io/docssitetemplate
set NODE_ENV=production

echo 📦 Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo 📦 Step 3: Building main site...
call npx vite build
if errorlevel 1 (
    echo ❌ vite build failed
    pause
    exit /b 1
)

echo 🔒 Step 4: Building secret system...
cd _internal\system
call npm install
if errorlevel 1 (
    echo ❌ secret system npm install failed
    cd ..\..
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ❌ secret system build failed
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo 🖥️ Step 5: Building server components...
if exist server (
    cd server
    call npm install
    cd ..
    echo ✅ Server components built
) else (
    echo ⚠️ Server directory not found, skipping
)

echo 🖥️ Step 6: Building desktop agent...
if exist desktop-agent (
    cd desktop-agent
    call npm install
    cd ..
    echo ✅ Desktop agent built
) else (
    echo ⚠️ Desktop agent directory not found, skipping
)

echo 📦 Step 7: Creating deployment package...
if exist full-system-deploy rmdir /s /q full-system-deploy
mkdir full-system-deploy
xcopy dist full-system-deploy\public /e /i /y
if exist _internal\system\dist xcopy _internal\system\dist full-system-deploy\secret /e /i /y
mkdir full-system-deploy\backend
xcopy _internal\system\src full-system-deploy\backend\src /e /i /y
copy _internal\system\package.json full-system-deploy\backend\
copy _internal\system\package-lock.json full-system-deploy\backend\
copy api\index.js full-system-deploy\api.js
copy vercel.json full-system-deploy\
echo ✅ Deployment package created

echo 🌐 Step 8: Deploying to GitHub Pages...
call npx gh-pages -d dist
if errorlevel 1 (
    echo ❌ GitHub Pages deployment failed
) else (
    echo ✅ GitHub Pages deployed successfully
    echo    📖 Site: https://millsy102.github.io/docssitetemplate
)

echo 🚀 Step 9: Deploying to Vercel...
call vercel --prod --yes
if errorlevel 1 (
    echo ❌ Vercel deployment failed
    echo    💡 You may need to run: vercel login
) else (
    echo ✅ Vercel deployed successfully
    echo    🔒 Full system: docssitetemplate.vercel.app
)

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo =====================
echo.
echo ✅ What was built and deployed:
echo    📖 Main Documentation Site
echo    🔒 Secret System (Admin Panel, FTP/SSH)
echo    🖥️ Server Components
echo    🖥️ Desktop Agent
echo    📦 Full Deployment Package
echo.
echo 🌐 Your sites:
echo    📖 GitHub Pages: https://millsy102.github.io/docssitetemplate
echo    🔒 Vercel: docssitetemplate.vercel.app
echo    🔐 Admin Panel: /admin (on Vercel)
echo.
echo 📁 Deployment package: full-system-deploy/
echo.
echo 🚀 All systems deployed and ready!
pause
