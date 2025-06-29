# Brighter Shores Bazaar: Docker-Only Setup

This project is now set up for Docker-only deployment. All local `node_modules` and build artifacts can be removed from the host. Use Docker Compose for all development, testing, and production runs.

## How to use

1. **Build and start everything:**
   ```sh
   docker-compose up --build -d
   ```
   This will build and start both the backend and frontend containers in the background.

2. **Stop everything:**
   ```sh
   docker-compose down
   ```

3. **View logs:**
   ```sh
   docker-compose logs -f
   ```

4. **Rebuild after code changes:**
   ```sh
   docker-compose up --build -d
   ```

## Cleanup (safe to do on host):
- You can delete all `node_modules` and `build` folders from both `bazaar-client` and `bazaar-server`.
- You do NOT need to run `npm install` or `npm start` on the host.
- All environment variables should be set in `.env` files and referenced in `docker-compose.yml`.

## Notes
- If you add new dependencies, update your `package.json` and re-run `docker-compose up --build -d`.
- For production, ensure your `.env` files use the correct domain and protocol (http/https).

---

**You only need Docker and Docker Compose installed on your server!**
