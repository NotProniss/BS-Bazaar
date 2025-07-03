const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // PostHog analytics proxy to avoid ad blockers in development
  app.use(
    ['/ingest', '/ingest/**'],
    createProxyMiddleware({
      target: 'https://us.i.posthog.com',
      changeOrigin: true,
      secure: true,
      followRedirects: true,
      pathRewrite: {
        '^/ingest': '', // Remove /ingest prefix when forwarding
      },
      onProxyReq: (proxyReq, req, res) => {
        // Set correct headers for PostHog
        proxyReq.setHeader('Host', 'us.i.posthog.com');
        proxyReq.setHeader('Origin', 'https://us.i.posthog.com');
        // Handle config.js and other asset requests
        if (req.url.includes('config.js')) {
          console.log('Proxying PostHog config request:', req.url);
        }
      },
      onError: (err, req, res) => {
        console.error('PostHog proxy error:', err);
        // Return a minimal response for config.js to prevent script loading errors
        if (req.url.includes('config.js')) {
          res.status(200).type('application/javascript').send('window.POSTHOG_CONFIG = {};');
        } else {
          res.status(500).send('PostHog proxy error');
        }
      },
      logLevel: 'warn', // Reduce log noise
    })
  );
};
