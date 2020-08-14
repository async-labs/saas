import LRUCache from 'lru-cache';

export default function routesWithCache({ server, app }) {
  const ssrCache = new LRUCache({
    max: 100, // 100 items
    maxAge: 1000 * 60 * 60, // 1hour
  });
  function getCacheKey(req) {
    if (req.user) {
      return `${req.url}${req.user.id}`;
    }
    return `${req.url}`;
  }
  async function renderAndCache(req, res, pagePath, queryParams) {
    const key = getCacheKey(req);
    // If we have a page in the cache, let's serve it
    if (ssrCache.has(key)) {
      res.setHeader('x-cache', 'HIT');
      res.send(ssrCache.get(key));
      return;
    }
    try {
      // If not let's render the page into HTML
      const html = await app.renderToHTML(req, res, pagePath, queryParams);
      // Something is wrong with the request, let's skip the cache
      if (res.statusCode !== 200) {
        res.send(html);
        return;
      }
      // Let's cache this page
      ssrCache.set(key, html);
      res.setHeader('x-cache', 'MISS');
      res.send(html);
    } catch (err) {
      app.renderError(err, req, res, pagePath, queryParams);
    }
  }
  server.get('/', (req, res) => {
    renderAndCache(req, res, '/', {});
  });
}
