# 📋 Rencana Migrasi Backend: TypeScript → Golang

## 📌 Ringkasan Project

**Project:** CloudKu - Web Hosting Control Panel  
**Backend Saat Ini:** Node.js + Express + TypeScript  
**Target:** Golang dengan Gin/Fiber Framework

---

## 🏗️ Arsitektur Golang yang Diusulkan

```
go-server/
├── main.go                    # Entry point
├── go.mod                     # Go modules
├── go.sum
├── .env                       # Environment variables
│
├── config/                    # Konfigurasi
│   └── config.go              # Load environment variables
│
├── database/                  # Database connection
│   └── postgres.go            # PostgreSQL connection pool
│
├── middleware/                # Middleware
│   ├── auth.go                # JWT authentication
│   ├── cors.go                # CORS handling
│   └── logger.go              # Request logging
│
├── models/                    # Data models/structs
│   ├── user.go
│   ├── domain.go
│   ├── dns_record.go
│   ├── ssl_certificate.go
│   └── database.go
│
├── controllers/               # Request handlers
│   ├── auth_controller.go
│   ├── file_controller.go
│   ├── domain_controller.go
│   ├── dns_controller.go
│   ├── ssl_controller.go
│   └── database_controller.go
│
├── routes/                    # Route definitions
│   └── routes.go              # All API routes
│
├── services/                  # Business logic
│   ├── backup_service.go
│   ├── database_service.go
│   ├── dns_service.go
│   ├── nginx_service.go
│   └── ssl_service.go
│
├── utils/                     # Helper functions
│   ├── jwt.go
│   ├── password.go
│   └── file.go
│
└── cron/                      # Scheduled tasks
    └── ssl_renewal.go
```

---

## 📦 Dependencies Golang yang Diperlukan

| Package                                            | Fungsi                | Menggantikan       |
| -------------------------------------------------- | --------------------- | ------------------ |
| `github.com/gin-gonic/gin`                         | HTTP Framework        | Express.js         |
| `github.com/lib/pq` atau `github.com/jackc/pgx/v5` | PostgreSQL Driver     | pg (node-postgres) |
| `github.com/golang-jwt/jwt/v5`                     | JWT Token             | jsonwebtoken       |
| `golang.org/x/crypto/bcrypt`                       | Password Hashing      | bcryptjs           |
| `github.com/joho/godotenv`                         | Environment Variables | dotenv             |
| `github.com/rs/cors`                               | CORS Middleware       | cors               |
| `github.com/robfig/cron/v3`                        | Scheduled Tasks       | node-cron          |
| `github.com/mholt/archiver/v4`                     | ZIP Compression       | adm-zip            |

---

## 📝 Tahapan Migrasi

### **Fase 1: Setup Project Golang** (Hari 1)

- [ ] Buat folder `go-server/`
- [ ] Inisialisasi Go modules (`go mod init`)
- [ ] Install dependencies
- [ ] Setup konfigurasi environment
- [ ] Setup database connection ke PostgreSQL

### **Fase 2: Migrasi Core Components** (Hari 2-3)

- [ ] **Models** - Konversi TypeScript interfaces ke Go structs

  - `User` model
  - `Domain` model
  - `DNSRecord` model
  - Response structs

- [ ] **Database Pool** - Setup PostgreSQL connection

  - Connection pooling
  - Query helpers

- [ ] **JWT & Auth Middleware**
  - Token generation
  - Token validation middleware
  - Password hashing

### **Fase 3: Migrasi Controllers** (Hari 4-7)

#### 3.1 Auth Controller (`authController.ts` → `auth_controller.go`)

| TypeScript Function | Golang Function   |
| ------------------- | ----------------- |
| `generateToken()`   | `GenerateToken()` |
| `githubAuth()`      | `GithubAuth()`    |
| `googleAuth()`      | `GoogleAuth()`    |
| `register()`        | `Register()`      |
| `login()`           | `Login()`         |
| `getMe()`           | `GetMe()`         |

#### 3.2 File Controller (`fileController.ts` → `file_controller.go`)

