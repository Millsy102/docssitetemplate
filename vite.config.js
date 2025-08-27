// Minimal Vite config to avoid module resolution issues
export default {
  plugins: [],
  base: process.env.NODE_ENV === 'production' ? '/docssitetemplate/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
}
