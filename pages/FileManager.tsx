import React, { useState } from 'react';
import ProtectedDashboard from '../components/ProtectedDashboard';
import { listFiles, uploadFile, downloadFile, deleteFile, createFolder, extractZipFile, renameFile, copyFiles, moveFiles } from '../utils/fileApi';
import { readFileContent, updateFileContent } from '../utils/fileApi';
import CodeEditorModal from '../components/CodeEditorModal';
import MediaPreviewModal from '../components/MediaPreviewModal';

// Helper function untuk get Font Awesome icon berdasarkan file extension
const getFileIcon = (fileName: string, type: string) => {
    if (type === 'folder') {
        return {
            iconClass: 'fas fa-folder',
            bgColor: 'bg-yellow-50',
            textColor: 'text-yellow-600'
        };
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    const iconMap: Record<string, { iconClass: string, bgColor: string, textColor: string }> = {
        // Web
        'html': { iconClass: 'fab fa-html5', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
        'css': { iconClass: 'fab fa-css3-alt', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        'js': { iconClass: 'fab fa-js', bgColor: 'bg-yellow-50', textColor: 'text-yellow-500' },
        'jsx': { iconClass: 'fab fa-react', bgColor: 'bg-cyan-50', textColor: 'text-cyan-500' },
        'ts': { iconClass: 'fas fa-file-code', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        'tsx': { iconClass: 'fab fa-react', bgColor: 'bg-cyan-50', textColor: 'text-cyan-500' },
        'json': { iconClass: 'fas fa-brackets-curly', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
        'md': { iconClass: 'fab fa-markdown', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },

        // Backend
        'php': { iconClass: 'fab fa-php', bgColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
        'py': { iconClass: 'fab fa-python', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        'java': { iconClass: 'fab fa-java', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
        'rb': { iconClass: 'fas fa-gem', bgColor: 'bg-red-50', textColor: 'text-red-600' },
        'go': { iconClass: 'fab fa-golang', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600' },

        // Config
        'yml': { iconClass: 'fas fa-file-code', bgColor: 'bg-red-50', textColor: 'text-red-600' },
        'yaml': { iconClass: 'fas fa-file-code', bgColor: 'bg-red-50', textColor: 'text-red-600' },
        'xml': { iconClass: 'fas fa-file-code', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
        'env': { iconClass: 'fas fa-gear', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },

        // Database
        'sql': { iconClass: 'fas fa-database', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },

        // Images
        'png': { iconClass: 'fas fa-file-image', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
        'jpg': { iconClass: 'fas fa-file-image', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
        'jpeg': { iconClass: 'fas fa-file-image', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
        'gif': { iconClass: 'fas fa-file-image', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
        'svg': { iconClass: 'fas fa-file-image', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
        'webp': { iconClass: 'fas fa-file-image', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },

        // Documents
        'pdf': { iconClass: 'fas fa-file-pdf', bgColor: 'bg-red-50', textColor: 'text-red-600' },
        'doc': { iconClass: 'fas fa-file-word', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        'docx': { iconClass: 'fas fa-file-word', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
        'xls': { iconClass: 'fas fa-file-excel', bgColor: 'bg-green-50', textColor: 'text-green-600' },
        'xlsx': { iconClass: 'fas fa-file-excel', bgColor: 'bg-green-50', textColor: 'text-green-600' },
        'ppt': { iconClass: 'fas fa-file-powerpoint', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
        'pptx': { iconClass: 'fas fa-file-powerpoint', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },

        // Archives
        'zip': { iconClass: 'fas fa-file-zipper', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
        'rar': { iconClass: 'fas fa-file-zipper', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' },
        'tar': { iconClass: 'fas fa-file-zipper', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
        'gz': { iconClass: 'fas fa-file-zipper', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },

        // Video
        'mp4': { iconClass: 'fas fa-file-video', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
        'avi': { iconClass: 'fas fa-file-video', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
        'mov': { iconClass: 'fas fa-file-video', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },

        // Audio
        'mp3': { iconClass: 'fas fa-file-audio', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
        'wav': { iconClass: 'fas fa-file-audio', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },

        // Others
        'txt': { iconClass: 'fas fa-file-lines', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
        'log': { iconClass: 'fas fa-file-lines', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
        'htaccess': { iconClass: 'fas fa-server', bgColor: 'bg-red-50', textColor: 'text-red-600' },
    };

    return iconMap[ext] || {
        iconClass: 'fas fa-file',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600'
    };
};

const FileManagerPage: React.FC = () => {
    const [currentPath, setCurrentPath] = useState('/public_html');
    const [files, setFiles] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalFiles: 0,
        totalFolders: 0,
        storageUsed: '0 B',
        storageQuota: '10 GB'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<{ name: string, path: string, content: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'size' | 'modified' | 'type'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isDragging, setIsDragging] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewMedia, setPreviewMedia] = useState<{ url: string, name: string, type: 'image' | 'video', index: number } | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    // Context Menu States
    const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, file: any | null }>({
        visible: false,
        x: 0,
        y: 0,
        file: null
    });

    // Clipboard States for Copy/Cut/Paste
    const [clipboard, setClipboard] = useState<{ files: any[], mode: 'copy' | 'cut' | null }>({
        files: [],
        mode: null
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const folderInputRef = React.useRef<HTMLInputElement>(null);

    // Fetch files on mount and when path changes
    React.useEffect(() => {
        loadFiles();
        setSelectedFiles([]); // Clear selection saat pindah folder
    }, [currentPath]);

    const loadFiles = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await listFiles(currentPath);
            setFiles(data.files);
            setStats(data.stats);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
            console.error('Load files error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (file: any) => {
        try {
            setLoading(true);
            const filePath = `${currentPath}/${file.name}`.replace(/\/+/g, '/');
            const content = await readFileContent(filePath);
            setEditingFile({
                name: file.name,
                path: filePath,
                content: content
            });
            setEditorOpen(true);
        } catch (err) {
            console.error('Edit error:', err);
            alert('Failed to read file: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        console.log('File Select Event:', {
            filesCount: selectedFiles?.length,
            files: selectedFiles ? Array.from(selectedFiles).map((f: File) => ({ name: f.name, size: f.size })) : null
        });

        if (!selectedFiles || selectedFiles.length === 0) {
            console.log('No files selected, aborting');
            return;
        }

        try {
            setUploading(true);
            setError('');
            console.log('Starting upload for', selectedFiles.length, 'files to path:', currentPath);

            for (let i = 0; i < selectedFiles.length; i++) {
                console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, selectedFiles[i].name);
                await uploadFile(selectedFiles[i], currentPath);
            }

            // Reload files after upload
            console.log('Upload complete, reloading files...');
            await loadFiles();
            alert(`${selectedFiles.length} file(s) uploaded successfully!`);
        } catch (err) {
            console.error('Upload Error in handleFileSelect:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
            alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            console.log('Upload process finished');
        }
    };

    const handleFolderUploadClick = () => {
        folderInputRef.current?.click();
    };

    const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        console.log('Folder Select Event:', {
            filesCount: selectedFiles?.length,
            files: selectedFiles ? Array.from(selectedFiles).map((f: File) => ({
                name: f.name,
                path: (f as any).webkitRelativePath || f.name
            })) : null
        });

        if (!selectedFiles || selectedFiles.length === 0) {
            console.log('No files in folder, aborting');
            return;
        }

        try {
            setUploading(true);
            setError('');
            console.log('Starting folder upload for', selectedFiles.length, 'files');

            // Group files by directory structure
            const filesByPath = new Map<string, File[]>();

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                // Get relative path from webkitRelativePath
                const relativePath = (file as any).webkitRelativePath || file.name;
                const pathParts = relativePath.split('/');

                // Skip root folder name, get subfolder path
                const folderPath = pathParts.slice(0, -1).join('/');
                const targetPath = folderPath ? `${currentPath}/${folderPath}` : currentPath;

                if (!filesByPath.has(targetPath)) {
                    filesByPath.set(targetPath, []);
                }
                filesByPath.get(targetPath)!.push(file);
            }

            // Upload files to their respective paths
            let uploadedCount = 0;
            for (const [path, files] of filesByPath.entries()) {
                console.log(`Uploading ${files.length} files to path: ${path}`);
                for (const file of files) {
                    await uploadFile(file, path);
                    uploadedCount++;
                }
            }

            // Reload files after upload
            console.log('Folder upload complete, reloading files...');
            await loadFiles();
            alert(`Folder uploaded successfully! ${uploadedCount} file(s) uploaded.`);
        } catch (err) {
            console.error('Folder upload error:', err);
            setError(err instanceof Error ? err.message : 'Folder upload failed');
            alert('Folder upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setUploading(false);
            if (folderInputRef.current) {
                folderInputRef.current.value = '';
            }
            console.log('Folder upload process finished');
        }
    };

    const handleDownload = async (file: any) => {
        try {
            const filePath = `${currentPath}/${file.name}`;
            const blob = await downloadFile(filePath);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            alert('Download failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleDelete = async (file: any) => {
        if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
            return;
        }

        try {
            const filePath = `${currentPath}/${file.name}`;
            await deleteFile(filePath);
            await loadFiles();
            alert('Deleted successfully!');
        } catch (err) {
            alert('Delete failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleExtract = async (file: any) => {
        const deleteAfter = confirm(
            `Extract "${file.name}"?\n\n` +
            `Click OK to extract and DELETE the ZIP file.\n` +
            `Click Cancel to extract and KEEP the ZIP file.`
        );

        try {
            const filePath = `${currentPath}/${file.name}`;
            console.log('Extracting ZIP:', filePath, 'Delete after:', deleteAfter);

            const result = await extractZipFile(filePath, deleteAfter);

            console.log('Extract result:', result);
            await loadFiles();

            alert(
                `ZIP extracted successfully!\n\n` +
                `Files extracted: ${result.filesExtracted}\n` +
                `ZIP deleted: ${result.zipDeleted ? 'Yes' : 'No'}`
            );
        } catch (err) {
            console.error('Extract error:', err);
            alert('Extract failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleRename = async (file: any) => {
        const newName = prompt(`Rename "${file.name}" to:`, file.name);

        if (!newName || newName === file.name) return;

        // Basic validation
        if (!newName.trim()) {
            alert('File name cannot be empty');
            return;
        }

        if (newName.includes('/') || newName.includes('\\')) {
            alert('File name cannot contain / or \\');
            return;
        }

        try {
            const filePath = `${currentPath}/${file.name}`;
            console.log('Renaming:', filePath, 'to:', newName);

            await renameFile(filePath, newName);

            await loadFiles();
            alert(`Renamed successfully to "${newName}"`);
        } catch (err) {
            console.error('Rename error:', err);
            alert('Rename failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedFiles.length === 0) return;

        // Get selected file names
        const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id));
        const fileNames = selectedFileObjects.map(f => f.name).join('\n- ');

        const confirmed = confirm(
            `Delete ${selectedFiles.length} selected file(s)?\n\n- ${fileNames}\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            let successCount = 0;
            let failCount = 0;

            for (const file of selectedFileObjects) {
                try {
                    const filePath = `${currentPath}/${file.name}`;
                    await deleteFile(filePath);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to delete ${file.name}:`, err);
                    failCount++;
                }
            }

            // Clear selection
            setSelectedFiles([]);

            // Reload files
            await loadFiles();

            // Show result
            if (failCount === 0) {
                alert(`Successfully deleted ${successCount} file(s)!`);
            } else {
                alert(`Deleted ${successCount} file(s).\nFailed to delete ${failCount} file(s).`);
            }
        } catch (err) {
            console.error('Bulk delete error:', err);
            alert('Bulk delete failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleCreateFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (!folderName) return;

        try {
            await createFolder(folderName, currentPath);
            await loadFiles();
            alert('Folder created successfully!');
        } catch (err) {
            alert('Create folder failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        }
    };

    const handleEditorSave = async (content: string) => {
        if (!editingFile) return;

        try {
            await updateFileContent(editingFile.path, content);

            // Update editingFile content to prevent unsaved changes warning
            setEditingFile({
                ...editingFile,
                content
            });
        } catch (err) {
            throw err; // Let CodeEditorModal handle the error
        }
    };

    const handleEditorClose = () => {
        setEditorOpen(false);
        setEditingFile(null);
    };

    // ========== CLIPBOARD OPERATIONS ==========
    const handleCopy = () => {
        const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id)).map(f => ({
            ...f,
            fullPath: `${currentPath}/${f.name}`.replace(/\/+/g, '/') // Store full path at time of copy
        }));
        setClipboard({
            files: selectedFileObjects,
            mode: 'copy'
        });
        setContextMenu({ ...contextMenu, visible: false });
        console.log('Files copied to clipboard:', selectedFileObjects.map(f => f.name));
    };

    const handleCut = () => {
        const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id)).map(f => ({
            ...f,
            fullPath: `${currentPath}/${f.name}`.replace(/\/+/g, '/') // Store full path at time of cut
        }));
        setClipboard({
            files: selectedFileObjects,
            mode: 'cut'
        });
        setContextMenu({ ...contextMenu, visible: false });
        console.log('Files cut to clipboard:', selectedFileObjects.map(f => f.name));
    };

    const handlePaste = async () => {
        if (clipboard.files.length === 0 || !clipboard.mode) {
            alert('Clipboard is empty');
            return;
        }

        try {
            setLoading(true);
            const sourceFilePaths = clipboard.files.map(f => f.fullPath); // Use the stored fullPath

            console.log(`Pasting ${clipboard.files.length} files (${clipboard.mode} mode) to ${currentPath}`);

            if (clipboard.mode === 'copy') {
                await copyFiles(sourceFilePaths, currentPath);
            } else { // mode === 'cut'
                await moveFiles(sourceFilePaths, currentPath);
            }

            // If cut mode, clear clipboard after paste
            if (clipboard.mode === 'cut') {
                setClipboard({ files: [], mode: null });
                setSelectedFiles([]);
            }

            setContextMenu({ ...contextMenu, visible: false });
            await loadFiles();
            alert(`Successfully ${clipboard.mode === 'copy' ? 'copied' : 'moved'} ${clipboard.files.length} file(s)!`);
        } catch (err) {
            console.error('Paste error:', err);
            alert('Paste failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    // ========== CONTEXT MENU HANDLERS ==========
    const handleContextMenu = (e: React.MouseEvent, file: any) => {
        e.preventDefault();
        e.stopPropagation();

        // Select the file if not already selected
        if (!selectedFiles.includes(file.id)) {
            setSelectedFiles([file.id]);
        }

        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            file: file
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleFolderClick = (folderName: string) => {
        console.log('Folder clicked:', folderName, 'Current path:', currentPath);
        // Navigate into folder
        const newPath = currentPath === '/' ? `/${folderName}` : `${currentPath}/${folderName}`;
        console.log('Navigating to:', newPath);
        setCurrentPath(newPath);
    };

    const handleBreadcrumbClick = (index: number) => {
        // Navigate to specific breadcrumb level
        const pathParts = currentPath.split('/').filter(p => p);
        const newPath = index === -1 ? '/public_html' : '/' + pathParts.slice(0, index + 1).join('/');
        setCurrentPath(newPath);
    };

    const handleBackClick = () => {
        // Navigate to parent folder
        const pathParts = currentPath.split('/').filter(p => p);
        if (pathParts.length <= 1) {
            setCurrentPath('/public_html');
        } else {
            pathParts.pop();
            setCurrentPath('/' + pathParts.join('/'));
        }
    };

    // Build breadcrumb from current path
    const breadcrumbs = React.useMemo(() => {
        const parts = currentPath.split('/').filter(p => p);
        return parts.map((part, index) => ({
            name: part,
            path: '/' + parts.slice(0, index + 1).join('/'),
            index
        }));
    }, [currentPath]);

    const handleRowClick = (fileId: number, e: React.MouseEvent) => {
        // Toggle selection saat click row (tapi bukan double click)
        setSelectedFiles(prev => {
            if (prev.includes(fileId)) {
                return prev.filter(id => id !== fileId);
            } else {
                return [...prev, fileId];
            }
        });
    };

    const handleCheckboxChange = (fileId: number, e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        setSelectedFiles(prev => {
            if (e.target.checked) {
                return [...prev, fileId];
            } else {
                return prev.filter(id => id !== fileId);
            }
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            // Select all visible files
            const allFileIds = filteredFiles.map(f => f.id);
            setSelectedFiles(allFileIds);
        } else {
            // Deselect all
            setSelectedFiles([]);
        }
    };

    // Filter and sort files
    const filteredFiles = React.useMemo(() => {
        let result = files;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(file =>
                file.name.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        result = [...result].sort((a, b) => {
            // Always put folders first
            if (a.type === 'folder' && b.type === 'file') return -1;
            if (a.type === 'file' && b.type === 'folder') return 1;

            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'size':
                    const sizeA = a.size === '-' ? 0 : parseFloat(a.size);
                    const sizeB = b.size === '-' ? 0 : parseFloat(b.size);
                    comparison = sizeA - sizeB;
                    break;
                case 'modified':
                    comparison = a.modified.localeCompare(b.modified);
                    break;
                case 'type':
                    const extA = a.name.split('.').pop() || '';
                    const extB = b.name.split('.').pop() || '';
                    comparison = extA.localeCompare(extB);
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [files, searchQuery, sortBy, sortOrder]);

    const handleSort = (column: 'name' | 'size' | 'modified' | 'type') => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // ========== KEYBOARD SHORTCUTS ==========
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input or editor is open
            if (editorOpen || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            // Ctrl+A - Select All
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                const allFileIds = filteredFiles.map(f => f.id);
                setSelectedFiles(allFileIds);
                console.log('Select all:', allFileIds.length, 'files');
            }

            // Delete - Delete selected files
            if (e.key === 'Delete' && selectedFiles.length > 0) {
                e.preventDefault();
                handleBulkDelete();
            }

            // F2 - Rename (first selected file)
            if (e.key === 'F2' && selectedFiles.length === 1) {
                e.preventDefault();
                const file = files.find(f => f.id === selectedFiles[0]);
                if (file) {
                    handleRename(file);
                }
            }

            // Ctrl+C - Copy
            if (e.ctrlKey && e.key === 'c' && selectedFiles.length > 0) {
                e.preventDefault();
                handleCopy();
            }

            // Ctrl+X - Cut
            if (e.ctrlKey && e.key === 'x' && selectedFiles.length > 0) {
                e.preventDefault();
                handleCut();
            }

            // Ctrl+V - Paste
            if (e.ctrlKey && e.key === 'v' && clipboard.files.length > 0) {
                e.preventDefault();
                handlePaste();
            }

            // Escape - Clear selection and close context menu
            if (e.key === 'Escape') {
                setSelectedFiles([]);
                closeContextMenu();
            }
        };

        const handleClick = () => {
            closeContextMenu();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('click', handleClick);
        };
    }, [selectedFiles, filteredFiles, clipboard, editorOpen, files, contextMenu]);

    // Drag and Drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set false if leaving the main container
        if (e.currentTarget === e.target) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        try {
            setUploading(true);
            console.log(`Drag & drop: Uploading ${files.length} file(s)`);

            for (const file of files) {
                await uploadFile(file as File, currentPath);
            }

            await loadFiles();
            alert(`Successfully uploaded ${files.length} file(s)!`);
        } catch (err) {
            console.error('Drag & drop upload error:', err);
            alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setUploading(false);
        }
    };

    // Media Preview handlers (Images & Videos)
    const isImageFile = (fileName: string): boolean => {
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ext ? imageExts.includes(ext) : false;
    };

    const isVideoFile = (fileName: string): boolean => {
        const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'];
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ext ? videoExts.includes(ext) : false;
    };

    const getMediaList = () => {
        return filteredFiles
            .filter(file => file.type === 'file' && (isImageFile(file.name) || isVideoFile(file.name)))
            .map((file, idx) => {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const filePath = `${currentPath}/${file.name}`;
                return {
                    name: file.name,
                    url: `${apiUrl}/api/files/download?path=${encodeURIComponent(filePath)}`,
                    type: (isVideoFile(file.name) ? 'video' : 'image') as 'image' | 'video'
                };
            });
    };

    const handleMediaClick = (file: any) => {
        if (!isImageFile(file.name) && !isVideoFile(file.name)) return;

        const mediaList = getMediaList();
        const index = mediaList.findIndex(media => media.name === file.name);

        if (index !== -1) {
            setPreviewMedia({
                url: mediaList[index].url,
                name: file.name,
                type: mediaList[index].type,
                index
            });
            setPreviewOpen(true);
        }
    };

    const handleMediaNavigate = (direction: 'prev' | 'next') => {
        if (!previewMedia) return;

        const mediaList = getMediaList();
        const newIndex = direction === 'prev'
            ? Math.max(0, previewMedia.index - 1)
            : Math.min(mediaList.length - 1, previewMedia.index + 1);

        if (newIndex !== previewMedia.index) {
            setPreviewMedia({
                url: mediaList[newIndex].url,
                name: mediaList[newIndex].name,
                type: mediaList[newIndex].type,
                index: newIndex
            });
        }
    };

    return (
        <ProtectedDashboard>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">File Manager</h1>
                        <p className="text-gray-600 mt-1">Browse and manage your website files</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* File Upload Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            multiple
                            className="hidden"
                        />
                        {/* Folder Upload Input */}
                        <input
                            type="file"
                            ref={folderInputRef}
                            onChange={handleFolderSelect}
                            {...({ webkitdirectory: '', directory: '' } as any)}
                            className="hidden"
                        />

                        <button
                            onClick={handleUploadClick}
                            disabled={uploading}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            {uploading ? 'Uploading...' : 'Upload Files'}
                        </button>
                        <button
                            onClick={handleFolderUploadClick}
                            disabled={uploading}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            Upload Folder
                        </button>
                        <button
                            onClick={handleCreateFolder}
                            className="px-4 py-2 bg-gradient-to-r from-[#5865F2] to-[#4F46E5] text-white rounded-xl font-semibold hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            New Folder
                        </button>
                        {/* Bulk Delete Button - Only show when files are selected */}
                        {selectedFiles.length > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Selected ({selectedFiles.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Files</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Folders</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalFolders}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Storage Used</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.storageUsed}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Storage Quota</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.storageQuota}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* File Browser */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Breadcrumb & Toolbar */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            {/* Breadcrumb Navigation */}
                            <div className="flex items-center gap-2">
                                {/* Back Button */}
                                {currentPath !== '/public_html' && (
                                    <button
                                        onClick={handleBackClick}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
                                        title="Back"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}

                                {/* Breadcrumb Links */}
                                <div className="flex items-center gap-2 text-sm">
                                    <button
                                        onClick={() => handleBreadcrumbClick(-1)}
                                        className="text-[#5865F2] hover:underline font-medium transition-colors"
                                    >
                                        <i className="fas fa-home mr-1"></i>
                                        Home
                                    </button>

                                    {breadcrumbs.map((crumb, idx) => (
                                        <React.Fragment key={idx}>
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                            {idx === breadcrumbs.length - 1 ? (
                                                <span className="text-gray-900 font-medium">{crumb.name}</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleBreadcrumbClick(crumb.index)}
                                                    className="text-[#5865F2] hover:underline font-medium transition-colors"
                                                >
                                                    {crumb.name}
                                                </button>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>


                            {/* View Toggle */}
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all duration-300 transform hover:scale-110 active:scale-95 ${viewMode === 'list'
                                        ? 'bg-white shadow-sm text-[#5865F2] scale-105'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                    title="List View"
                                >
                                    <svg className={`w-5 h-5 transition-transform duration-300 ${viewMode === 'list' ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all duration-300 transform hover:scale-110 active:scale-95 ${viewMode === 'grid'
                                        ? 'bg-white shadow-sm text-[#5865F2] scale-105'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                    title="Grid View"
                                >
                                    <svg className={`w-5 h-5 transition-transform duration-300 ${viewMode === 'grid' ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            <button className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filter
                            </button>
                        </div>
                    </div>

                    {/* Files List */}
                    <div
                        className="overflow-x-auto relative min-h-[400px]"
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onContextMenu={(e) => handleContextMenu(e, null)}
                    >
                        {/* Drag & Drop Overlay */}
                        {isDragging && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-4 border-dashed border-blue-500 rounded-xl flex items-center justify-center z-50 pointer-events-none">
                                <div className="bg-white px-8 py-6 rounded-xl shadow-2xl">
                                    <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <p className="text-xl font-bold text-gray-900">Drop files here</p>
                                    <p className="text-sm text-gray-600 mt-2">Release to upload files</p>
                                </div>
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <table className="w-full animate-fade-in">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300"
                                                checked={filteredFiles.length > 0 && selectedFiles.length === filteredFiles.length}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th
                                            onClick={() => handleSort('name')}
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            onClick={() => handleSort('size')}
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            onClick={() => handleSort('modified')}
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permissions</th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredFiles.map((file) => (
                                        <tr
                                            key={file.id}
                                            className={`transition-colors cursor-pointer ${selectedFiles.includes(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                                                }`}
                                            onClick={(e) => handleRowClick(file.id, e)}
                                            onContextMenu={(e) => handleContextMenu(e, file)}
                                            onDoubleClick={() => {
                                                if (file.type === 'folder') {
                                                    console.log('Row double-clicked for folder:', file.name);
                                                    handleFolderClick(file.name);
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    checked={selectedFiles.includes(file.id)}
                                                    onChange={(e) => handleCheckboxChange(file.id, e)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {(() => {
                                                        const fileIcon = getFileIcon(file.name, file.type);
                                                        return (
                                                            <div className="w-10 h-10 flex items-center justify-center">
                                                                <i className={`${fileIcon.iconClass} ${fileIcon.textColor} text-4xl`}></i>
                                                            </div>
                                                        );
                                                    })()}
                                                    <span className="font-medium text-gray-900">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{file.size}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{file.modified}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-xs font-mono">
                                                    {file.permissions}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {file.type === 'file' && (
                                                        <button
                                                            onClick={() => handleDownload(file)}
                                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Download"
                                                        >
                                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {/* Media Preview Button - Images & Videos */}
                                                    {file.type === 'file' && (isImageFile(file.name) || isVideoFile(file.name)) && (
                                                        <button
                                                            onClick={() => handleMediaClick(file)}
                                                            className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title={isVideoFile(file.name) ? "Preview Video" : "Preview Image"}
                                                        >
                                                            {isVideoFile(file.name) ? (
                                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                    )}
                                                    {file.type === 'file' && (() => {
                                                        const editableExts = ['html', 'htm', 'css', 'scss', 'less', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'php', 'py', 'rb', 'java', 'cpp', 'c', 'go', 'rs', 'sh', 'bash', 'yaml', 'yml', 'toml', 'ini', 'conf', 'md', 'sql', 'txt', 'log', 'env'];
                                                        const ext = file.name.split('.').pop()?.toLowerCase();
                                                        return ext && editableExts.includes(ext);
                                                    })() && (
                                                            <button
                                                                onClick={() => handleEdit(file)}
                                                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit File"
                                                            >
                                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    {/* Rename Button - for both files and folders */}
                                                    <button
                                                        onClick={() => handleRename(file)}
                                                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                                                        title="Rename"
                                                    >
                                                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    {file.type === 'file' && file.name.toLowerCase().endsWith('.zip') && (
                                                        <button
                                                            onClick={() => handleExtract(file)}
                                                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Extract ZIP"
                                                        >
                                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(file)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-fade-in">
                                {filteredFiles.map((file) => {
                                    const fileIcon = getFileIcon(file.name, file.type);
                                    return (
                                        <div
                                            key={file.id}
                                            className={`group relative bg-white rounded-2xl p-6 pb-16 cursor-pointer transition-all duration-300 hover:shadow-xl min-h-[220px] flex flex-col ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg' : 'border border-gray-200 hover:border-blue-400 hover:-translate-y-1'
                                                }`}
                                            onClick={(e) => handleRowClick(file.id, e)}
                                            onContextMenu={(e) => handleContextMenu(e, file)}
                                            onDoubleClick={() => {
                                                if (file.type === 'folder') {
                                                    handleFolderClick(file.name);
                                                } else if (isImageFile(file.name) || isVideoFile(file.name)) {
                                                    handleMediaClick(file);
                                                }
                                            }}
                                        >
                                            {/* Checkbox */}
                                            <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 w-4 h-4 transition-all"
                                                    checked={selectedFiles.includes(file.id)}
                                                    onChange={(e) => handleCheckboxChange(file.id, e)}
                                                />
                                            </div>

                                            {/* File Content */}
                                            <div className="flex-1 flex flex-col items-center text-center gap-3 mb-2">
                                                {/* File Icon */}
                                                <div className="w-20 h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                                    <i className={`${fileIcon.iconClass} ${fileIcon.textColor} text-6xl`}></i>
                                                </div>

                                                {/* File Name */}
                                                <p className="text-sm font-semibold text-gray-900 truncate w-full px-2" title={file.name}>
                                                    {file.name}
                                                </p>

                                                {/* File Size */}
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {file.size}
                                                </p>
                                            </div>


                                            {/* Action Buttons - Always visible at bottom */}
                                            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2 bg-gray-50 rounded-xl p-2 shadow-inner">
                                                {/* Preview Button - For Images & Videos */}
                                                {file.type === 'file' && (isImageFile(file.name) || isVideoFile(file.name)) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMediaClick(file);
                                                        }}
                                                        className="p-1.5 bg-white hover:bg-purple-50 rounded-lg shadow-sm transition-colors"
                                                        title={isVideoFile(file.name) ? "Preview Video" : "Preview Image"}
                                                    >
                                                        {isVideoFile(file.name) ? (
                                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                )}
                                                {/* Download Button */}
                                                {file.type === 'file' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDownload(file);
                                                        }}
                                                        className="p-1.5 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
                                                        title="Download"
                                                    >
                                                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {/* Rename Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRename(file);
                                                    }}
                                                    className="p-1.5 bg-white hover:bg-yellow-50 rounded-lg shadow-sm transition-colors"
                                                    title="Rename"
                                                >
                                                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(file);
                                                    }}
                                                    className="p-1.5 bg-white hover:bg-red-50 rounded-lg shadow-sm transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-[#5865F2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Upload Files</h3>
                                <p className="text-sm text-gray-600">Drag and drop or browse files</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Create File</h3>
                                <p className="text-sm text-gray-600">Create a new file in current folder</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-1">Create Folder</h3>
                                <p className="text-sm text-gray-600">Create a new folder</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Code Editor Modal */}
            {editingFile && (
                <CodeEditorModal
                    isOpen={editorOpen}
                    onClose={handleEditorClose}
                    fileName={editingFile.name}
                    filePath={editingFile.path}
                    initialContent={editingFile.content}
                    onSave={handleEditorSave}
                />
            )}

            {/* Media Preview Modal */}
            {previewMedia && (
                <MediaPreviewModal
                    isOpen={previewOpen}
                    onClose={() => {
                        setPreviewOpen(false);
                        setPreviewMedia(null);
                    }}
                    mediaUrl={previewMedia.url}
                    mediaName={previewMedia.name}
                    mediaType={previewMedia.type}
                    medias={getMediaList()}
                    currentIndex={previewMedia.index}
                    onNavigate={handleMediaNavigate}
                />
            )}

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 min-w-[220px]"
                    style={{
                        left: `${contextMenu.x}px`,
                        top: `${contextMenu.y}px`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.file ? (
                        <>
                            {/* Download */}
                            {contextMenu.file.type === 'file' && (
                                <button
                                    onClick={() => {
                                        handleDownload(contextMenu.file);
                                        closeContextMenu();
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Download</span>
                                </button>
                            )}

                            {/* Preview - For Images & Videos */}
                            {contextMenu.file.type === 'file' && (isImageFile(contextMenu.file.name) || isVideoFile(contextMenu.file.name)) && (
                                <button
                                    onClick={() => {
                                        handleMediaClick(contextMenu.file);
                                        closeContextMenu();
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Preview</span>
                                </button>
                            )}

                            {/* Edit - For Code Files */}
                            {contextMenu.file.type === 'file' && (() => {
                                const editableExts = ['html', 'htm', 'css', 'scss', 'less', 'js', 'jsx', 'ts', 'tsx', 'json', 'xml', 'php', 'py', 'rb', 'java', 'cpp', 'c', 'go', 'rs', 'sh', 'bash', 'yaml', 'yml', 'toml', 'ini', 'conf', 'md', 'sql', 'txt', 'log', 'env'];
                                const ext = contextMenu.file.name.split('.').pop()?.toLowerCase();
                                return ext && editableExts.includes(ext);
                            })() && (
                                    <button
                                        onClick={() => {
                                            handleEdit(contextMenu.file);
                                            closeContextMenu();
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Edit</span>
                                    </button>
                                )}

                            <div className="border-t border-gray-100 my-1"></div>

                            {/* Copy */}
                            <button
                                onClick={handleCopy}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Copy</span>
                                <span className="ml-auto text-xs text-gray-400">Ctrl+C</span>
                            </button>

                            {/* Cut */}
                            <button
                                onClick={handleCut}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Cut</span>
                                <span className="ml-auto text-xs text-gray-400">Ctrl+X</span>
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>

                            {/* Rename */}
                            <button
                                onClick={() => {
                                    handleRename(contextMenu.file);
                                    closeContextMenu();
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Rename</span>
                                <span className="ml-auto text-xs text-gray-400">F2</span>
                            </button>

                            {/* Extract ZIP */}
                            {contextMenu.file.type === 'file' && contextMenu.file.name.toLowerCase().endsWith('.zip') && (
                                <button
                                    onClick={() => {
                                        handleExtract(contextMenu.file);
                                        closeContextMenu();
                                    }}
                                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">Extract ZIP</span>
                                </button>
                            )}

                            <div className="border-t border-gray-100 my-1"></div>

                            {/* Delete */}
                            <button
                                onClick={() => {
                                    handleDelete(contextMenu.file);
                                    closeContextMenu();
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 transition-colors group"
                            >
                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm font-medium text-red-600">Delete</span>
                                <span className="ml-auto text-xs text-gray-400">Del</span>
                            </button>
                        </>
                    ) : (
                        <>
                            {/* General Folder Actions */}
                            <button
                                onClick={() => {
                                    handlePaste();
                                    closeContextMenu();
                                }}
                                disabled={clipboard.files.length === 0}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Paste {clipboard.files.length > 0 && `(${clipboard.files.length})`}</span>
                                <span className="ml-auto text-xs text-gray-400">Ctrl+V</span>
                            </button>

                            <div className="border-t border-gray-100 my-1"></div>

                            <button
                                onClick={() => {
                                    setFiles([]); // Trigger reload
                                    loadFiles();
                                    closeContextMenu();
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Refresh</span>
                            </button>

                            <button
                                onClick={() => {
                                    handleUploadClick();
                                    closeContextMenu();
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                            >
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Upload Files</span>
                            </button>
                        </>
                    )}
                </div>
            )}

        </ProtectedDashboard>
    );
};

export default FileManagerPage;
