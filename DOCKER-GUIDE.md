# BS-Bazaar Docker Guide 🐳

This project is configured to run entirely with Docker for both development and production environments.

## 🚀 Quick Start

### Development Mode
```powershell
# 1. Switch to development environment
npm run switch:dev

# 2. Start development services with hot reloading
npm run dev

# 3. Open your browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
```

### Production Mode
```powershell
# 1. Switch to production environment
npm run switch:prod

# 2. Start production services
npm run prod

# 3. Open your browser
# Frontend: http://localhost
# Backend API: http://localhost:3001
```

## 📋 Available Commands

### Development Commands
```powershell
npm run dev              # Start development services (with hot reload)
npm run dev:down         # Stop development services
npm run dev:logs         # View development logs (all services)
npm run dev:rebuild      # Rebuild and restart development services
npm run logs:server      # View only server logs
npm run logs:client      # View only client logs
npm run shell:server     # Open shell in server container
npm run shell:client     # Open shell in client container
```

### Production Commands
```powershell
npm run prod             # Start production services
npm run prod:down        # Stop production services
npm run prod:logs        # View production logs
npm run prod:rebuild     # Rebuild and restart production services
```

### Utility Commands
```powershell
npm run health           # Check if services are running
npm run docker:clean     # Clean up Docker system (remove unused containers/images)
npm run docker:reset     # Complete reset (stop everything, clean system)
```

### Environment Switching
```powershell
npm run switch:dev       # Switch to development environment
npm run switch:prod      # Switch to production environment
```

## 🏗 Docker Architecture

### Development Setup (`docker-compose.dev.yml`)
- **Hot Reloading**: Both client and server reload on file changes
- **Volume Mounting**: Your source code is mounted into containers
- **Port Mapping**: 
  - Client: localhost:3000
  - Server: localhost:3001
- **Network**: Internal Docker network for service communication

### Production Setup (`docker-compose.yml`)
- **Optimized Builds**: Multi-stage builds for smaller images
- **Health Checks**: Built-in health monitoring
- **Restart Policies**: Automatic restart on failure
- **Port Mapping**:
  - Client: localhost:80
  - Server: localhost:3001

## 🔧 Configuration Files

### Development Dockerfiles
- `bazaar-server/Dockerfile.dev` - Server with nodemon for hot reloading
- `bazaar-client/Dockerfile.dev` - Client with React dev server

### Production Dockerfiles
- `bazaar-server/Dockerfile.server` - Optimized server build
- `bazaar-client/Dockerfile` - Multi-stage client build with nginx

### Docker Compose Files
- `docker-compose.dev.yml` - Development configuration
- `docker-compose.yml` - Production configuration

## 🛠 Development Workflow

1. **Start Development**:
   ```powershell
   npm run dev
   ```

2. **Make Changes**: 
   - Edit files in `bazaar-client/` or `bazaar-server/`
   - Changes are automatically reflected (hot reload)

3. **View Logs**:
   ```powershell
   npm run dev:logs          # All logs
   npm run logs:server       # Server only
   npm run logs:client       # Client only
   ```

4. **Debug Issues**:
   ```powershell
   npm run shell:server      # Access server container
   npm run shell:client      # Access client container
   ```

5. **Clean Restart**:
   ```powershell
   npm run dev:rebuild       # Rebuild everything
   ```

## 🚀 Production Deployment

### Local Production Testing
```powershell
# 1. Switch to production environment
npm run switch:prod

# 2. Start production services
npm run prod

# 3. Test the application
npm run health
```

### Cloud Deployment
```powershell
# 1. Prepare production environment
npm run switch:prod

# 2. Build and push images (example with Docker Hub)
docker-compose build
docker tag bs-bazaar-server:latest yourusername/bs-bazaar-server:latest
docker tag bs-bazaar-client:latest yourusername/bs-bazaar-client:latest
docker push yourusername/bs-bazaar-server:latest
docker push yourusername/bs-bazaar-client:latest

# 3. Deploy to your cloud provider using docker-compose.yml
```

## 🔍 Monitoring and Debugging

### Health Checks
```powershell
# Check if services are healthy
npm run health

# View detailed service status
docker-compose -f docker-compose.dev.yml ps
```

### Logs
```powershell
# Follow all logs
npm run dev:logs

# Follow specific service logs
docker-compose -f docker-compose.dev.yml logs -f server
docker-compose -f docker-compose.dev.yml logs -f client

# View last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 server
```

### Container Access
```powershell
# Access server container
npm run shell:server

# Access client container  
npm run shell:client

# Execute specific commands
docker-compose -f docker-compose.dev.yml exec server npm --version
docker-compose -f docker-compose.dev.yml exec client ls -la
```

## 🧹 Maintenance

### Cleanup
```powershell
# Stop all services
npm run dev:down
npm run prod:down

# Clean Docker system
npm run docker:clean

# Complete reset (nuclear option)
npm run docker:reset
```

### Rebuilding
```powershell
# Rebuild development environment
npm run dev:rebuild

# Rebuild production environment
npm run prod:rebuild

# Force rebuild without cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```powershell
# Stop all services first
npm run dev:down
npm run prod:down

# Then restart
npm run dev
```

**Database Issues**
```powershell
# Reset volumes (this will delete data!)
docker-compose -f docker-compose.dev.yml down -v
npm run dev
```

**Hot Reload Not Working**
```powershell
# Rebuild development containers
npm run dev:rebuild
```

**Environment Variables Not Loading**
```powershell
# Make sure you switched environments
npm run switch:dev  # or npm run switch:prod

# Check environment files exist
dir bazaar-client\.env
dir bazaar-server\.env
```

### Performance Issues
```powershell
# Check resource usage
docker stats

# Clean up unused resources
npm run docker:clean

# Restart Docker Desktop if needed
```

## 📁 Directory Structure
```
BS-Bazaar-dev/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration
├── bazaar-client/
│   ├── Dockerfile              # Production client build
│   ├── Dockerfile.dev          # Development client build
│   └── ...
├── bazaar-server/
│   ├── Dockerfile.server       # Production server build
│   ├── Dockerfile.dev          # Development server build
│   └── ...
└── package.json                # Docker-first npm scripts
```

## 🎯 Best Practices

1. **Always use the npm scripts** instead of direct docker commands
2. **Switch environments** before starting services
3. **Use dev:rebuild** when you change dependencies
4. **Monitor logs** during development
5. **Clean up regularly** to free disk space
6. **Test production locally** before deploying

## 🔗 Useful Links

- Frontend: http://localhost:3000 (dev) / http://localhost (prod)
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health
- API Info: http://localhost:3001/api/info
