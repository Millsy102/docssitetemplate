#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Source directory for translation files
const sourceDir = path.join(__dirname, '../src/i18n/locales')

// Destination directory in public folder
const destDir = path.join(__dirname, '../public/locales')

// Ensure destination directory exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true })
  console.log('Created locales directory in public folder')
}

// Copy all translation files
const translationFiles = fs.readdirSync(sourceDir)

translationFiles.forEach(file => {
  if (file.endsWith('.json')) {
    const sourcePath = path.join(sourceDir, file)
    const destPath = path.join(destDir, file)
    
    fs.copyFileSync(sourcePath, destPath)
    console.log(`Copied ${file} to public/locales/`)
  }
})

console.log('Translation files copied successfully!')
console.log('Available languages:', translationFiles.map(f => f.replace('.json', '')).join(', '))
