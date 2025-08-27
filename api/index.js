// Vercel serverless function entry point
const app = require('../_internal/system/src/vercel-server');

// Export the Express app for Vercel
module.exports = app;
