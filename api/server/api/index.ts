import teamLeaderApi from './team-leader';
import teamMemberApi from './team-member';
import publicApi from './public';
import adminApi from './admin';

export default function api(server) {
  server.use('/api/v1/public', publicApi);
  server.use('/api/v1/team-leader', teamLeaderApi);
  server.use('/api/v1/team-member', teamMemberApi);
  server.use('/api/v1/admin', adminApi);
}
