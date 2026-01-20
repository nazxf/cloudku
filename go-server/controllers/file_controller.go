package controllers

import (
	"archive/zip"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"cloudku-server/middleware"

	"github.com/gin-gonic/gin"
)

// FileController handles file management endpoints
type FileController struct{}

// NewFileController creates a new file controller
func NewFileController() *FileController {
	return &FileController{}
}

// FileInfo represents file information
type FileInfo struct {
	Name        string    `json:"name"`
	Path        string    `json:"path"`
	IsDirectory bool      `json:"isDirectory"`
	Size        int64     `json:"size"`
	SizeHuman   string    `json:"sizeHuman"`
	Modified    time.Time `json:"modified"`
	ModifiedStr string    `json:"modifiedStr"`
	Extension   string    `json:"extension"`
	Permissions string    `json:"permissions"`
}

// DirectoryStats represents directory statistics
type DirectoryStats struct {
	FileCount   int   `json:"fileCount"`
	FolderCount int   `json:"folderCount"`
	TotalSize   int64 `json:"totalSize"`
}

// getUserFilesPath returns the base path for user files
func getUserFilesPath(userID string) string {
	basePath := os.Getenv("USER_FILES_BASE_PATH")
	if basePath == "" {
		basePath = "./user-files"
	}
	return filepath.Join(basePath, userID)
}

// ensureUserDirectory ensures the user directory exists
func ensureUserDirectory(userID string) error {
	userPath := getUserFilesPath(userID)
	return os.MkdirAll(userPath, 0755)
}

// ListFiles lists files in a directory
func (fc *FileController) ListFiles(c *gin.Context) {
	userID := middleware.GetUserIDString(c)
	relativePath := c.Query("path")
	if relativePath == "" {
		relativePath = "/"
	}

	// Ensure user directory exists
	if err := ensureUserDirectory(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create user directory",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, relativePath)

	// Security check - prevent path traversal
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	entries, err := os.ReadDir(fullPath)
	if err != nil {
		// If directory doesn't exist, create it
		if os.IsNotExist(err) {
			os.MkdirAll(fullPath, 0755)
			entries = []os.DirEntry{}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to read directory",
				"error":   err.Error(),
			})
			return
		}
	}

	files := make([]FileInfo, 0, len(entries))
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		filePath := filepath.Join(relativePath, entry.Name())
		ext := ""
		if !entry.IsDir() {
			ext = strings.TrimPrefix(filepath.Ext(entry.Name()), ".")
		}

		files = append(files, FileInfo{
			Name:        entry.Name(),
			Path:        filePath,
			IsDirectory: entry.IsDir(),
			Size:        info.Size(),
			SizeHuman:   formatBytes(info.Size()),
			Modified:    info.ModTime(),
			ModifiedStr: formatDate(info.ModTime()),
			Extension:   ext,
			Permissions: info.Mode().String(),
		})
	}

	// Sort: directories first, then by name
	sort.Slice(files, func(i, j int) bool {
		if files[i].IsDirectory != files[j].IsDirectory {
			return files[i].IsDirectory
		}
		return strings.ToLower(files[i].Name) < strings.ToLower(files[j].Name)
	})

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"files":   files,
		"path":    relativePath,
	})
}

// GetStats returns directory statistics
func (fc *FileController) GetStats(c *gin.Context) {
	userID := middleware.GetUserIDString(c)
	userPath := getUserFilesPath(userID)

	stats := getDirectoryStats(userPath)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"stats":   stats,
	})
}

// UploadFile handles file upload
func (fc *FileController) UploadFile(c *gin.Context) {
	userID := middleware.GetUserIDString(c)
	relativePath := c.PostForm("path")
	if relativePath == "" {
		relativePath = "/"
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, relativePath)

	// Security check
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Ensure directory exists
	os.MkdirAll(fullPath, 0755)

	// Get uploaded file
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No file uploaded",
		})
		return
	}
	defer file.Close()

	// Create destination file
	destPath := filepath.Join(fullPath, header.Filename)
	dest, err := os.Create(destPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create file",
		})
		return
	}
	defer dest.Close()

	// Copy file content
	if _, err := io.Copy(dest, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to save file",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File uploaded successfully",
		"file":    header.Filename,
	})
}

// DownloadFile handles file download
func (fc *FileController) DownloadFile(c *gin.Context) {
	userID := middleware.GetUserIDString(c)
	relativePath := c.Query("path")
	if relativePath == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Path is required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, relativePath)

	// Security check
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Check if file exists
	if _, err := os.Stat(fullPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File not found",
		})
		return
	}

	c.File(fullPath)
}

