// Import this module on any other module like so:
// import { IS_DEV } from './consts';

// tslint:disable: max-line-length
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const IS_DEV = NODE_ENV !== 'production';

// in production at AWS EB, PORT_APP is 3000, which is wrong
// setting PORT_APP to 8081 for production so nginx works as expected
export const PORT_APP = IS_DEV ? 3000 : 8081;

export const PORT_API = +process.env.API_PORT || +process.env.PORT_API || 8000;

let urlAPI: string = process.env.URL_API;
if (!urlAPI) {
  urlAPI = IS_DEV
    ? process.env.DEVELOPMENT_URL_API || `http://localhost:${PORT_API}`
    : process.env.PRODUCTION_URL_API;
}
export const URL_API = urlAPI;

let urlAPP: string = process.env.URL_APP;
if (!urlAPP) {
  urlAPP = IS_DEV
    ? process.env.DEVELOPMENT_URL_APP || `http://localhost:${PORT_APP}`
    : process.env.PRODUCTION_URL_APP;
}
export const URL_APP = urlAPP;

export const GA_TRACKING_ID: string = process.env.GA_TRACKING_ID;
export const STRIPEPUBLISHABLEKEY: string =
  process.env.STRIPEPUBLISHABLEKEY || process.env.StripePublishableKey;
export const BUCKET_FOR_POSTS: string = process.env.BUCKET_FOR_POSTS;
export const BUCKET_FOR_TEAM_AVATARS: string = process.env.BUCKET_FOR_TEAM_AVATARS;
export const LAMBDA_API_ENDPOINT: string = process.env.LAMBDA_API_ENDPOINT;
