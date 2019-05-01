import env from '../env';

export default function getApiUrl() {
  const port = process.env.PORT || 8000;
  const dev = process.env.NODE_ENV !== 'production';
  const { PRODUCTION_URL_API } = env;
  const ROOT_URL = dev ? `http://localhost:${port}` : PRODUCTION_URL_API;

  return ROOT_URL;
}
