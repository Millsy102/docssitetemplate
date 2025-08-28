#!/usr/bin/env node

/**
 * Convert Markdown to HTML Script
 * Converts markdown files to HTML files for proper routing
 */

const fs = require('fs');
const path = require('path');

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown) {
    let html = markdown;
    
    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
    // Convert lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    
    // Wrap lists in ul tags
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    
    // Convert paragraphs
    html = html.replace(/^(?!<[h|u|p|d|s|a|b|i|c|p])(.+)$/gim, '<p>$1</p>');
    
    // Clean up multiple consecutive p tags
    html = html.replace(/<\/p>\s*<p>/g, '</p>\n<p>');
    
    return html;
}

function createHtmlPage(title, content, basePath = '/docssitetemplate/') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - BeamFlow Documentation</title>
    <meta name="description" content="${title} for the BeamFlow Unreal Engine plugin">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://Millsy102.github.io${basePath}">
    <meta property="og:title" content="${title} - BeamFlow Documentation">
    <meta property="og:description" content="${title} for the BeamFlow Unreal Engine plugin">
    
    <!-- Twitter Card data -->
    <meta name="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://Millsy102.github.io${basePath}">
    <meta name="twitter:title" content="${title} - BeamFlow Documentation">
    <meta name="twitter:description" content="${title} for the BeamFlow Unreal Engine plugin">

    <!-- Theme color -->
    <meta name="theme-color" content="#dc2626">
    <meta name="msapplication-TileColor" content="#dc2626">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #000;
            color: #e5e7eb;
            line-height: 1.6;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 1rem;
        }
        
        header {
            background-color: #000;
            border-bottom: 2px solid #dc2626;
            padding: 1rem 0;
        }
        
        .header-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: inherit;
        }
        
        .logo-icon {
            width: 2rem;
            height: 2rem;
            background-color: #dc2626;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 1.125rem;
        }
        
        .logo-text {
            font-size: 1.5rem;
            font-weight: bold;
            color: #dc2626;
        }
        
        .logo-subtitle {
            color: #9ca3af;
            font-size: 0.875rem;
        }
        
        nav {
            display: flex;
            gap: 1.5rem;
        }
        
        nav a {
            color: #d1d5db;
            text-decoration: none;
            transition: color 0.2s;
        }
        
        nav a:hover {
            color: #dc2626;
        }
        
        main {
            padding: 3rem 0;
            min-height: calc(100vh - 200px);
        }
        
        .content {
            background-color: #111827;
            border: 1px solid #374151;
            border-radius: 0.5rem;
            padding: 2rem;
            margin-bottom: 2rem;
        }
        
        .content h1, .content h2, .content h3 {
            color: #dc2626;
            margin-bottom: 1rem;
        }
        
        .content p {
            color: #d1d5db;
            margin-bottom: 1rem;
        }
        
        .content ul {
            color: #d1d5db;
            margin-bottom: 1rem;
            padding-left: 2rem;
        }
        
        .content li {
            margin-bottom: 0.5rem;
        }
        
        .content code {
            background-color: #374151;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: 'Courier New', monospace;
        }
        
        .content pre {
            background-color: #374151;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin-bottom: 1rem;
        }
        
        .content pre code {
            background: none;
            padding: 0;
        }
        
        .btn {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            text-decoration: none;
            transition: background-color 0.2s;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
        }
        
        .btn:hover {
            background-color: #b91c1c;
        }
        
        .btn-secondary {
            background-color: #374151;
        }
        
        .btn-secondary:hover {
            background-color: #4b5563;
        }
        
        footer {
            background-color: #000;
            border-top: 2px solid #dc2626;
            padding: 2rem 0;
            text-align: center;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .footer-links {
            display: flex;
            gap: 2rem;
        }
        
        .footer-links a {
            color: #9ca3af;
            text-decoration: none;
            transition: color 0.2s;
        }
        
        .footer-links a:hover {
            color: #dc2626;
        }
        
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 1rem;
            }
            
            nav {
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .footer-content {
                flex-direction: column;
                text-align: center;
            }
            
            .footer-links {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <a href="${basePath}" class="logo">
                    <div class="logo-icon">B</div>
                    <div>
                        <div class="logo-text">BeamFlow</div>
                        <div class="logo-subtitle">for Unreal Engine</div>
                    </div>
                </a>
                <nav>
                    <a href="${basePath}">Home</a>
                    <a href="${basePath}installation.html">Installation</a>
                    <a href="${basePath}getting-started.html">Getting Started</a>
                    <a href="${basePath}contributing.html">Contributing</a>
                </nav>
            </div>
        </div>
    </header>

    <main>
        <div class="container">
            <div class="content">
                ${content}
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
                <a href="${basePath}" class="btn">← Back to Home</a>
            </div>
        </div>
    </main>

    <footer>
        <div class="container">
            <div class="footer-content">
                <div>
                    <p style="color: #9ca3af;"><a href="${basePath}admin/" style="color: #9ca3af; text-decoration: none; cursor: pointer;">©</a> 2024 BeamFlow. Built with  for developers.</p>
                </div>
                <div class="footer-links">
                    <a href="https://github.com/Millsy102/docssitetemplate" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://github.com/Millsy102/docssitetemplate/issues" target="_blank" rel="noopener noreferrer">Issues</a>
                    <a href="${basePath}contributing.html">Contributing</a>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>`;
}

async function convertMarkdownFiles() {
    const distDir = 'dist';
    const basePath = '/docssitetemplate/';
    
    // Files to convert
    const files = [
        { markdown: 'installation.md', html: 'installation.html', title: 'Installation' },
        { markdown: 'getting-started.md', html: 'getting-started.html', title: 'Getting Started' },
        { markdown: 'contributing.md', html: 'contributing.html', title: 'Contributing' }
    ];
    
    console.log('Converting markdown files to HTML...');
    
    for (const file of files) {
        const markdownPath = path.join(distDir, file.markdown);
        const htmlPath = path.join(distDir, file.html);
        
        try {
            if (fs.existsSync(markdownPath)) {
                const markdownContent = fs.readFileSync(markdownPath, 'utf8');
                const htmlContent = convertMarkdownToHtml(markdownContent);
                const fullHtml = createHtmlPage(file.title, htmlContent, basePath);
                
                fs.writeFileSync(htmlPath, fullHtml);
                console.log(`✓ Converted ${file.markdown} to ${file.html}`);
            } else {
                console.log(`⚠ Markdown file not found: ${file.markdown}`);
            }
        } catch (error) {
            console.error(`✗ Error converting ${file.markdown}:`, error.message);
        }
    }
    
    console.log('Markdown conversion completed!');
}

// Run the script if executed directly
if (require.main === module) {
    convertMarkdownFiles();
}

module.exports = { convertMarkdownFiles, convertMarkdownToHtml, createHtmlPage };
