import env from '../env';

export default function getApiUrl() {
  const { PRODUCTION_URL_API, DEVELOPMENT_URL_API, NODE_ENV } = env;
  const dev = NODE_ENV !== 'production';
  return dev ? (DEVELOPMENT_URL_API || 'http://localhost:8000') : PRODUCTION_URL_API;
}
