import adminApi from './admin';

export default function api(server) {
  server.use('/api/v1/admin', adminApi);
}
