#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  generateFaviconsForTheme,
  THEMES,
  generateThemeConfig,
} = require('./generate-favicons');

/**
 * Test script for parameterized favicon generation
 *
 * This script demonstrates the theme system and validates
 * that all themes can be generated successfully.
 */

async function testFaviconThemes() {
  console.log('🧪 Testing Parameterized Favicon Generation\n');
  console.log('='.repeat(60));

  const results = [];
  const errors = [];

  // Test each theme
  for (const [themeKey, theme] of Object.entries(THEMES)) {
    console.log(`\n🎨 Testing Theme: ${theme.name}`);
    console.log(`📝 Description: ${theme.description}`);
    console.log(
      `🎨 Colors: ${theme.colors.primary} / ${theme.colors.background}`
    );
    console.log('-'.repeat(40));

    try {
      const themeResults = await generateFaviconsForTheme(themeKey, theme);

      if (themeResults.length > 0) {
        const totalSize = themeResults.reduce(
          (sum, result) => sum + result.fileSize,
          0
        );
        const fileCount = themeResults.length;

        console.log(
          `✅ Generated ${fileCount} files (${(totalSize / 1024).toFixed(1)}KB total)`
        );

        // Show file breakdown
        const formats = themeResults.reduce((acc, result) => {
          if (!acc[result.format]) acc[result.format] = 0;
          acc[result.format]++;
          return acc;
        }, {});

        Object.entries(formats).forEach(([format, count]) => {
          console.log(`   ${format}: ${count} files`);
        });

        results.push({
          theme: themeKey,
          name: theme.name,
          files: fileCount,
          size: totalSize,
          success: true,
        });
      } else {
        throw new Error('No files generated');
      }
    } catch (error) {
      console.error(`❌ Failed to generate theme: ${error.message}`);
      errors.push({
        theme: themeKey,
        name: theme.name,
        error: error.message,
      });
    }
  }

  // Generate theme configuration
  console.log('\n📄 Generating theme configuration...');
  try {
    const config = generateThemeConfig();
    console.log('✅ Theme configuration generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate theme configuration:', error.message);
    errors.push({
      theme: 'config',
      name: 'Theme Configuration',
      error: error.message,
    });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const successfulThemes = results.filter(r => r.success);
  const failedThemes = errors.length;

  console.log(
    `\n✅ Successful Themes: ${successfulThemes.length}/${Object.keys(THEMES).length}`
  );
  console.log(`❌ Failed Themes: ${failedThemes}`);

  if (successfulThemes.length > 0) {
    const totalFiles = successfulThemes.reduce((sum, r) => sum + r.files, 0);
    const totalSize = successfulThemes.reduce((sum, r) => sum + r.size, 0);

    console.log(`📁 Total Files Generated: ${totalFiles}`);
    console.log(`💾 Total Size: ${(totalSize / 1024).toFixed(1)}KB`);
    console.log(
      `📊 Average Size per Theme: ${(totalSize / successfulThemes.length / 1024).toFixed(1)}KB`
    );
  }

  // Show successful themes
  if (successfulThemes.length > 0) {
    console.log('\n✅ Successful Themes:');
    successfulThemes.forEach(result => {
      console.log(
        `   ${result.name}: ${result.files} files (${(result.size / 1024).toFixed(1)}KB)`
      );
    });
  }

  // Show failed themes
  if (errors.length > 0) {
    console.log('\n❌ Failed Themes:');
    errors.forEach(error => {
      console.log(`   ${error.name}: ${error.error}`);
    });
  }

  // File structure validation
  console.log('\n📁 File Structure Validation:');
  const themesDir = path.join('public', 'themes');

  if (fs.existsSync(themesDir)) {
    const themeDirs = fs.readdirSync(themesDir).filter(dir => {
      const fullPath = path.join(themesDir, dir);
      return fs.statSync(fullPath).isDirectory() && dir !== 'node_modules';
    });

    console.log(`   Themes directory: ${themesDir}`);
    console.log(`   Theme directories found: ${themeDirs.length}`);

    themeDirs.forEach(dir => {
      const themePath = path.join(themesDir, dir);
      const files = fs.readdirSync(themePath);
      console.log(`   ${dir}/: ${files.length} files`);
    });
  } else {
    console.log('   ❌ Themes directory not found');
  }

  // Performance metrics
  console.log('\n⚡ Performance Metrics:');
  if (successfulThemes.length > 0) {
    const avgFileSize =
      successfulThemes.reduce((sum, r) => sum + r.size / r.files, 0) /
      successfulThemes.length;
    console.log(`   Average file size: ${(avgFileSize / 1024).toFixed(2)}KB`);

    const compressionRatio =
      successfulThemes.reduce((sum, r) => {
        // Estimate compression ratio based on format
        const pngFiles = r.files / 4; // Assuming 4 formats per favicon
        const webpFiles = r.files / 4;
        const avifFiles = r.files / 4;
        const svgFiles = r.files / 4;

        // Estimated compression ratios
        const webpCompression = 0.7; // 30% smaller than PNG
        const avifCompression = 0.5; // 50% smaller than PNG

        return (
          sum + (webpFiles * webpCompression + avifFiles * avifCompression)
        );
      }, 0) / successfulThemes.length;

    console.log(
      `   Estimated compression ratio: ${(compressionRatio * 100).toFixed(1)}%`
    );
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (successfulThemes.length === Object.keys(THEMES).length) {
    console.log('   ✅ All themes generated successfully');
    console.log('   ✅ Ready for production use');
  } else {
    console.log('   ⚠️  Some themes failed to generate');
    console.log('   🔧 Check error messages above');
  }

  if (successfulThemes.length > 0) {
    console.log('   📱 Test favicons on different devices and browsers');
    console.log('   🎨 Consider adding more theme variants');
    console.log('   ⚡ Optimize file sizes if needed');
  }

  // Exit with appropriate code
  const exitCode = errors.length > 0 ? 1 : 0;
  console.log(
    `\n🏁 Test completed with ${exitCode === 0 ? 'success' : 'errors'}`
  );

  if (exitCode === 0) {
    console.log('🎉 All themes generated successfully!');
  } else {
    console.log('⚠️  Some themes failed. Check the errors above.');
  }

  process.exit(exitCode);
}

// Run the test
if (require.main === module) {
  testFaviconThemes().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

module.exports = { testFaviconThemes };