// DeleteFile handles file/folder deletion
func (fc *FileController) DeleteFile(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Path string `json:"path" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Path is required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, req.Path)

	// Security check
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Delete file or directory
	if err := os.RemoveAll(fullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Deleted successfully",
	})
}

// CreateFolder handles folder creation
func (fc *FileController) CreateFolder(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Path string `json:"path" binding:"required"`
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Path and name are required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, req.Path, req.Name)

	// Security check
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Create directory
	if err := os.MkdirAll(fullPath, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create folder",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Folder created successfully",
	})
}

// ReadFile reads file content
func (fc *FileController) ReadFile(c *gin.Context) {
	userID := middleware.GetUserIDString(c)
	relativePath := c.Query("path")
	if relativePath == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Path is required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, relativePath)

	// Security check
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Read file content
	content, err := os.ReadFile(fullPath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "File not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"content": string(content),
	})
}

// UpdateFile updates file content
func (fc *FileController) UpdateFile(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Path    string `json:"path" binding:"required"`
		Content string `json:"content"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Path is required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, req.Path)

	// Security check
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Write file content
	if err := os.WriteFile(fullPath, []byte(req.Content), 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to save file",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "File saved successfully",
	})
}

// RenameFile renames a file or folder
func (fc *FileController) RenameFile(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		OldPath string `json:"oldPath" binding:"required"`
		NewName string `json:"newName" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Old path and new name are required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	oldFullPath := filepath.Join(userPath, req.OldPath)
	newFullPath := filepath.Join(filepath.Dir(oldFullPath), req.NewName)

	// Security check
	if !strings.HasPrefix(filepath.Clean(oldFullPath), filepath.Clean(userPath)) ||
		!strings.HasPrefix(filepath.Clean(newFullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Rename
	if err := os.Rename(oldFullPath, newFullPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to rename",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Renamed successfully",
	})
}

// CopyFiles copies files or folders
func (fc *FileController) CopyFiles(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Sources     []string `json:"sources" binding:"required"`
		Destination string   `json:"destination" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Sources and destination are required",
		})
		return
	}

	userPath := getUserFilesPath(userID)

	for _, source := range req.Sources {
		srcPath := filepath.Join(userPath, source)
		destPath := filepath.Join(userPath, req.Destination, filepath.Base(source))

		// Security check
		if !strings.HasPrefix(filepath.Clean(srcPath), filepath.Clean(userPath)) ||
			!strings.HasPrefix(filepath.Clean(destPath), filepath.Clean(userPath)) {
			continue
		}

		// Copy file or directory
		if err := copyPath(srcPath, destPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to copy",
				"error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Copied successfully",
	})
}

// MoveFiles moves files or folders
func (fc *FileController) MoveFiles(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Sources     []string `json:"sources" binding:"required"`
		Destination string   `json:"destination" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Sources and destination are required",
		})
		return
	}

	userPath := getUserFilesPath(userID)

	for _, source := range req.Sources {
		srcPath := filepath.Join(userPath, source)
		destPath := filepath.Join(userPath, req.Destination, filepath.Base(source))

		// Security check
		if !strings.HasPrefix(filepath.Clean(srcPath), filepath.Clean(userPath)) ||
			!strings.HasPrefix(filepath.Clean(destPath), filepath.Clean(userPath)) {
			continue
		}

		// Move file or directory
		if err := os.Rename(srcPath, destPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to move",
				"error":   err.Error(),
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Moved successfully",
	})
}

// ExtractZip extracts a ZIP file
func (fc *FileController) ExtractZip(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Path        string `json:"path" binding:"required"`
		Destination string `json:"destination"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Path is required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	zipPath := filepath.Join(userPath, req.Path)

	destPath := req.Destination
	if destPath == "" {
		destPath = filepath.Dir(req.Path)
	}
	destFullPath := filepath.Join(userPath, destPath)

	// Security check
	if !strings.HasPrefix(filepath.Clean(zipPath), filepath.Clean(userPath)) ||
		!strings.HasPrefix(filepath.Clean(destFullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Open ZIP file
	r, err := zip.OpenReader(zipPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to open ZIP file",
		})
		return
	}
	defer r.Close()

	// Extract files
	for _, f := range r.File {
		fpath := filepath.Join(destFullPath, f.Name)

		// Security check for zip slip vulnerability
		if !strings.HasPrefix(filepath.Clean(fpath), filepath.Clean(destFullPath)) {
			continue
		}

		if f.FileInfo().IsDir() {
			os.MkdirAll(fpath, os.ModePerm)
			continue
		}

		// Create parent directories
		os.MkdirAll(filepath.Dir(fpath), os.ModePerm)

		// Create file
		outFile, err := os.OpenFile(fpath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.Mode())
		if err != nil {
			continue
		}

		rc, err := f.Open()
		if err != nil {
			outFile.Close()
			continue
		}

		io.Copy(outFile, rc)
		outFile.Close()
		rc.Close()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Extracted successfully",
	})
}

