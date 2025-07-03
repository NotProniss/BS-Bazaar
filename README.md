# BS-Bazaar 🏪

A modern marketplace for Brighter Shores items with Discord OAuth integration, real-time updates, and comprehensive item management.

**🐳 This project runs entirely with Docker - no local Node.js setup required!**

## 🚀 Quick Start

```powershell
# 1. Clone the repository
git clone <repository-url>
cd BS-Bazaar-dev

# 2. Switch to development environment
npm run switch:dev

# 3. Start the application with Docker
npm run dev

# 4. Open your browser
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

That's it! Docker handles all the dependencies, builds, and services.

## 🐳 Docker-First Architecture

This project is designed to run entirely in Docker containers:

- **No local Node.js required** - everything runs in containers
- **Hot reloading** - your code changes are reflected immediately
- **Consistent environment** - same setup for all developers
- **Easy deployment** - production-ready containers

## � Available Commands

### Development
```powershell
npm run dev              # Start development (hot reload)
npm run dev:logs         # View logs
npm run dev:down         # Stop services
npm run dev:rebuild      # Rebuild and restart
```

### Production
```powershell
npm run switch:prod      # Switch to production environment
npm run prod             # Start production services
npm run prod:logs        # View production logs
```

### Utilities
```powershell
npm run health           # Check service health
npm run docker:clean     # Clean up Docker
npm run docker:reset     # Complete reset
```

For detailed Docker commands and workflows, see [DOCKER-GUIDE.md](DOCKER-GUIDE.md).

## 🔧 Environment Configuration

The project uses environment-specific configuration files:

### Client Environment Files
- `.env.development` - Development settings
- `.env.production` - Production settings

### Server Environment Files
- `.env.development` - Development API keys and URLs
- `.env.production` - Production API keys and URLs

### Required Environment Variables

**Server (`.env` files):**
```bash
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_CALLBACK_URL=http://localhost:3001/auth/discord/callback
SESSION_SECRET=your_session_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost
NODE_ENV=development
```

**Client (`.env` files):**
```bash
REACT_APP_BACKEND_URL=http://localhost:3001
```

## 🚀 Development

### Starting the Development Server

```powershell
# Start both client and server
npm start

# Or start individually
npm run start:client  # Starts React dev server on port 3000
npm run start:server  # Starts Express server on port 3001
```

### Environment Switching

```powershell
# Switch to development environment
npm run switch:dev

# Switch to production environment and build
npm run switch:prod
```

### Using the Switch Script Directly

```powershell
# Basic usage
.\switch-env.ps1 -env development
.\switch-env.ps1 -env production

# Switch and build
.\switch-env.ps1 -env production -build

# Show help
.\switch-env.ps1 -help
```

## 🏭 Production Deployment

### Method 1: Using Environment Script

```powershell
# Switch to production and build everything
npm run deploy:prod
```

### Method 2: Docker Deployment

```powershell
# Build and start with Docker
npm run docker:build
npm run docker:up

# Or use docker-compose directly
docker-compose up --build
```

### Method 3: Manual Production Build

```powershell
# Switch to production environment
.\switch-env.ps1 -env production

# Build client
cd bazaar-client
npm run build

# The built files will be in bazaar-client/build/
# Deploy these files to your web server

# Run server in production mode
cd ../bazaar-server
npm run prod
```

## 🔌 API Endpoints

### Authentication
- `GET /auth/discord` - Initiate Discord OAuth
- `GET /auth/discord/callback` - Discord OAuth callback
- `GET /auth/discord/me` - Get current user info
- `GET /is-admin` - Check admin status

### Listings
- `GET /listings` - Get all listings
- `POST /listings` - Create new listing (authenticated)
- `PUT /listings/:id` - Update listing (authenticated)
- `DELETE /listings/:id` - Delete listing (authenticated)

### Items API
- `GET /api/items` - Get all items
- `GET /api/items/search` - Search items with filters
- `GET /api/items/:itemName` - Get specific item
- `GET /api/items/meta/professions` - Get all professions
- `GET /api/items/meta/episodes` - Get all episodes

### Market Data
- `GET /api/market-stats/:itemName` - Get market statistics
- `GET /api/listings-with-items` - Get enriched listings with item details

### System
- `GET /health` - Health check endpoint
- `GET /api/info` - API information

## 🔐 Discord OAuth Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect URI: `http://localhost:3001/auth/discord/callback` (development)
5. Add redirect URI: `https://yourdomain.com/auth/discord/callback` (production)
6. Copy Client ID and Client Secret to your environment files

## 📊 Database Schema

The application uses SQLite with the following main tables:

### Listings Table
- `id` - Primary key
- `item` - Item name
- `price` - Item price
- `quantity` - Quantity available
- `type` - 'buy' or 'sell'
- `seller` - Seller username
- Combat stats fields (combatCategory, combatLevel, etc.)

### Admins Table
- `id` - Discord user ID (primary key)

## 🧹 Maintenance

```powershell
# Clean all node_modules and build files
npm run clean

# Reinstall all dependencies
npm run install:all

# Run linting
npm run lint

# Build for production
npm run build
```

## 🐳 Docker Support

The project includes full Docker support with:

- Multi-stage builds for optimization
- Health checks for both services
- Volume persistence for database
- Production-ready configuration

```yaml
# Start with Docker Compose
docker-compose up --build

# Scale services if needed
docker-compose up --scale server=2
```

## 🛡 Security Features

- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **JWT Authentication**: Secure token-based authentication
- **Session Management**: Secure session handling with SQLite store
- **Input Validation**: Server-side input validation and sanitization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Port Already in Use**
```powershell
# Kill processes on ports 3000 and 3001
Stop-Process -Name node -Force
```

**Environment Variables Not Loading**
- Ensure `.env` files are properly copied using `switch-env.ps1`
- Check that all required variables are set

**Database Issues**
- Delete `marketplace.db` to reset database
- Check file permissions in project directory

**Build Failures**
- Run `npm run clean` then `npm run install:all`
- Ensure Node.js version >= 16.0.0

### Getting Help

- Check the [Issues](../../issues) page
- Review the API documentation in `bazaar-server/API-README.md`
- Ensure all environment variables are correctly configured

## 🏷 Version History

- **v1.0.0** - Initial release with full marketplace functionality
- Features Discord OAuth, real-time updates, item database integration
