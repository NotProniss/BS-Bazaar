// Utility to join API URLs safely (prevents double slashes)
export function joinApiUrl(base, path) {
  if (!base) return path;
  if (!path) return base;
  return base.replace(/\/+$/, '') + '/' + path.replace(/^\/+/, '');
}

const config = {
  API_URL: process.env.REACT_APP_API_URL || "/api",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
};

export default config;
