export default function routesWithSlug({ server, app }) {
  server.get('/invitation/:teamSlug', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/invitation', { teamSlug });
  });

  server.get('/team/:teamSlug/t/:topicSlug/:discussionSlug', (req, res) => {
    const { teamSlug, topicSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussions/detail', { teamSlug, topicSlug, discussionSlug });
  });

  server.get('/team/:teamSlug/t/:topicSlug', (req, res) => {
    const { teamSlug, topicSlug } = req.params;
    app.render(req, res, '/topics/detail', { teamSlug, topicSlug });
  });

  server.get('/team/:teamSlug/settings/team-members', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings/team-members', { teamSlug });
  });

  server.get('/team/:teamSlug/settings/team-billing', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings/team-billing', { teamSlug });
  });

  server.get('/team/:teamSlug/settings/team-constraints', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings/team-constraints', { teamSlug });
  });

  server.get('/team/:teamSlug/settings/team-profile', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings/team-profile', { teamSlug });
  });
}
