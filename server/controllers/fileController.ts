import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { AuthRequest } from '../middleware/auth';
import AdmZip from 'adm-zip';

// Base directory untuk user files (dalam production, setiap user punya folder sendiri)
const getUserFilesPath = (userId: string) => {
    const basePath = path.join(process.cwd(), 'user_files', userId);
    return basePath;
};

// Ensure user directory exists
const ensureUserDirectory = async (userId: string) => {
    const userPath = getUserFilesPath(userId);
    try {
        await fs.access(userPath);
    } catch {
        await fs.mkdir(userPath, { recursive: true });
        // Create default public_html folder
        await fs.mkdir(path.join(userPath, 'public_html'), { recursive: true });
    }
    return userPath;
};

// List files in directory
export const listFiles = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const requestedPath = req.query.path as string || '/public_html';

        await ensureUserDirectory(userId);
        const fullPath = path.join(getUserFilesPath(userId), requestedPath);

        // Security check: prevent path traversal
        const userBasePath = getUserFilesPath(userId);
        if (!fullPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const items = await fs.readdir(fullPath, { withFileTypes: true });

        const files = await Promise.all(
            items.map(async (item, index) => {
                const itemPath = path.join(fullPath, item.name);
                const stats = await fs.stat(itemPath);

                return {
                    id: index + 1,
                    name: item.name,
                    type: item.isDirectory() ? 'folder' : 'file',
                    size: item.isDirectory() ? '-' : formatBytes(stats.size),
                    modified: formatDate(stats.mtime),
                    permissions: '644' // In real scenario, get from stats
                };
            })
        );

        // Calculate stats
        const stats = await getDirectoryStats(getUserFilesPath(userId));

        res.json({
            files,
            stats: {
                totalFiles: stats.fileCount,
                totalFolders: stats.folderCount,
                storageUsed: formatBytes(stats.totalSize),
                storageQuota: '10 GB'
            },
            currentPath: requestedPath
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({ message: 'Failed to list files' });
    }
};

// Upload file
export const uploadFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const targetPath = req.body.path || '/public_html';

        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        await ensureUserDirectory(userId);

        // Get directory path and ensure it exists
        const dirPath = path.join(getUserFilesPath(userId), targetPath);
        const fullPath = path.join(dirPath, req.file.originalname);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Create directory structure if it doesn't exist
        console.log('Creating directory:', dirPath);
        await fs.mkdir(dirPath, { recursive: true });

        // Write file
        console.log('Writing file:', fullPath);
        await fs.writeFile(fullPath, req.file.buffer);

        res.json({
            message: 'File uploaded successfully',
            file: {
                name: req.file.originalname,
                size: formatBytes(req.file.size)
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Failed to upload file', error: (error as Error).message });
    }
};

// Download file
export const downloadFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const filePath = req.query.path as string;

        if (!filePath) {
            return res.status(400).json({ message: 'File path required' });
        }

        const fullPath = path.join(getUserFilesPath(userId), filePath);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const file = await fs.readFile(fullPath);
        const fileName = path.basename(fullPath);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(file);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to download file' });
    }
};

// Delete file
export const deleteFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const filePath = req.body.path as string;

        if (!filePath) {
            return res.status(400).json({ message: 'File path required' });
        }

        const fullPath = path.join(getUserFilesPath(userId), filePath);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
            await fs.rmdir(fullPath, { recursive: true });
        } else {
            await fs.unlink(fullPath);
        }

        res.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Failed to delete file' });
    }
};

// Create folder
export const createFolder = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const { path: folderPath, name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Folder name required' });
        }

        const fullPath = path.join(getUserFilesPath(userId), folderPath || '/public_html', name);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await fs.mkdir(fullPath, { recursive: true });

        res.json({ message: 'Folder created successfully' });
    } catch (error) {
        console.error('Create folder error:', error);
        res.status(500).json({ message: 'Failed to create folder' });
    }
};

// Read file content (for editor)
export const readFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const filePath = req.query.path as string;

        if (!filePath) {
            return res.status(400).json({ message: 'File path required' });
        }

        const fullPath = path.join(getUserFilesPath(userId), filePath);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const content = await fs.readFile(fullPath, 'utf-8');

        res.json({
            content,
            path: filePath
        });
    } catch (error) {
        console.error('Read file error:', error);
        res.status(500).json({ message: 'Failed to read file' });
    }
};

