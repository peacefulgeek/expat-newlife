import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const isDev = process.env.NODE_ENV !== 'production';
const PORT = parseInt(process.env.PORT || '10000', 10);

async function createApp() {
  const app = express();

  // ─── Trust proxy (Render / reverse proxy) ───
  app.set('trust proxy', 1);

  // ─── WWW → apex 301 redirect (Section 17) ───
  app.use((req, res, next) => {
    const host = (req.headers.host || '').toLowerCase();
    if (host.startsWith('www.')) {
      const apex = host.slice(4);
      const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
      return res.redirect(301, `${proto}://${apex}${req.originalUrl}`);
    }
    next();
  });

  // ─── Compression ───
  app.use(compression());

  // ─── Routes ───
  const { healthRouter } = await import('./routes/health.js');
  const { articlesRouter } = await import('./routes/articles.js');
  const { sitemapRouter } = await import('./routes/sitemap.js');
  const { robotsRouter } = await import('./routes/robots.js');
  const { llmsRouter } = await import('./routes/llms.js');
  const { assessmentsRouter } = await import('./routes/assessments.js');

  app.use('/health', healthRouter);
  app.use('/sitemap.xml', sitemapRouter);
  app.use('/sitemap-images.xml', (req, res, next) => { req.url = '/images'; sitemapRouter(req, res, next); });
  app.use('/robots.txt', robotsRouter);
  app.use(llmsRouter);
  app.use('/api/articles', articlesRouter);
  app.use('/api/assessments', assessmentsRouter);

  if (isDev) {
    // ─── Vite dev server (dev only) ───
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, `
          <!DOCTYPE html>
          <html lang="en">
            <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
            <body><div id="root"></div><script type="module" src="/src/client/entry-client.tsx"></script></body>
          </html>
        `);
        const { render } = await vite.ssrLoadModule('/src/client/entry-server.tsx');
        const { html: appHtml, head } = await render(url);
        const finalHtml = template
          .replace('</head>', `${head || ''}</head>`)
          .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // ─── Production: serve pre-built client assets ───
    const clientDist = path.resolve(projectRoot, 'dist/client');
    app.use(express.static(clientDist, {
      maxAge: '1y',
      immutable: true,
      index: false,
    }));

    app.use('*', async (req, res, next) => {
      try {
        const { render } = await import('../dist/server/entry-server.js');
        const { injectHead } = await import('./ssrHead.js');
        const url = req.originalUrl;
        const { html: appHtml, head } = await render(url);
        const template = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
${head || ''}
</head>
<body>
<div id="root">${appHtml}</div>
<script type="module" src="/assets/entry-client.js"></script>
</body>
</html>`;
        res.status(200).set({
          'Content-Type': 'text/html',
          'Cache-Control': 'public, max-age=3600',
        }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  return app;
}

createApp().then(app => {
  app.listen(PORT, () => {
    console.log(`[server] Moving Abroad running on port ${PORT} (${isDev ? 'dev' : 'production'})`);
  });
}).catch(err => {
  console.error('[server] Failed to start:', err);
  process.exit(1);
});