// CompressFiles compresses files to ZIP
func (fc *FileController) CompressFiles(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Paths   []string `json:"paths" binding:"required"`
		ZipName string   `json:"zipName" binding:"required"`
		OutPath string   `json:"outPath"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Paths and zipName are required",
		})
		return
	}

	userPath := getUserFilesPath(userID)

	outPath := req.OutPath
	if outPath == "" {
		outPath = "/"
	}
	zipPath := filepath.Join(userPath, outPath, req.ZipName)

	// Security check
	if !strings.HasPrefix(filepath.Clean(zipPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Create ZIP file
	zipFile, err := os.Create(zipPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create ZIP file",
		})
		return
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	// Add files to ZIP
	for _, p := range req.Paths {
		fullPath := filepath.Join(userPath, p)

		// Security check
		if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
			continue
		}

		filepath.Walk(fullPath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return nil
			}

			relPath, _ := filepath.Rel(filepath.Dir(fullPath), path)

			if info.IsDir() {
				return nil
			}

			writer, err := zipWriter.Create(relPath)
			if err != nil {
				return nil
			}

			file, err := os.Open(path)
			if err != nil {
				return nil
			}
			defer file.Close()

			io.Copy(writer, file)
			return nil
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Compressed successfully",
	})
}

// GitClone clones a Git repository
func (fc *FileController) GitClone(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		URL  string `json:"url" binding:"required"`
		Path string `json:"path"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Repository URL is required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	destPath := filepath.Join(userPath, req.Path)

	// Security check
	if !strings.HasPrefix(filepath.Clean(destPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Execute git clone
	cmd := exec.Command("git", "clone", req.URL, destPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to clone repository",
			"error":   string(output),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Repository cloned successfully",
	})
}

// ChangePermissions changes file/folder permissions
func (fc *FileController) ChangePermissions(c *gin.Context) {
	userID := middleware.GetUserIDString(c)

	var req struct {
		Path        string `json:"path" binding:"required"`
		Permissions string `json:"permissions" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Path and permissions are required",
		})
		return
	}

	userPath := getUserFilesPath(userID)
	fullPath := filepath.Join(userPath, req.Path)

	// Security check
	if !strings.HasPrefix(filepath.Clean(fullPath), filepath.Clean(userPath)) {
		c.JSON(http.StatusForbidden, gin.H{
			"success": false,
			"message": "Access denied",
		})
		return
	}

	// Parse permissions (e.g., "755" -> 0755)
	mode, err := strconv.ParseUint(req.Permissions, 8, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid permissions format",
		})
		return
	}

	// Change permissions
	if err := os.Chmod(fullPath, os.FileMode(mode)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to change permissions",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Permissions changed successfully",
	})
}

// Helper functions

func formatBytes(bytes int64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func formatDate(t time.Time) string {
	return t.Format("Jan 02, 2006 03:04 PM")
}

func getDirectoryStats(path string) DirectoryStats {
	stats := DirectoryStats{}

	filepath.Walk(path, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			stats.FolderCount++
		} else {
			stats.FileCount++
			stats.TotalSize += info.Size()
		}
		return nil
	})

	return stats
}

func copyPath(src, dst string) error {
	info, err := os.Stat(src)
	if err != nil {
		return err
	}

	if info.IsDir() {
		return copyDirectory(src, dst)
	}
	return copyFile(src, dst)
}

func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	os.MkdirAll(filepath.Dir(dst), 0755)

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

func copyDirectory(src, dst string) error {
	return filepath.Walk(src, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relPath, _ := filepath.Rel(src, path)
		destPath := filepath.Join(dst, relPath)

		if info.IsDir() {
			return os.MkdirAll(destPath, info.Mode())
		}

		return copyFile(path, destPath)
	})
}
