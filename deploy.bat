@echo off
setlocal enabledelayedexpansion

:: BS-Bazaar Production Deployment Script for Windows
:: This script handles the complete deployment process

echo.
echo 🚀 BS-Bazaar Production Deployment
echo ==================================

set "deployment_type=%1"
if "%deployment_type%"=="" set "deployment_type=docker"

:: Check if required tools are installed
echo [INFO] Checking requirements...

where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm is not installed
    exit /b 1
)

where docker >nul 2>nul
if errorlevel 1 (
    echo [WARNING] Docker is not installed - Docker deployment will not be available
    set "docker_available=false"
) else (
    set "docker_available=true"
)

echo [SUCCESS] Requirements check passed

:: Install dependencies
echo [INFO] Installing dependencies...

call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install root dependencies
    exit /b 1
)

cd bazaar-client
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install client dependencies
    exit /b 1
)
cd ..

cd bazaar-server
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install server dependencies
    exit /b 1
)
cd ..

echo [SUCCESS] Dependencies installed

:: Switch to production environment
echo [INFO] Switching to production environment...

powershell -ExecutionPolicy Bypass -File .\switch-env.ps1 -env production
if errorlevel 1 (
    echo [ERROR] Failed to switch environment
    exit /b 1
)

echo [SUCCESS] Environment switched to production

:: Build the application
echo [INFO] Building application...

cd bazaar-client
call npm run build
if errorlevel 1 (
    echo [ERROR] Failed to build client
    exit /b 1
)
cd ..

echo [SUCCESS] Application built successfully

:: Deploy based on type
if "%deployment_type%"=="docker" (
    if "%docker_available%"=="true" (
        echo [INFO] Deploying with Docker...
        
        :: Stop existing containers
        docker-compose down 2>nul
        
        :: Build and start new containers
        docker-compose up --build -d
        if errorlevel 1 (
            echo [ERROR] Docker deployment failed
            exit /b 1
        )
        
        echo [SUCCESS] Docker deployment completed
        
        :: Health check
        echo [INFO] Performing health check...
        timeout /t 10 /nobreak >nul
        
        curl -f http://localhost:3001/health >nul 2>nul
        if errorlevel 1 (
            echo [WARNING] Server health check failed - service may still be starting
        ) else (
            echo [SUCCESS] Server health check passed
        )
        
        curl -f http://localhost/ >nul 2>nul
        if errorlevel 1 (
            echo [WARNING] Client health check failed - service may still be starting
        ) else (
            echo [SUCCESS] Client health check passed
        )
    ) else (
        echo [ERROR] Docker not available, falling back to manual deployment
        goto manual_deploy
    )
) else (
    :manual_deploy
    echo [INFO] Manual deployment preparation...
    
    echo [INFO] Client build files are ready in: .\bazaar-client\build\
    echo [INFO] Server files are ready in: .\bazaar-server\
    
    echo.
    echo [WARNING] Manual deployment steps:
    echo 1. Copy .\bazaar-client\build\ contents to your web server
    echo 2. Deploy .\bazaar-server\ to your Node.js hosting environment
    echo 3. Ensure environment variables are properly set
    echo 4. Start the server with: npm start
    
    echo [SUCCESS] Manual deployment preparation completed
)

echo.
echo [SUCCESS] 🎉 Deployment completed successfully!
echo.
echo Your application should now be available at:
echo - Frontend: http://localhost
echo - Backend API: http://localhost:3001
echo - Health Check: http://localhost:3001/health

goto :eof

:show_help
echo Usage: %0 [docker^|manual^|health]
echo.
echo Commands:
echo   docker  - Deploy using Docker (default)
echo   manual  - Prepare for manual deployment
echo   health  - Run health checks only
goto :eof
