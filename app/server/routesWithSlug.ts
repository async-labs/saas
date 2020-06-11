export default function routesWithSlug({ server, app }) {
  server.get('/team/:teamSlug/discussions/:discussionSlug', (req, res) => {
    const { teamSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug, discussionSlug });
  });

  server.get('/team/:teamSlug/discussions', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug });
  });

  server.get('/team/:teamSlug/team-settings', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/team-settings', { teamSlug });
  });

  server.get('/team/:teamSlug/billing', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/billing', { teamSlug, ...(req.query || {}) });
  });

  server.get('/invitation/:teamSlug', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/invitation', { teamSlug });
  });
}
