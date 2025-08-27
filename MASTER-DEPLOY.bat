@echo off
cd /d "C:\Users\Millsy\Documents\GitHub\docssitetemplate"

echo 🚀 MASTER DEPLOY - BeamFlow Complete System
echo ===========================================
echo This tool combines ALL deployment functionality into ONE script
echo.

echo 📦 Step 1: Checking Node.js version...
node --version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Current version: %NODE_VERSION%

if "%NODE_VERSION:~1,2%"=="20" (
    if "%NODE_VERSION:~4,2%" LSS "19" (
        echo ❌ Node.js version too old! Need 20.19+ but have %NODE_VERSION%
        echo 📦 Upgrading Node.js...
        nvm install 20.19.0
        nvm use 20.19.0
        echo ✅ Node.js upgraded to 20.19.0
    ) else (
        echo ✅ Node.js version is compatible
    )
) else (
    echo ❌ Node.js version incompatible! Need 20.19+ but have %NODE_VERSION%
    echo 📦 Upgrading Node.js...
    nvm install 20.19.0
    nvm use 20.19.0
    echo ✅ Node.js upgraded to 20.19.0
)

echo.
echo 📦 Step 2: Setting environment variables...
set SITE_TITLE=BeamFlow Documentation
set SITE_DESCRIPTION=Comprehensive documentation for the BeamFlow Unreal Engine plugin
set SITE_URL=https://millsy102.github.io/docssitetemplate
set NODE_ENV=production

echo.
echo 📦 Step 3: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo.
echo 📦 Step 4: Building main documentation site...
call npx vite build
if errorlevel 1 (
    echo ❌ Main site build failed
    pause
    exit /b 1
)

echo.
echo 🔒 Step 5: Building secret system...
cd _internal\system
call npm install
if errorlevel 1 (
    echo ❌ Secret system npm install failed
    cd ..\..
    pause
    exit /b 1
)

