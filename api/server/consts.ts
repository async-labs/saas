// Import this module on any other module like so:
// import { IS_DEV } from './consts';

function required(name: string): any {
  throw new Error(`ENV variable ${name} is required.`);
}

const env = process.env;

export const IS_DEV: boolean = env.NODE_ENV !== 'production';

export const PORT_API: number = +env.PORT || 8000;

export const PORT_APP: number = +env.APP_PORT || 3000;

export const URL_API: string = env.URL_API
  || (IS_DEV ? (env.DEVELOPMENT_URL_API || `http://localhost:${PORT_API}`) : env.PRODUCTION_URL_API)
  || required('URL_API') || '';

export const URL_APP: string = env.URL_APP
  || IS_DEV ? (env.DEVELOPMENT_URL_APP || `http://localhost:${PORT_APP}`) : env.PRODUCTION_URL_APP
  || required('URL_APP') || '';

export const COOKIE_DOMAIN: string = env.COOKIE_DOMAIN
  || IS_DEV ? env.DEVELOPMENT_COOKIE_DOMAIN : env.PRODUCTION_COOKIE_DOMAIN
    || IS_DEV ? 'localhost' : '.async-await.com';

export const MONGO_URL: string = env.MONGO_URL
  || IS_DEV ? env.MONGO_URL_TEST : env.MONGO_URL
  || required('MONGO_URL') || '';

export const SESSION_NAME: string = env.SESSION_NAME || 'saas.sid';

export const SESSION_SECRET: string = env.SESSION_SECRET || required('SESSION_SECRET') || '';

export const GOOGLE_CLIENTID: string = env.GOOGLE_CLIENTID || env.Google_clientID || '';
export const GOOGLE_CLIENTSECRET: string = env.GOOGLE_CLIENTSECRET || env.Google_clientSecret || '';

export const AMAZON_ACCESSKEYID: string = env.AMAZON_ACCESSKEYID || env.Amazon_accessKeyId || '';
export const AMAZON_SECRETACCESSKEY: string = env.AMAZON_SECRETACCESSKEY || env.Amazon_secretAccessKey || '';

export const EMAIL_SUPPORT_FROM_ADDRESS: string = env.EMAIL_SUPPORT_FROM_ADDRESS
  || required('EMAIL_SUPPORT_FROM_ADDRESS') || '';

export const MAILCHIMP_API_KEY: string = env.MAILCHIMP_API_KEY || '';
export const MAILCHIMP_REGION: string = env.MAILCHIMP_REGION || '';
export const MAILCHIMP_SAAS_ALL_LIST_ID: string = env.MAILCHIMP_SAAS_ALL_LIST_ID || '';

export const STRIPE_TEST_SECRETKEY: string = env.STRIPE_TEST_SECRETKEY || env.Stripe_Test_SecretKey || '';
export const STRIPE_LIVE_SECRETKEY: string = env.STRIPE_LIVE_SECRETKEY || env.Stripe_Live_SecretKey || '';
export const STRIPE_SECRETKEY: string = IS_DEV ? STRIPE_TEST_SECRETKEY : STRIPE_LIVE_SECRETKEY;

export const STRIPE_TEST_PUBLISHABLEKEY: string = env.STRIPE_TEST_PUBLISHABLEKEY
  || env.Stripe_Test_PublishableKey || '';
export const STRIPE_LIVE_PUBLISHABLEKEY: string = env.STRIPE_LIVE_PUBLISHABLEKEY
  || env.Stripe_Live_PublishableKey || '';
export const STRIPE_PUBLISHABLEKEY: string = IS_DEV ? STRIPE_TEST_PUBLISHABLEKEY : STRIPE_LIVE_PUBLISHABLEKEY;

export const STRIPE_TEST_PLANID: string = env.STRIPE_TEST_PLANID || env.Stripe_Test_PlanId || '';
export const STRIPE_LIVE_PLANID: string = env.STRIPE_LIVE_PLANID || env.Stripe_Live_PlanId || '';
export const STRIPE_PLANID: string = IS_DEV ? STRIPE_TEST_PLANID : STRIPE_LIVE_PLANID;

export const STRIPE_LIVE_ENDPOINTSECRET: string = env.STRIPE_LIVE_ENDPOINTSECRET
  || env.Stripe_Live_EndpointSecret || '';
