@echo off
echo Setting environment variables...

set DB_HOST=localhost
set DB_PORT=5433
set DB_NAME=hostmodern
set DB_USER=postgres
set DB_PASSWORD=1234
set DB_POOL_MAX=20

set PORT=3001
set FRONTEND_URL=http://localhost:5173
set SERVER_IP=127.0.0.1

set JWT_SECRET=a8f5c9e2d7b4f1a3e6c8d9f2b5e7a4c1f3d6b8e9a2c5f7d1b4e8a3f6c9d2e5b7a1
set JWT_EXPIRES_IN=7d

set GITHUB_CLIENT_ID=Ov23liEl2bjxCxA7DkIz
set GITHUB_CLIENT_SECRET=5a1229709506877e4f37885729215d6444df383c

echo Starting Go server...
go run main.go
