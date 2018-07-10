export default function routesWithSlug({ server, app }) {
  server.get('/team/:teamSlug/d/:discussionSlug', (req, res) => {
    const { teamSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug, discussionSlug });
  });

  server.get('/team/:teamSlug/d', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/discussion', { teamSlug });
  });

  server.get('/team/:teamSlug/settings/team-members', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings/team-members', { teamSlug });
  });

  server.get('/team/:teamSlug/settings/team-billing', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings/team-billing', { teamSlug });
  });

  server.get('/team/:teamSlug/settings/team-profile', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings/team-profile', { teamSlug });
  });

  server.get('/invitation/:teamSlug', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/invitation', { teamSlug });
  });
}
