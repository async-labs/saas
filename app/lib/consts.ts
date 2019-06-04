// Import this module on any other module like so:
// import { IS_DEV } from './consts';

function required(name: string): any {
  throw new Error(`ENV variable ${name} is required.`);
}

// Make it isomorphic
const env = (typeof window !== 'undefined' ? (window as any).__ENV__ : process.env);

export const IS_DEV: boolean = env.NODE_ENV !== 'production';

export const PORT_APP: number = +env.PORT || 3000;

export const PORT_API: number = +env.PORT_API || 8000;

export const URL_API: string = env.URL_API
  || (IS_DEV ? (env.DEVELOPMENT_URL_API || `http://localhost:${PORT_API}`) : env.PRODUCTION_URL_API)
  || required('URL_API') || '';

export const URL_APP: string = env.URL_APP
  || IS_DEV ? (env.DEVELOPMENT_URL_APP || `http://localhost:${PORT_APP}`) : env.PRODUCTION_URL_APP
  || required('URL_APP') || '';

export const GA_TRACKING_ID: string = env.GA_TRACKING_ID || '';
export const STRIPEPUBLISHABLEKEY: string = env.STRIPEPUBLISHABLEKEY || env.StripePublishableKey || '';
export const BUCKET_FOR_POSTS: string = env.BUCKET_FOR_POSTS || '';
export const BUCKET_FOR_TEAM_AVATARS: string = env.BUCKET_FOR_TEAM_AVATARS || '';
export const LAMBDA_API_ENDPOINT: string = env.LAMBDA_API_ENDPOINT || '';
