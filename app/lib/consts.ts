// Import this module on any other module like so:
// import { IS_DEV } from './consts';

// Make it isomorphic
const env = (typeof window !== 'undefined' ? (window as any).__ENV__ : process.env);

function get(name: string): string {
  return env[name] || null;
}

const mode: string = get('NODE_ENV') || 'development';
export const NODE_ENV = mode;

const dev: boolean = env !== 'production';
export const IS_DEV = dev;

const portAPP: number = +get('PORT') || 3000;
export const PORT_APP = portAPP;

const portAPI: number = +get('APP_PORT') || 8000;
export const PORT_API = portAPI;

let urlAPI: string = get('URL_API');
if (!urlAPI) {
  urlAPI = dev ? get('DEVELOPMENT_URL_API') || `http://localhost:${portAPI}` : get('PRODUCTION_URL_API');
}
export const URL_API = urlAPI;

let urlAPP: string = get('URL_APP');
if (!urlAPP) {
  urlAPP = dev ? get('DEVELOPMENT_URL_APP') || `http://localhost:${portAPP}` : get('PRODUCTION_URL_APP');
}
export const URL_APP = urlAPP;

export const GA_TRACKING_ID: string = get('GA_TRACKING_ID');
export const STRIPEPUBLISHABLEKEY: string = get('STRIPEPUBLISHABLEKEY') || get('StripePublishableKey');
export const BUCKET_FOR_POSTS: string = get('BUCKET_FOR_POSTS');
export const BUCKET_FOR_TEAM_AVATARS: string = get('BUCKET_FOR_TEAM_AVATARS');
export const LAMBDA_API_ENDPOINT: string = get('LAMBDA_API_ENDPOINT');
