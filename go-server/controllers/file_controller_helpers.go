package controllers

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

// isValidGitURL validates that the URL is HTTPS-only from trusted providers
// SECURITY: Prevents command injection and SSRF attacks via git clone
func isValidGitURL(url string) bool {
	// Only allow HTTPS URLs from trusted providers
	allowedPrefixes := []string{
		"https://github.com/",
		"https://gitlab.com/",
		"https://bitbucket.org/",
	}

	urlLower := strings.ToLower(url)
	for _, prefix := range allowedPrefixes {
		if strings.HasPrefix(urlLower, prefix) {
			// Additional check: ensure no shell metacharacters
			forbidden := []string{";", "&", "|", "$", "`", "(", ")", "<", ">", "\n", "\r"}
			for _, char := range forbidden {
				if strings.Contains(url, char) {
					return false
				}
			}
			return true
		}
	}
	return false
}

// logAndRespond logs detailed errors server-side and returns generic messages to clients
// SECURITY: Prevents information leakage via error messages
func logAndRespond(c *gin.Context, status int, logMsg string, err error, userMsg string) {
	// Log detailed error for debugging
	log.Printf("[ERROR] %s: %v", logMsg, err)

	// Return generic message to user
	c.JSON(status, gin.H{
		"success": false,
		"message": userMsg,
	})
}

// isSymlink checks if a path is a symbolic link
// SECURITY: Prevents symlink attacks that could bypass directory restrictions
func isSymlink(path string) bool {
	info, err := os.Lstat(path)
	if err != nil {
		return false
	}
	return info.Mode()&os.ModeSymlink != 0
}

// validateSymlinkPath checks if a symlink resolves to a safe path within userPath
// SECURITY: Prevents symlink attacks from accessing files outside allowed directory
func validateSymlinkPath(fullPath, userPath string) error {
	if isSymlink(fullPath) {
		realPath, err := filepath.EvalSymlinks(fullPath)
		if err != nil {
			return fmt.Errorf("failed to resolve symlink")
		}
		if !strings.HasPrefix(realPath, filepath.Clean(userPath)) {
			return fmt.Errorf("symlink points outside allowed directory")
		}
	}
	return nil
}
