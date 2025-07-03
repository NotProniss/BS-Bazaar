const config = {
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
}

export default config