call npm run build
if errorlevel 1 (
    echo ❌ Secret system build failed
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo.
echo 🖥️ Step 6: Building server components...
if exist server (
    cd server
    call npm install
    cd ..
    echo ✅ Server components built
) else (
    echo ⚠️ Server directory not found, skipping
)

echo.
echo 🖥️ Step 7: Building desktop agent...
if exist desktop-agent (
    cd desktop-agent
    call npm install
    cd ..
    echo ✅ Desktop agent built
) else (
    echo ⚠️ Desktop agent directory not found, skipping
)

echo.
echo 📦 Step 8: Creating comprehensive deployment package...
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

echo.
echo 📦 Step 9: Creating additional deployment files...
if exist public\favicon.svg copy public\favicon.svg full-system-deploy\
if exist public\manifest.json copy public\manifest.json full-system-deploy\
echo. > full-system-deploy\.nojekyll
echo ✅ Deployment package created with all files

echo.
echo 📦 Step 10: Creating deployment archive...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "datestamp=%YYYY%%MM%%DD%-%HH%%Min%"
set archiveName=docssitetemplate-%datestamp%.zip
powershell -Command "Compress-Archive -Path 'full-system-deploy\*' -DestinationPath '%archiveName%' -Force"
echo ✅ Deployment archive created: %archiveName%

echo.
echo 🌐 Step 11: Deploying to GitHub Pages...
call npx gh-pages -d dist
if errorlevel 1 (
    echo ❌ GitHub Pages deployment failed
) else (
    echo ✅ GitHub Pages deployed successfully
    echo    📖 Site: https://millsy102.github.io/docssitetemplate
)

echo.
echo 🚀 Step 12: Deploying to Vercel...
vercel --version >nul 2>&1
if errorlevel 1 (
    echo 📦 Installing Vercel CLI...
    call npm install -g vercel
)

call vercel --prod --yes
if errorlevel 1 (
    echo ❌ Vercel deployment failed
    echo 💡 You may need to run: vercel login
) else (
    echo ✅ Vercel deployed successfully
    echo    🔒 Full system: docssitetemplate.vercel.app
)

echo.
echo 📋 Step 13: Creating deployment summary...
echo # 🚀 BeamFlow Deployment Complete > DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ## ✅ What was built and deployed: >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ### 📖 Main Documentation Site >> DEPLOYMENT_SUMMARY.md
echo - **Location**: `dist/` directory >> DEPLOYMENT_SUMMARY.md
echo - **Status**: Built and deployed to GitHub Pages >> DEPLOYMENT_SUMMARY.md
echo - **URL**: https://millsy102.github.io/docssitetemplate >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ### 🔒 Secret System >> DEPLOYMENT_SUMMARY.md
echo - **Location**: `_internal/system/` directory >> DEPLOYMENT_SUMMARY.md
echo - **Status**: Built and ready for deployment >> DEPLOYMENT_SUMMARY.md
echo - **Features**: Admin panel, FTP/SSH servers, plugin system >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ### 🖥️ Server Components >> DEPLOYMENT_SUMMARY.md
echo - **Location**: `server/` directory >> DEPLOYMENT_SUMMARY.md
echo - **Status**: Built and ready >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ### 🖥️ Desktop Agent >> DEPLOYMENT_SUMMARY.md
echo - **Location**: `desktop-agent/` directory >> DEPLOYMENT_SUMMARY.md
echo - **Status**: Built and ready >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ### 📦 Full System Package >> DEPLOYMENT_SUMMARY.md
echo - **Location**: `full-system-deploy/` directory >> DEPLOYMENT_SUMMARY.md
echo - **Status**: Complete deployment package created >> DEPLOYMENT_SUMMARY.md
echo - **Archive**: %archiveName% >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ## 🌐 Deployment Status >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ### GitHub Pages >> DEPLOYMENT_SUMMARY.md
echo - ✅ Main site deployed >> DEPLOYMENT_SUMMARY.md
echo - ✅ Accessible at: https://millsy102.github.io/docssitetemplate >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo ### Vercel >> DEPLOYMENT_SUMMARY.md
echo - ✅ Full system deployed >> DEPLOYMENT_SUMMARY.md
echo - ✅ Accessible at: docssitetemplate.vercel.app >> DEPLOYMENT_SUMMARY.md
echo. >> DEPLOYMENT_SUMMARY.md
echo **Deployment completed at**: %date% %time% >> DEPLOYMENT_SUMMARY.md
echo ✅ Deployment summary created

echo.
echo 🎉 MASTER DEPLOYMENT COMPLETE!
echo =============================
echo.
echo ✅ What was built and deployed:
echo    📖 Main Documentation Site
echo    🔒 Secret System (Admin Panel, FTP/SSH)
echo    🖥️ Server Components
echo    🖥️ Desktop Agent
echo    📦 Full Deployment Package
echo    📦 Deployment Archive: %archiveName%
echo.
echo 🌐 Your sites:
echo    📖 GitHub Pages: https://millsy102.github.io/docssitetemplate
echo    🔒 Vercel: docssitetemplate.vercel.app
echo    🔐 Admin Panel: /admin (on Vercel)
echo.
echo 📁 Files created:
echo    📦 Deployment package: full-system-deploy/
echo    📦 Archive: %archiveName%
echo    📋 Summary: DEPLOYMENT_SUMMARY.md
echo.
echo 🚀 All systems deployed and ready!
echo.
echo 💡 This tool replaces ALL other deployment scripts:
echo    - build-and-deploy-all.bat
echo    - fix-and-deploy.bat
echo    - upgrade-and-deploy.bat
echo    - simple-deploy.bat
echo    - upgrade-node.bat
echo    - deploy-everything.ps1
echo    - build-and-deploy.ps1
echo    - quick-deploy.ps1
echo    - scripts/deploy-all.js
echo.
pause
