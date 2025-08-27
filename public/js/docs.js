// Documentation specific JavaScript functionality

class DocsEnhancer {
    constructor() {
        this.currentPage = window.location.pathname;
        this.tocItems = [];
        this.init();
    }

    init() {
        this.setupTableOfContents();
        this.setupCodeHighlighting();
        this.setupCopyButtons();
        this.setupBreadcrumbs();
        this.setupPageNavigation();
        this.setupAnchorLinks();
        this.setupResponsiveTables();
        this.setupImageZoom();
        this.setupKeyboardShortcuts();
    }

    // Table of Contents
    setupTableOfContents() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const tocContainer = document.querySelector('.toc-list');
        
        if (!tocContainer || headings.length === 0) return;

        headings.forEach((heading, index) => {
            // Add ID if not present
            if (!heading.id) {
                heading.id = `heading-${index}`;
            }

            const tocItem = {
                element: heading,
                id: heading.id,
                text: heading.textContent,
                level: parseInt(heading.tagName.charAt(1))
            };

            this.tocItems.push(tocItem);
        });

        this.renderTableOfContents(tocContainer);
        this.setupTocScrollSpy();
    }

    renderTableOfContents(container) {
        const html = this.tocItems.map(item => {
            const indent = (item.level - 1) * 20;
            return `
                <li class="toc-item" style="padding-left: ${indent}px">
                    <a href="#${item.id}" class="toc-link" data-target="${item.id}">
                        ${item.text}
                    </a>
                </li>
            `;
        }).join('');

        container.innerHTML = html;
    }

    setupTocScrollSpy() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocLink = document.querySelector(`.toc-link[data-target="${id}"]`);
                
                if (entry.isIntersecting) {
                    // Remove active class from all links
                    document.querySelectorAll('.toc-link').forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    // Add active class to current link
                    if (tocLink) {
                        tocLink.classList.add('active');
                    }
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '-20% 0px -80% 0px'
        });

        this.tocItems.forEach(item => {
            observer.observe(item.element);
        });
    }

    // Code Highlighting
    setupCodeHighlighting() {
        const codeBlocks = document.querySelectorAll('pre code');
        
        codeBlocks.forEach(block => {
            // Add language class if not present
            if (!block.className.includes('language-')) {
                block.className = 'language-javascript';
            }

            // Add copy button
            this.addCopyButton(block);
            
            // Add line numbers
            this.addLineNumbers(block);
        });
    }

    addCopyButton(codeBlock) {
        const pre = codeBlock.parentElement;
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button';
        copyButton.innerHTML = '📋';
        copyButton.setAttribute('aria-label', 'Copy code');
        copyButton.title = 'Copy to clipboard';

        copyButton.addEventListener('click', () => {
            this.copyToClipboard(codeBlock.textContent);
            copyButton.innerHTML = '✅';
            copyButton.title = 'Copied!';
            
            setTimeout(() => {
                copyButton.innerHTML = '📋';
                copyButton.title = 'Copy to clipboard';
            }, 2000);
        });

        pre.style.position = 'relative';
        pre.appendChild(copyButton);
    }

    addLineNumbers(codeBlock) {
        const lines = codeBlock.textContent.split('\n');
        if (lines.length <= 1) return;

        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';
        
        lines.forEach((_, index) => {
            const lineNumber = document.createElement('span');
            lineNumber.textContent = index + 1;
            lineNumbers.appendChild(lineNumber);
        });

        const pre = codeBlock.parentElement;
        pre.appendChild(lineNumbers);
    }

    // Copy functionality
    setupCopyButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.copy-button')) {
                const codeBlock = e.target.parentElement.querySelector('code');
                if (codeBlock) {
                    this.copyToClipboard(codeBlock.textContent);
                }
            }
        });
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Code copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Code copied to clipboard!', 'success');
        }
    }

    // Breadcrumbs
    setupBreadcrumbs() {
        const breadcrumbsContainer = document.querySelector('.breadcrumbs');
        if (!breadcrumbsContainer) return;

        const pathSegments = this.currentPage.split('/').filter(segment => segment);
        const breadcrumbs = ['Home'];

        pathSegments.forEach((segment, index) => {
            const displayName = this.formatBreadcrumbName(segment);
            breadcrumbs.push(displayName);
        });

        const html = breadcrumbs.map((crumb, index) => {
            if (index === breadcrumbs.length - 1) {
                return `<span class="breadcrumb-item"><span class="breadcrumb-current">${crumb}</span></span>`;
            } else {
                const url = index === 0 ? '/' : '/' + pathSegments.slice(0, index).join('/');
                return `
                    <span class="breadcrumb-item">
                        <a href="${url}" class="breadcrumb-link">${crumb}</a>
                        <span class="breadcrumb-separator">/</span>
                    </span>
                `;
            }
        }).join('');

        breadcrumbsContainer.innerHTML = html;
    }

    formatBreadcrumbName(segment) {
        return segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    // Page Navigation
    setupPageNavigation() {
        const pageNav = document.querySelector('.page-nav');
        if (!pageNav) return;

        // This would typically come from a CMS or API
        const navigationData = this.getNavigationData();
        const currentIndex = navigationData.findIndex(item => item.url === this.currentPage);
        
        if (currentIndex === -1) return;

        const prevItem = currentIndex > 0 ? navigationData[currentIndex - 1] : null;
        const nextItem = currentIndex < navigationData.length - 1 ? navigationData[currentIndex + 1] : null;

        const html = `
            ${prevItem ? `
                <a href="${prevItem.url}" class="page-nav-link prev">
                    <span>←</span>
                    <span>${prevItem.title}</span>
                </a>
            ` : '<div></div>'}
            
            ${nextItem ? `
                <a href="${nextItem.url}" class="page-nav-link next">
                    <span>${nextItem.title}</span>
                    <span>→</span>
                </a>
            ` : '<div></div>'}
        `;

        pageNav.innerHTML = html;
    }

    getNavigationData() {
        // This would typically come from a CMS or API
        return [
            { title: 'Getting Started', url: '/docs/getting-started' },
            { title: 'Installation', url: '/docs/installation' },
            { title: 'Basic Concepts', url: '/docs/basic-concepts' },
            { title: 'Advanced Topics', url: '/docs/advanced-topics' }
        ];
    }

    // Anchor Links
    setupAnchorLinks() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headings.forEach(heading => {
            if (!heading.id) return;
            
            const anchor = document.createElement('a');
            anchor.href = `#${heading.id}`;
            anchor.className = 'heading-anchor';
            anchor.innerHTML = '#';
            anchor.setAttribute('aria-label', `Link to ${heading.textContent}`);
            
            heading.appendChild(anchor);
        });
    }

    // Responsive Tables
    setupResponsiveTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    // Image Zoom
    setupImageZoom() {
        const images = document.querySelectorAll('.content-article img');
        
        images.forEach(img => {
            img.addEventListener('click', () => {
                this.openImageModal(img.src, img.alt);
            });
            
            img.style.cursor = 'pointer';
            img.title = 'Click to zoom';
        });
    }

    openImageModal(src, alt) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <img src="${src}" alt="${alt}" />
                <button class="image-modal-close" aria-label="Close">×</button>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.matches('.image-modal-close')) {
                document.body.removeChild(modal);
            }
        });

        // Close on escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    // Keyboard Shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (window.docsSite) {
                    window.docsSite.openSearch();
                }
            }
            
            // Ctrl/Cmd + / for table of contents
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                const toc = document.querySelector('.toc');
                if (toc) {
                    toc.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Utility Methods
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add styles if not present
        if (!document.querySelector('#toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }
                .toast-success { background-color: var(--success-color); }
                .toast-error { background-color: var(--error-color); }
                .toast-warning { background-color: var(--warning-color); }
                .toast-info { background-color: var(--primary-color); }
                .toast-show {
                    transform: translateY(0);
                    opacity: 1;
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('toast-show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('toast-show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.docsEnhancer = new DocsEnhancer();
});

// Add additional styles for enhanced functionality
const additionalStyles = `
    .copy-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.2s ease;
    }
    
    pre:hover .copy-button {
        opacity: 1;
    }
    
    .line-numbers {
        position: absolute;
        left: 0;
        top: 0;
        width: 40px;
        background: var(--bg-tertiary);
        border-right: 1px solid var(--border-color);
        padding: 16px 8px;
        font-size: 12px;
        color: var(--text-muted);
        text-align: right;
        user-select: none;
    }
    
    .line-numbers span {
        display: block;
        line-height: 1.5;
    }
    
    pre {
        padding-left: 50px !important;
    }
    
    .heading-anchor {
        opacity: 0;
        margin-left: 8px;
        color: var(--text-muted);
        text-decoration: none;
        transition: opacity 0.2s ease;
    }
    
    h1:hover .heading-anchor,
    h2:hover .heading-anchor,
    h3:hover .heading-anchor,
    h4:hover .heading-anchor,
    h5:hover .heading-anchor,
    h6:hover .heading-anchor {
        opacity: 1;
    }
    
    .table-wrapper {
        overflow-x: auto;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-color);
    }
    
    .image-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .image-modal-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
    }
    
    .image-modal-content img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    
    .image-modal-close {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
    }
    
    .toc-link.active {
        color: var(--primary-color);
        font-weight: 500;
        background-color: var(--bg-tertiary);
        border-radius: var(--radius-sm);
        padding: 4px 8px;
        margin: -4px -8px;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
