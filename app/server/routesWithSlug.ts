export default function routesWithSlug({ server, app }) {
  server.get('/invitation/:teamSlug', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/invitation', { teamSlug });
  });

  server.get('/team/:teamSlug/settings', (req, res) => {
    const { teamSlug } = req.params;
    app.render(req, res, '/settings', { teamSlug });
  });

  server.get('/team/:teamSlug/t/:topicSlug', (req, res) => {
    const { teamSlug, topicSlug } = req.params;
    app.render(req, res, '/topics/detail', { teamSlug, topicSlug });
  });

  server.get('/team/:teamSlug/t/:topicSlug/:discussionSlug', (req, res) => {
    const { teamSlug, topicSlug, discussionSlug } = req.params;
    app.render(req, res, '/discussions/detail', { teamSlug, topicSlug, discussionSlug });
  });
}
