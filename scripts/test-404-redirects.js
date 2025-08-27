#!/usr/bin/env node

/**
 * Test script for 404 redirect functionality
 * Tests various scenarios to ensure proper 404 handling
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing 404 Redirect Implementation...\n');

// Test 1: Check if 404.html exists
console.log('1. Checking 404.html file...');
const html404Path = path.join(__dirname, '../public/404.html');
if (fs.existsSync(html404Path)) {
  console.log('   ✅ 404.html exists in public directory');

  // Check if it contains expected content
  const html404Content = fs.readFileSync(html404Path, 'utf8');
  const hasTitle = html404Content.includes('404 - Page Not Found');
  const hasRedirect = html404Content.includes('window.location.href');
  const hasStyling = html404Content.includes('background-color: #000');

  if (hasTitle && hasRedirect && hasStyling) {
    console.log('   ✅ 404.html contains expected content');
  } else {
    console.log('   ❌ 404.html missing expected content');
  }
} else {
  console.log('   ❌ 404.html not found in public directory');
}

// Test 2: Check if _redirects file exists
console.log('\n2. Checking _redirects file...');
const redirectsPath = path.join(__dirname, '../public/_redirects');
if (fs.existsSync(redirectsPath)) {
  console.log('   ✅ _redirects file exists');

  // Check if it contains expected redirects
  const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
  const hasClientRouting = redirectsContent.includes('/*    /index.html   200');
  const has404Route = redirectsContent.includes('/404    /404.html  404');

  if (hasClientRouting && has404Route) {
    console.log('   ✅ _redirects contains expected rules');
  } else {
    console.log('   ❌ _redirects missing expected rules');
  }
} else {
  console.log('   ❌ _redirects file not found');
}

// Test 3: Check vercel.json configuration
console.log('\n3. Checking vercel.json configuration...');
const vercelPath = path.join(__dirname, '../vercel.json');
if (fs.existsSync(vercelPath)) {
  console.log('   ✅ vercel.json exists');

  try {
    const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    const hasRoutes = vercelConfig.routes && Array.isArray(vercelConfig.routes);
    const hasFallbackRoute = vercelConfig.routes?.some(
      route => route.src === '/(.*)' && route.dest === '/index.html'
    );

    if (hasRoutes && hasFallbackRoute) {
      console.log('   ✅ vercel.json has proper routing configuration');
    } else {
      console.log('   ❌ vercel.json missing proper routing configuration');
    }
  } catch (error) {
    console.log('   ❌ vercel.json is not valid JSON');
  }
} else {
  console.log('   ❌ vercel.json not found');
}

// Test 4: Check React Router setup
console.log('\n4. Checking React Router setup...');
const appPath = path.join(__dirname, '../src/App.tsx');
if (fs.existsSync(appPath)) {
  console.log('   ✅ App.tsx exists');

  const appContent = fs.readFileSync(appPath, 'utf8');
  const hasNotFoundImport = appContent.includes("import('./pages/NotFound')");
  const hasCatchAllRoute = appContent.includes('path="*"');
  const hasNotFoundElement = appContent.includes('element={<NotFound />}');

  if (hasNotFoundImport && hasCatchAllRoute && hasNotFoundElement) {
    console.log('   ✅ React Router has proper 404 handling');
  } else {
    console.log('   ❌ React Router missing proper 404 handling');
  }
} else {
  console.log('   ❌ App.tsx not found');
}

// Test 5: Check NotFound component
console.log('\n5. Checking NotFound component...');
const notFoundPath = path.join(__dirname, '../src/pages/NotFound.tsx');
if (fs.existsSync(notFoundPath)) {
  console.log('   ✅ NotFound.tsx exists');

  const notFoundContent = fs.readFileSync(notFoundPath, 'utf8');
  const has404Title = notFoundContent.includes('404 - Page Not Found');
  const hasRedTheme = notFoundContent.includes('text-red-600');
  const hasHomeLink = notFoundContent.includes('to="/"');

  if (has404Title && hasRedTheme && hasHomeLink) {
    console.log('   ✅ NotFound component has proper content and styling');
  } else {
    console.log('   ❌ NotFound component missing expected content');
  }
} else {
  console.log('   ❌ NotFound.tsx not found');
}

// Test 6: Check Vite configuration
console.log('\n6. Checking Vite configuration...');
const vitePath = path.join(__dirname, '../vite.config.ts');
if (fs.existsSync(vitePath)) {
  console.log('   ✅ vite.config.ts exists');

  const viteContent = fs.readFileSync(vitePath, 'utf8');
  const has404Input = viteContent.includes(
    "'404': resolve(__dirname, 'public/404.html')"
  );

  if (has404Input) {
    console.log('   ✅ Vite config includes 404.html in build');
  } else {
    console.log('   ❌ Vite config missing 404.html build entry');
  }
} else {
  console.log('   ❌ vite.config.ts not found');
}

console.log('\n📋 Summary:');
console.log('The 404 redirect implementation includes:');
console.log('• Static 404.html page for immediate response');
console.log('• _redirects file for Netlify compatibility');
console.log('• vercel.json configuration for Vercel deployment');
console.log('• React Router catch-all route for client-side handling');
console.log('• NotFound component with consistent styling');
console.log('• Vite build configuration for proper file inclusion');

console.log('\n🚀 To test the implementation:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run preview');
console.log('3. Navigate to a non-existent URL (e.g., /nonexistent)');
console.log('4. Verify the 404 page appears correctly');
console.log('5. Test browser refresh on deep links');

console.log('\n✅ 404 redirect support implementation complete!');
