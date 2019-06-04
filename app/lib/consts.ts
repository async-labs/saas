// Import this module on any other module like so:
// import { IS_DEV } from './consts';

// Make it isomorphic
const env = (typeof window !== 'undefined' ? (window as any).__ENV__ : process.env);

function get(name: string, required: boolean = false, alternateName: string = null): string {
  const val = env[name] || null;
  if (!val && required) {
    throw new Error(`${alternateName || name} environment variable is required.`);
  }
  return val;
}

// tslint:disable: max-line-length
export const NODE_ENV = get('NODE_ENV') || 'development';

export const IS_DEV = NODE_ENV !== 'production';

export const PORT_APP = +get('PORT') || 3000;

export const PORT_API = +get('API_PORT') || 8000;

let urlAPI: string = get('URL_API');
if (!urlAPI) {
  urlAPI = IS_DEV ? get('DEVELOPMENT_URL_API') || `http://localhost:${PORT_API}` : get('PRODUCTION_URL_API', true, 'URL_API');
}
export const URL_API = urlAPI;

let urlAPP: string = get('URL_APP');
if (!urlAPP) {
  urlAPP = IS_DEV ? get('DEVELOPMENT_URL_APP') || `http://localhost:${PORT_APP}` : get('PRODUCTION_URL_APP', true, 'URL_APP');
}
export const URL_APP = urlAPP;

export const GA_TRACKING_ID: string = get('GA_TRACKING_ID');
export const STRIPEPUBLISHABLEKEY: string = get('STRIPEPUBLISHABLEKEY') || get('StripePublishableKey');
export const BUCKET_FOR_POSTS: string = get('BUCKET_FOR_POSTS');
export const BUCKET_FOR_TEAM_AVATARS: string = get('BUCKET_FOR_TEAM_AVATARS');
export const LAMBDA_API_ENDPOINT: string = get('LAMBDA_API_ENDPOINT');
