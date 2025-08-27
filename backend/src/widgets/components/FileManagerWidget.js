const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'FileManagerWidget',
    description: 'Modern file manager with drag-and-drop and visual file browser',
    version: '1.0.0',
    
    css: `
        .file-manager-widget {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 20px;
            padding: 25px;
            color: white;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
            overflow: hidden;
            min-height: 400px;
        }

        .file-manager-widget::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
            pointer-events: none;
        }

        .file-manager-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            position: relative;
            z-index: 1;
        }

        .file-manager-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .file-manager-actions {
            display: flex;
            gap: 10px;
        }

        .action-btn {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 10px;
            padding: 10px 15px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
            font-weight: 600;
        }

        .action-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }

        .file-breadcrumb {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 15px 20px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .breadcrumb-path {
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.9);
        }

        .file-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }

        .file-item {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px 15px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .file-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0,0,0,0.2);
            background: rgba(255, 255, 255, 0.2);
        }

        .file-item.dragging {
            opacity: 0.5;
            transform: rotate(5deg);
        }

        .file-item.drag-over {
            background: rgba(255, 255, 255, 0.3);
            border-color: rgba(255, 255, 255, 0.5);
        }

        .file-icon {
            font-size: 32px;
            margin-bottom: 10px;
            display: block;
        }

        .file-name {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 5px;
            word-break: break-word;
            line-height: 1.3;
        }

        .file-size {
            font-size: 10px;
            opacity: 0.7;
        }

        .file-type {
            position: absolute;
            top: 8px;
            right: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 2px 6px;
            font-size: 10px;
            font-weight: 600;
        }

        .upload-zone {
            border: 2px dashed rgba(255, 255, 255, 0.3);
            border-radius: 15px;
            padding: 40px 20px;
            text-align: center;
            margin-bottom: 20px;
            transition: all 0.3s ease;
            position: relative;
            z-index: 1;
            background: rgba(255, 255, 255, 0.05);
        }

        .upload-zone.drag-over {
            border-color: rgba(255, 255, 255, 0.6);
            background: rgba(255, 255, 255, 0.1);
        }

        .upload-icon {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.7;
        }

        .upload-text {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 10px;
        }

        .upload-hint {
            font-size: 14px;
            opacity: 0.7;
        }

        .file-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 15px;
            position: relative;
            z-index: 1;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-value {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 12px;
            opacity: 0.8;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .file-context-menu {
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            backdrop-filter: blur(20px);
            border-radius: 10px;
            padding: 10px 0;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
            min-width: 150px;
            display: none;
        }

        .context-menu-item {
            padding: 10px 20px;
            cursor: pointer;
            transition: background 0.2s ease;
            font-size: 14px;
        }

        .context-menu-item:hover {
            background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
            .file-grid {
                grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            }
            
            .file-manager-actions {
                flex-direction: column;
            }
        }
    `,

    async render(data = {}) {
        const currentPath = data.path || '/';
        const files = data.files || [];
        const stats = data.stats || { total: 0, folders: 0, files: 0, size: '0 MB' };

        const getFileIcon = (type, name) => {
            if (type === 'directory') return '';
            if (name.endsWith('.jpg') || name.endsWith('.png') || name.endsWith('.gif')) return '';
            if (name.endsWith('.pdf')) return '';
            if (name.endsWith('.doc') || name.endsWith('.docx')) return '';
            if (name.endsWith('.mp4') || name.endsWith('.avi')) return '';
            if (name.endsWith('.mp3') || name.endsWith('.wav')) return '';
            if (name.endsWith('.zip') || name.endsWith('.rar')) return '';
            return '';
        };

        const formatFileSize = (bytes) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        };

        return `
            <div class="file-manager-widget">
                <div class="file-manager-header">
                    <h3 class="file-manager-title">File Manager</h3>
                    <div class="file-manager-actions">
                        <button class="action-btn" onclick="uploadFile()"> Upload</button>
                        <button class="action-btn" onclick="createFolder()"> New Folder</button>
                        <button class="action-btn" onclick="refreshFiles()"> Refresh</button>
                    </div>
                </div>
                
                <div class="file-breadcrumb">
                    <div class="breadcrumb-path">${currentPath}</div>
                </div>
                
                <div class="upload-zone" id="uploadZone">
                    <div class="upload-icon"></div>
                    <div class="upload-text">Drop files here to upload</div>
                    <div class="upload-hint">or click to select files</div>
                </div>
                
                <div class="file-grid">
                    ${files.map(file => `
                        <div class="file-item" data-path="${file.path}" data-type="${file.type}">
                            <div class="file-type">${file.type === 'directory' ? 'DIR' : file.name.split('.').pop().toUpperCase()}</div>
                            <div class="file-icon">${getFileIcon(file.type, file.name)}</div>
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${file.type === 'directory' ? '' : formatFileSize(file.size)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="file-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total Items</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.folders}</div>
                        <div class="stat-label">Folders</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.files}</div>
                        <div class="stat-label">Files</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.size}</div>
                        <div class="stat-label">Total Size</div>
                    </div>
                </div>
                
                <div class="file-context-menu" id="contextMenu">
                    <div class="context-menu-item" onclick="openFile()"> Open</div>
                    <div class="context-menu-item" onclick="downloadFile()">⬇ Download</div>
                    <div class="context-menu-item" onclick="renameFile()"> Rename</div>
                    <div class="context-menu-item" onclick="deleteFile()"> Delete</div>
                </div>
            </div>
            
            <script>
                // File manager JavaScript functionality
                let selectedFile = null;
                
                // Drag and drop functionality
                const uploadZone = document.getElementById('uploadZone');
                const fileItems = document.querySelectorAll('.file-item');
                
                uploadZone.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    uploadZone.classList.add('drag-over');
                });
                
                uploadZone.addEventListener('dragleave', () => {
                    uploadZone.classList.remove('drag-over');
                });
                
                uploadZone.addEventListener('drop', (e) => {
                    e.preventDefault();
                    uploadZone.classList.remove('drag-over');
                    const files = e.dataTransfer.files;
                    handleFileUpload(files);
                });
                
                // File item interactions
                fileItems.forEach(item => {
                    item.addEventListener('click', () => {
                        const path = item.dataset.path;
                        const type = item.dataset.type;
                        
                        if (type === 'directory') {
                            navigateToFolder(path);
                        } else {
                            openFile(path);
                        }
                    });
                    
                    item.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        selectedFile = item.dataset.path;
                        showContextMenu(e.clientX, e.clientY);
                    });
                });
                
                // Context menu
                function showContextMenu(x, y) {
                    const menu = document.getElementById('contextMenu');
                    menu.style.display = 'block';
                    menu.style.left = x + 'px';
                    menu.style.top = y + 'px';
                }
                
                document.addEventListener('click', () => {
                    document.getElementById('contextMenu').style.display = 'none';
                });
                
                // File operations
                function uploadFile() {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e) => handleFileUpload(e.target.files);
                    input.click();
                }
                
                function handleFileUpload(files) {
                    // Implementation for file upload
                    console.log('Uploading files:', files);
                }
                
                function createFolder() {
                    const name = prompt('Enter folder name:');
                    if (name) {
                        // Implementation for folder creation
                        console.log('Creating folder:', name);
                    }
                }
                
                function refreshFiles() {
                    // Implementation for refreshing file list
                    console.log('Refreshing files');
                }
                
                function navigateToFolder(path) {
                    // Implementation for folder navigation
                    console.log('Navigating to:', path);
                }
                
                function openFile(path) {
                    // Implementation for opening files
                    console.log('Opening file:', path);
                }
                
                function downloadFile() {
                    if (selectedFile) {
                        // Implementation for file download
                        console.log('Downloading:', selectedFile);
                    }
                }
                
                function renameFile() {
                    if (selectedFile) {
                        const newName = prompt('Enter new name:');
                        if (newName) {
                            // Implementation for file rename
                            console.log('Renaming to:', newName);
                        }
                    }
                }
                
                function deleteFile() {
                    if (selectedFile && confirm('Are you sure you want to delete this file?')) {
                        // Implementation for file deletion
                        console.log('Deleting:', selectedFile);
                    }
                }
            </script>
        `;
    }
};
