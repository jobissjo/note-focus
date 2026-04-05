import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

type PublicItem = {
  id: string;
  slug?: string;
  updatedAt?: string;
};

/**
 * Generate sitemap.xml dynamically so public detail pages (notes, stories, journals)
 * are always included. Static pages stay hard-coded; dynamic pages are fetched
 * from the public API. Fail-safe: if the API call fails, we still return the static
 * sitemap so crawlers aren’t blocked.
 */
app.get('/sitemap.xml', async (_req, res) => {
  const webBase = process.env['PUBLIC_WEB_BASE_URL'] || 'https://note-focus.vercel.app';
  const apiBase = process.env['PUBLIC_API_BASE_URL'] || 'https://note-taking-1-qsnb.onrender.com/api';

  const today = new Date().toISOString().slice(0, 10);

  const staticUrls = [
    { loc: `${webBase}/`, changefreq: 'weekly', priority: '1.0', lastmod: today },
    { loc: `${webBase}/auth/login`, changefreq: 'monthly', priority: '0.5', lastmod: today },
    { loc: `${webBase}/auth/register`, changefreq: 'monthly', priority: '0.8' , },
    { loc: `${webBase}/public/journals`, changefreq: 'weekly', priority: '0.6', lastmod: today  },
    { loc: `${webBase}/public/stories`, changefreq: 'weekly', priority: '0.6' , lastmod: today },
    { loc: `${webBase}/public/notes`, changefreq: 'weekly', priority: '0.6', lastmod: today  },
  ];

  async function fetchPublicList(path: string): Promise<PublicItem[]> {
    try {
      const response = await fetch(`${apiBase}${path}`);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      return (await response.json()) as PublicItem[];
    } catch (error) {
      console.error(`[sitemap] fetch ${path} failed:`, error);
      return [];
    }
  }

  const [notes, stories, journals] = await Promise.all([
    fetchPublicList('/public/notes'),
    fetchPublicList('/public/stories'),
    fetchPublicList('/public/journals'),
  ]);

  const dynamicUrls = [
    ...notes.map((item) => ({
      loc: `${webBase}/public/notes/${item.slug || item.id}`,
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: item.updatedAt ?? today,
    })),
    ...stories.map((item) => ({
      loc: `${webBase}/public/stories/${item.slug || item.id}`,
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: item.updatedAt ?? today,
    })),
    ...journals.map((item) => ({
      loc: `${webBase}/public/journals/${item.slug || item.id}`,
      changefreq: 'monthly',
      priority: '0.5',
      lastmod: item.updatedAt ?? today,
    })),
  ];

  const allUrls = [...staticUrls, ...dynamicUrls];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allUrls.map(
      (u) =>
        `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    ),
    '</urlset>',
  ].join('\n');

  res.header('Content-Type', 'application/xml').send(xml);
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
