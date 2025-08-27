// Vercel serverless function entry point
// This points to the actual backend system in _internal/system
const app = require('../_internal/system/src/vercel-server');

// Export the Express app for Vercel
module.exports = app;
