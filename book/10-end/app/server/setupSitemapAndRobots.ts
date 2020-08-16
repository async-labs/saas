import { SitemapStream, streamToPromise } from 'sitemap';
import path from 'path';
import zlib from 'zlib';

const dev = process.env.NODE_ENV !== 'production';

export default function setupSitemapAndRobots({ server }) {
  let sitemap;

  server.get('/sitemap.xml', async (_, res) => {
    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    if (sitemap) {
      res.send(sitemap);
      return;
    }

    try {
      const smStream = new SitemapStream({
        hostname: dev ? process.env.URL_APP : process.env.PRODUCTION_URL_APP,
      });
      const gzip = zlib.createGzip();

      smStream.write({
        url: '/login',
        changefreq: 'daily',
        priority: 1,
      });

      streamToPromise(smStream.pipe(gzip)).then((sm) => (sitemap = sm));

      smStream.end();

      smStream
        .pipe(gzip)
        .pipe(res)
        .on('error', (err) => {
          throw err;
        });
    } catch (err) {
      console.error(err);
      res.status(500).end();
    }
  });

  server.get('/robots.txt', (_, res) => {
    res.sendFile(path.join(__dirname, '../static', 'robots.txt'));
  });
}