| TypeScript Function   | Golang Function       |
| --------------------- | --------------------- |
| `listFiles()`         | `ListFiles()`         |
| `uploadFile()`        | `UploadFile()`        |
| `downloadFile()`      | `DownloadFile()`      |
| `deleteFile()`        | `DeleteFile()`        |
| `createFolder()`      | `CreateFolder()`      |
| `readFile()`          | `ReadFile()`          |
| `updateFile()`        | `UpdateFile()`        |
| `renameFile()`        | `RenameFile()`        |
| `extractZip()`        | `ExtractZip()`        |
| `copyFiles()`         | `CopyFiles()`         |
| `moveFiles()`         | `MoveFiles()`         |
| `gitClone()`          | `GitClone()`          |
| `changePermissions()` | `ChangePermissions()` |
| `compressFiles()`     | `CompressFiles()`     |

#### 3.3 Domain Controller (`domainController.ts` → `domain_controller.go`)

| TypeScript Function | Golang Function     |
| ------------------- | ------------------- |
| `getDomains()`      | `GetDomains()`      |
| `getDomain()`       | `GetDomain()`       |
| `createDomain()`    | `CreateDomain()`    |
| `updateDomain()`    | `UpdateDomain()`    |
| `deleteDomain()`    | `DeleteDomain()`    |
| `getDNSRecords()`   | `GetDNSRecords()`   |
| `createDNSRecord()` | `CreateDNSRecord()` |
| `deleteDNSRecord()` | `DeleteDNSRecord()` |
| `verifyDomain()`    | `VerifyDomain()`    |

#### 3.4 Other Controllers

- [ ] `dnsController.ts` → `dns_controller.go`
- [ ] `sslController.ts` → `ssl_controller.go`
- [ ] `databaseController.ts` → `database_controller.go`

### **Fase 4: Migrasi Services** (Hari 8-9)

- [ ] `backupService.ts` → `backup_service.go`
- [ ] `databaseService.ts` → `database_service.go`
- [ ] `dnsService.ts` → `dns_service.go`
- [ ] `nginxService.ts` → `nginx_service.go`
- [ ] `sslService.ts` → `ssl_service.go`

### **Fase 5: Routes & Main Entry** (Hari 10)

- [ ] Setup semua API routes
- [ ] Main entry point dengan graceful shutdown
- [ ] Health check endpoint

### **Fase 6: Testing & Debugging** (Hari 11-12)

- [ ] Test semua endpoints dengan Postman/Thunder Client
- [ ] Test integrasi dengan Frontend React
- [ ] Fix bugs dan edge cases

---

## 🔄 Mapping API Endpoints

```
TypeScript (Express)          →    Golang (Gin)
======================================================
GET    /health                →    GET    /health
POST   /api/auth/google       →    POST   /api/auth/google
POST   /api/auth/github       →    POST   /api/auth/github
POST   /api/auth/register     →    POST   /api/auth/register
POST   /api/auth/login        →    POST   /api/auth/login
GET    /api/auth/me           →    GET    /api/auth/me

GET    /api/files/list        →    GET    /api/files/list
POST   /api/files/upload      →    POST   /api/files/upload
GET    /api/files/download    →    GET    /api/files/download
DELETE /api/files/delete      →    DELETE /api/files/delete
POST   /api/files/folder      →    POST   /api/files/folder
GET    /api/files/read        →    GET    /api/files/read
PUT    /api/files/update      →    PUT    /api/files/update
PUT    /api/files/rename      →    PUT    /api/files/rename
POST   /api/files/extract     →    POST   /api/files/extract
POST   /api/files/copy        →    POST   /api/files/copy
POST   /api/files/move        →    POST   /api/files/move
POST   /api/files/compress    →    POST   /api/files/compress

GET    /api/domains           →    GET    /api/domains
GET    /api/domains/:id       →    GET    /api/domains/:id
POST   /api/domains           →    POST   /api/domains
PUT    /api/domains/:id       →    PUT    /api/domains/:id
DELETE /api/domains/:id       →    DELETE /api/domains/:id

GET    /api/dns/:domainId     →    GET    /api/dns/:domainId
POST   /api/dns               →    POST   /api/dns
DELETE /api/dns/:id           →    DELETE /api/dns/:id

GET    /api/ssl               →    GET    /api/ssl
POST   /api/ssl               →    POST   /api/ssl
DELETE /api/ssl/:id           →    DELETE /api/ssl/:id

GET    /api/databases         →    GET    /api/databases
POST   /api/databases         →    POST   /api/databases
DELETE /api/databases/:id     →    DELETE /api/databases/:id
```

