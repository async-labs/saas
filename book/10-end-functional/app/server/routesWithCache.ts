import LRUCache from 'lru-cache';

export default function routesWithCache({ server, app }) {
  const ssrCache = new LRUCache({
    max: 100, // 100 items
    maxAge: 1000 * 60 * 60, // 1 hour
  });

  function getCacheKey(req) {
    if (req.user) {
      return `${req.url}${req.user.id}`;
    }
    return `${req.url}`;
  }

  async function renderAndCache(req, res, pagePath, queryParams) {
    const key = getCacheKey(req);

    if (ssrCache.has(key)) {
      res.setHeader('x-cache', 'HIT');
      res.send(ssrCache.get(key));
      return;
    }

    try {
      const renderedPage = await app.renderToHTML(req, res, pagePath, queryParams);

      ssrCache.set(key, renderedPage);

      res.send(renderedPage);
    } catch (err) {
      app.renderError(err, req, res, pagePath, queryParams);
    }
  }

  server.get('/login-cached', (req, res) => {
    renderAndCache(req, res, '/login-cached', {});
  });
}
