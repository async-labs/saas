import env from '../env';

export default function getApiUrl() {
  const { PRODUCTION_URL_API, DEVELOPMENT_URL_API, NODE_ENV } = env;
  const dev = NODE_ENV !== 'production';
  const ROOT_URL = dev ? DEVELOPMENT_URL_API : PRODUCTION_URL_API;

  return ROOT_URL;
}