---

## ⚠️ Hal Penting yang Perlu Diperhatikan

### 1. Perbedaan Sintaks

```typescript
// TypeScript
const greeting: string = "Hello";
async function getData(): Promise<User> { ... }
```

```go
// Golang
var greeting string = "Hello"
func GetData() (*User, error) { ... }
```

### 2. Error Handling

- TypeScript: try-catch
- Golang: Return error sebagai nilai kedua

### 3. Null vs Nil

- TypeScript: `null`, `undefined`
- Golang: `nil` (untuk pointers, slices, maps, channels)

### 4. JSON Response

```go
c.JSON(http.StatusOK, gin.H{
    "success": true,
    "data": user,
})
```

---

## 🚀 Commands untuk Memulai

```bash
# 1. Buat folder go-server
mkdir go-server
cd go-server

# 2. Inisialisasi Go module
go mod init cloudku-server

# 3. Install dependencies
go get github.com/gin-gonic/gin
go get github.com/jackc/pgx/v5
go get github.com/golang-jwt/jwt/v5
go get golang.org/x/crypto/bcrypt
go get github.com/joho/godotenv
go get github.com/rs/cors
go get github.com/robfig/cron/v3

# 4. Run server
go run main.go
```

---

## 🎯 Keuntungan Migrasi ke Golang

| Aspek           | TypeScript/Node.js    | Golang                 |
| --------------- | --------------------- | ---------------------- |
| **Performa**    | Cepat (V8 Engine)     | Lebih cepat (compiled) |
| **Memory**      | Higher                | Lower                  |
| **Concurrency** | Event Loop            | Goroutines (native)    |
| **Deployment**  | Node runtime required | Single binary          |
| **Type Safety** | Runtime/Compile       | Compile time           |
| **Build Time**  | npm install (slow)    | go build (fast)        |

---

## ✅ Checklist Migrasi

- [x] Fase 1: Setup Project ✓ (SELESAI)
- [x] Fase 2: Core Components (SELESAI)
  - [x] config/config.go
  - [x] database/postgres.go
  - [x] models/user.go
  - [x] models/domain.go
  - [x] models/dns_record.go
  - [x] utils/jwt.go
  - [x] utils/password.go
  - [x] middleware/auth.go
  - [x] middleware/cors.go
  - [x] middleware/logger.go
- [x] Fase 3: Controllers (SELESAI - 100%)
  - [x] controllers/auth_controller.go (Register, Login, GetMe, Google, GitHub)
  - [x] controllers/file_controller.go (15 operasi file)
  - [x] controllers/domain_controller.go (CRUD + DNS records)
  - [x] controllers/dns_controller.go (Stats, Export, PowerDNS)
  - [x] controllers/ssl_controller.go (Enable, Disable, Renew)
  - [x] controllers/database_controller.go (MySQL/PostgreSQL management)
- [ ] Fase 4: Services (Opsional - fungsi sudah di controllers)
- [x] Fase 5: Routes & Main (SELESAI)
  - [x] routes/routes.go (50+ endpoints)
  - [x] main.go
- [ ] Fase 6: Testing
- [ ] Frontend API URL updated to Go server
- [ ] Documentation updated

### 🎉 Build Status: SUCCESS!

- Binary: `cloudku-server.exe` (34.5 MB)
- Siap untuk dijalankan dengan `go run main.go` atau `./cloudku-server.exe`

---

**Estimasi Waktu Total: 10-12 Hari Kerja**

_Dibuat: 2026-01-07_
