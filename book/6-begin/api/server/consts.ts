// Import this module on any other module like so:
// import { IS_DEV } from './consts';
// // or
// import * as CONSTS from './consts';

function get(name: string, required = false, alternateName: string = null): string {
  const val = process.env[name] || null;
  if (!val && required) {
    throw new Error(`${alternateName || name} environment variable is required.`);
  }
  return val;
}

// tslint:disable: max-line-length
export const NODE_ENV = get('NODE_ENV') || 'development';

export const IS_DEV = NODE_ENV !== 'production';

export const PORT_API = +get('PORT') || 8000;

export const PORT_APP = +get('APP_PORT') || 3000;

let urlAPI: string = get('URL_API');
if (!urlAPI) {
  urlAPI = IS_DEV
    ? get('DEVELOPMENT_URL_API') || `http://localhost:${PORT_API}`
    : get('PRODUCTION_URL_API', true, 'URL_API');
}
export const URL_API = urlAPI;

let urlAPP: string = get('URL_APP');
if (!urlAPP) {
  urlAPP = IS_DEV
    ? get('DEVELOPMENT_URL_APP') || `http://localhost:${PORT_APP}`
    : get('PRODUCTION_URL_APP', true, 'URL_APP');
}
export const URL_APP = urlAPP;

let cookieDomain: string = get('COOKIE_DOMAIN');
if (!cookieDomain) {
  cookieDomain = IS_DEV ? get('DEVELOPMENT_COOKIE_DOMAIN') : get('PRODUCTION_COOKIE_DOMAIN');
}
if (!cookieDomain) {
  cookieDomain = IS_DEV ? 'localhost' : '.async-await.com';
}
export const COOKIE_DOMAIN = cookieDomain;

let mongoURL: string = get('MONGO_URL');
if (!mongoURL) {
  mongoURL = IS_DEV ? get('MONGO_URL_TEST', true, 'MONGO_URL') : get('MONGO_URL', true);
}
export const MONGO_URL = mongoURL;

export const SESSION_NAME: string = get('SESSION_NAME') || 'saas.sid';

let sessionSecret: string = get('SESSION_SECRET');
if (!sessionSecret) {
  if (!IS_DEV) {
    throw new Error('SESSION_SECRET environment variable is required.');
  }
  sessionSecret = Math.random()
    .toString(36)
    .substring(2);
}

export const SESSION_SECRET: string = sessionSecret;

export const AMAZON_ACCESSKEYID: string = get('AMAZON_ACCESSKEYID') || get('Amazon_accessKeyId');
export const AMAZON_SECRETACCESSKEY: string =
  get('AMAZON_SECRETACCESSKEY') || get('Amazon_secretAccessKey');

// 7
// export const GOOGLE_CLIENTID: string = get('GOOGLE_CLIENTID') || get('Google_clientID');
// export const GOOGLE_CLIENTSECRET: string = get('GOOGLE_CLIENTSECRET') || get('Google_clientSecret');

// export const MAILCHIMP_API_KEY: string = get('MAILCHIMP_API_KEY');
// export const MAILCHIMP_REGION: string = get('MAILCHIMP_REGION');
// export const MAILCHIMP_SAAS_ALL_LIST_ID: string = get('MAILCHIMP_SAAS_ALL_LIST_ID');

// 8
// export const EMAIL_SUPPORT_FROM_ADDRESS: string = get('EMAIL_SUPPORT_FROM_ADDRESS');

// 11
// export const STRIPE_TEST_SECRETKEY = get('STRIPE_TEST_SECRETKEY') || get('Stripe_Test_SecretKey');
// export const STRIPE_LIVE_SECRETKEY = get('STRIPE_LIVE_SECRETKEY') || get('Stripe_Live_SecretKey');
// export const STRIPE_SECRETKEY = IS_DEV ? STRIPE_TEST_SECRETKEY : STRIPE_LIVE_SECRETKEY;

// export const STRIPE_TEST_PUBLISHABLEKEY = get('STRIPE_TEST_PUBLISHABLEKEY') || get('Stripe_Test_PublishableKey');
// export const STRIPE_LIVE_PUBLISHABLEKEY = get('STRIPE_LIVE_PUBLISHABLEKEY') || get('Stripe_Live_PublishableKey');
// export const STRIPE_PUBLISHABLEKEY = IS_DEV ? STRIPE_TEST_PUBLISHABLEKEY : STRIPE_LIVE_PUBLISHABLEKEY;

// export const STRIPE_TEST_PLANID: string = get('STRIPE_TEST_PLANID') || get('Stripe_Test_PlanId');
// export const STRIPE_LIVE_PLANID: string = get('STRIPE_LIVE_PLANID') || get('Stripe_Live_PlanId');
// export const STRIPE_PLANID = IS_DEV ? STRIPE_TEST_PLANID : STRIPE_LIVE_PLANID;

// export const STRIPE_LIVE_ENDPOINTSECRET: string = get('STRIPE_LIVE_ENDPOINTSECRET') || get('Stripe_Live_EndpointSecret');
