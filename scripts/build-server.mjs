import { build } from 'esbuild';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Build the SSR entry for server rendering
await build({
  entryPoints: ['src/client/entry-server.tsx'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'dist/server/entry-server.js',
  external: [
    'react',
    'react-dom',
    'react-dom/server',
    'react-router-dom',
    'react-router-dom/server.js',
  ],
  minify: false,
  sourcemap: true,
  logLevel: 'info',
});

// Build the main server
await build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'dist/index.js',
  external: [
    'vite',
    '@vitejs/plugin-react',
    'express',
    'compression',
    'serve-static',
    'node-cron',
    'pg',
    'openai',
    'sharp',
    'nodemailer',
    'react',
    'react-dom',
    'react-router-dom',
  ],
  banner: {
    js: `import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);`
  },
  minify: false,
  sourcemap: true,
  logLevel: 'info',
});

console.log('[build-server] dist/index.js and dist/server/entry-server.js built');