// Update file content (for editor)
export const updateFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const { path: filePath, content } = req.body;

        if (!filePath || content === undefined) {
            return res.status(400).json({ message: 'File path and content required' });
        }

        const fullPath = path.join(getUserFilesPath(userId), filePath);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await fs.writeFile(fullPath, content, 'utf-8');

        res.json({ message: 'File updated successfully' });
    } catch (error) {
        console.error('Update file error:', error);
        res.status(500).json({ message: 'Failed to update file' });
    }
};

// Rename file or folder
export const renameFile = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const { oldPath, newName } = req.body;

        if (!oldPath || !newName) {
            return res.status(400).json({ message: 'Old path and new name required' });
        }

        // Validate new name (no path traversal, no special chars)
        if (newName.includes('/') || newName.includes('\\') || newName.includes('..')) {
            return res.status(400).json({ message: 'Invalid file name' });
        }

        const fullOldPath = path.join(getUserFilesPath(userId), oldPath);
        const directory = path.dirname(fullOldPath);
        const fullNewPath = path.join(directory, newName);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullOldPath.startsWith(userBasePath) || !fullNewPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if old file exists
        try {
            await fs.access(fullOldPath);
        } catch {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if new name already exists
        try {
            await fs.access(fullNewPath);
            return res.status(409).json({ message: 'A file with this name already exists' });
        } catch {
            // Good, file doesn't exist
        }

        // Rename
        await fs.rename(fullOldPath, fullNewPath);

        res.json({ message: 'Renamed successfully', newPath: fullNewPath });
    } catch (error) {
        console.error('Rename error:', error);
        res.status(500).json({ message: 'Failed to rename file' });
    }
};

// Extract ZIP file
export const extractZip = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id?.toString() || 'default';
        const { zipPath, deleteAfter = true } = req.body;

        if (!zipPath) {
            return res.status(400).json({ message: 'ZIP file path required' });
        }

        const fullZipPath = path.join(getUserFilesPath(userId), zipPath);

        // Security check
        const userBasePath = getUserFilesPath(userId);
        if (!fullZipPath.startsWith(userBasePath)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Check if file is ZIP
        if (!zipPath.toLowerCase().endsWith('.zip')) {
            return res.status(400).json({ message: 'File is not a ZIP archive' });
        }

        // Get extraction directory (same folder as ZIP)
        const extractDir = path.dirname(fullZipPath);

        console.log('Extracting ZIP:', fullZipPath);
        console.log('Extract to:', extractDir);

        // Extract ZIP
        const zip = new AdmZip(fullZipPath);
        zip.extractAllTo(extractDir, true); // true = overwrite

        // Count extracted files
        const zipEntries = zip.getEntries();
        const fileCount = zipEntries.filter(entry => !entry.isDirectory).length;

        // Delete ZIP file if requested
        if (deleteAfter) {
            await fs.unlink(fullZipPath);
            console.log('Deleted ZIP file:', fullZipPath);
        }

        res.json({
            message: 'ZIP extracted successfully',
            filesExtracted: fileCount,
            zipDeleted: deleteAfter
        });
    } catch (error) {
        console.error('Extract ZIP error:', error);
        res.status(500).json({ message: 'Failed to extract ZIP', error: (error as Error).message });
    }
};

// Helper functions
const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
};

const getDirectoryStats = async (dirPath: string): Promise<{ fileCount: number, folderCount: number, totalSize: number }> => {
    let fileCount = 0;
    let folderCount = 0;
    let totalSize = 0;

    const scan = async (currentPath: string) => {
        try {
            const items = await fs.readdir(currentPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = path.join(currentPath, item.name);

                if (item.isDirectory()) {
                    folderCount++;
                    await scan(itemPath);
                } else {
                    fileCount++;
                    const stats = await fs.stat(itemPath);
                    totalSize += stats.size;
                }
            }
        } catch (error) {
            // Ignore errors (permission issues, etc)
        }
    };

    await scan(dirPath);

    return { fileCount, folderCount, totalSize };
};
