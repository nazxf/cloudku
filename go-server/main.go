package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"cloudku-server/config"
	"cloudku-server/database"
	"cloudku-server/middleware"
	"cloudku-server/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Connect to database
	if err := database.Connect(); err != nil {
		log.Fatalf("❌ Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Connect to MySQL Admin
	if err := database.ConnectMySQLAdmin(); err != nil {
		log.Printf("⚠️ Failed to connect to MySQL Admin: %v", err)
		// We don't fatal here because the server can still run with just Postgres
	}
	defer database.CloseMySQL()

	// Initialize schema
	if err := database.InitSchema(); err != nil {
		log.Fatalf("❌ Failed to initialize database schema: %v", err)
	}

	// Create Gin router
	r := gin.New()

	// SECURITY: Set max multipart form memory (50MB)
	r.MaxMultipartMemory = 50 << 20 // 50MB

	// Add middlewares
	r.Use(gin.Recovery())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.CORSMiddleware())

	// SECURITY: Request timeout middleware (30 seconds)
	r.Use(middleware.TimeoutMiddleware(30 * time.Second))

	// Setup routes
	routes.SetupRoutes(r)

	// Create HTTP server with security hardening
	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           r,
		ReadTimeout:       30 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       120 * time.Second, // SECURITY: Close idle connections
		ReadHeaderTimeout: 10 * time.Second,  // SECURITY: Prevent Slowloris attacks
		MaxHeaderBytes:    1 << 20,           // SECURITY: 1MB max header size
	}

	// Start server in goroutine
	go func() {
		// Always show banner
		printBanner(cfg)

		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("\n🛑 Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✅ Server gracefully stopped")
}

func printBanner(cfg *config.Config) {
	// ANSI Colors
	const (
		Reset  = "\033[0m"
		Red    = "\033[31m"
		Green  = "\033[32m"
		Yellow = "\033[33m"
		Blue   = "\033[34m"
		Purple = "\033[35m"
		Cyan   = "\033[36m"
		White  = "\033[37m"
		Gray   = "\033[90m"
		Bold   = "\033[1m"
	)

	// Helper for coloring methods
	methodColor := func(method string) string {
		switch method {
		case "GET":
			return Blue + "GET   " + Reset
		case "POST":
			return Green + "POST  " + Reset
		case "PUT":
			return Yellow + "PUT   " + Reset
		case "DELETE":
			return Red + "DELETE" + Reset
		default:
			return White + method + Reset
		}
	}

	fmt.Println()
	fmt.Println(Cyan + Bold + `   ________                _____ __
  / ____/ /___  __  ______/ / //_/_  __
 / /   / / __ \/ / / / __  / ,< / / / /
/ /___/ / /_/ / /_/ / /_/ / /| / /_/ /
\____/_/\____/\__,_/\__,_/_/ |_\__,_/ ` + Reset)
	fmt.Println()

	// System Info Box
	fmt.Println(Gray + " ╔════════════════════════════════════════════════════════════════════╗" + Reset)
	fmt.Printf("%s ║ %s🚀 CLOUDKU SERVER STATUS%s                                           %s║%s\n", Gray, White+Bold, Reset, Gray, Reset)
	fmt.Println(Gray + " ╠════════════════════════════════════════════════════════════════════╣" + Reset)
	fmt.Printf("%s ║ %s📡 STATUS   %s:  %s● ONLINE%s                                           %s║%s\n", Gray, White, Reset, Green, Reset, Gray, Reset)
	fmt.Printf("%s ║ %s🔌 PORT     %s:  %s%-47s%s%s║%s\n", Gray, White, Reset, Cyan, cfg.Port, Reset, Gray, Reset)
	fmt.Printf("%s ║ %s🌍 ENV      %s:  %s%-47s%s%s║%s\n", Gray, White, Reset, Yellow, cfg.Environment, Reset, Gray, Reset)
	fmt.Printf("%s ║ %s🗄️  DATABASE %s:  %sPostgreSQL (Connected)%s                            %s║%s\n", Gray, White, Reset, Blue, Reset, Gray, Reset)
	fmt.Printf("%s ║ %s🔗 FRONTEND %s:  %s%-47s%s%s║%s\n", Gray, White, Reset, Purple, cfg.FrontendURL, Reset, Gray, Reset)
	fmt.Println(Gray + " ╚════════════════════════════════════════════════════════════════════╝" + Reset)
	fmt.Println()

	fmt.Println(Bold + " 📋 AVAILABLE MODULES & ENDPOINTS" + Reset)
	fmt.Println(Gray + " ──────────────────────────────────────────────────────────────────────" + Reset)

	// Function to print a section header
	printSection := func(icon, name string) {
		fmt.Printf("\n %s%s %s%s\n", Cyan, icon, name, Reset)
	}

	// Function to print an endpoint
	printEndpoint := func(method, path, desc string) {
		fmt.Printf("   %s %-25s %s%s%s\n", methodColor(method), path, Gray, desc, Reset)
	}

	// Discovery
	printSection("🔍", "DISCOVERY")
	printEndpoint("GET", "/health", "Server health check")
	printEndpoint("GET", "/api", "API info")

	// Auth
	printSection("🔐", "AUTHENTICATION")
	printEndpoint("POST", "/api/v1/auth/login", "User login")
	printEndpoint("POST", "/api/v1/auth/register", "New user registration")
	printEndpoint("GET", "/api/v1/auth/me", "Get current user profile")

	// Files
	printSection("📁", "FILE MANAGER")
	printEndpoint("GET", "/api/v1/files/list", "List directory contents")
	printEndpoint("POST", "/api/v1/files/upload", "Upload new files")
	printEndpoint("POST", "/api/v1/files/folder", "Create new directory")
	printEndpoint("POST", "/api/v1/files/compress", "Compress files to ZIP")
	printEndpoint("POST", "/api/v1/files/extract", "Extract ZIP archive")

	// Domains
	printSection("🌐", "DOMAINS & DNS")
	printEndpoint("GET", "/api/v1/domains", "List all domains")
	printEndpoint("POST", "/api/v1/domains", "Register new domain")
	printEndpoint("POST", "/api/v1/domains/:id/verify", "Verify domain ownership")
	printEndpoint("GET", "/api/v1/domains/:id/dns", "Manage DNS records")

	// SSL
	printSection("🔒", "SSL/TLS CERTIFICATES")
	printEndpoint("GET", "/api/v1/ssl/stats", "Certificate statistics")
	printEndpoint("POST", "/api/v1/ssl/:id/renew", "Renew SSL certificate")

	// Databases
	printSection("🗄️", "DATABASES")
	printEndpoint("GET", "/api/v1/databases", "List databases")
	printEndpoint("POST", "/api/v1/databases", "Create new database")
	printEndpoint("POST", "/api/v1/databases/query", "Execute SQL query")

	fmt.Println()
	fmt.Println(Gray + " ──────────────────────────────────────────────────────────────────────" + Reset)
	fmt.Printf(" %sServer is ready to accept connections...%s\n", Green, Reset)
	fmt.Println()
}
