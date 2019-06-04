// Import this module on any other module like so:
// import { IS_DEV } from './consts';

// function required(name: string): any {
//   throw new Error(`ENV variable ${name} is required.`);
// }

function get(name: string): string {
  return process.env[name] || null;
}

const env: string = get('NODE_ENV') || 'development';
export const NODE_ENV = env;

const dev: boolean = env !== 'production';
export const IS_DEV = dev;

const port: number = +get('PORT') || 8000;
export const PORT_API = port;

const portAPP: number = +get('APP_PORT') || 3000;
export const PORT_APP = portAPP;

let urlAPI: string = get('URL_API');
if (!urlAPI) {
  urlAPI = dev ? get('DEVELOPMENT_URL_API') || `http://localhost:${port}` : get('PRODUCTION_URL_API');
}
export const URL_API = urlAPI;

let urlAPP: string = get('URL_APP');
if (!urlAPP) {
  urlAPP = dev ? get('DEVELOPMENT_URL_APP') || `http://localhost:${portAPP}` : get('PRODUCTION_URL_APP');
}
export const URL_APP = urlAPP;

let cookieDomain: string = get('COOKIE_DOMAIN');
if (!cookieDomain) {
  cookieDomain = dev ? get('DEVELOPMENT_COOKIE_DOMAIN') : get('PRODUCTION_COOKIE_DOMAIN');
}
if (!cookieDomain) {
  cookieDomain = dev ? 'localhost' : '.async-await.com';
}
export const COOKIE_DOMAIN = cookieDomain;

let mongoURL: string = get('MONGO_URL');
if (!mongoURL) {
  mongoURL = dev ? get('MONGO_URL_TEST') : get('MONGO_URL');
}
export const MONGO_URL = mongoURL;

export const SESSION_NAME: string = get('SESSION_NAME') || 'saas.sid';
export const SESSION_SECRET: string = get('SESSION_SECRET');

export const GOOGLE_CLIENTID: string = get('GOOGLE_CLIENTID') || get('Google_clientID');
export const GOOGLE_CLIENTSECRET: string = get('GOOGLE_CLIENTSECRET') || get('Google_clientSecret');

export const AMAZON_ACCESSKEYID: string = get('AMAZON_ACCESSKEYID') || get('Amazon_accessKeyId');
export const AMAZON_SECRETACCESSKEY: string = get('AMAZON_SECRETACCESSKEY') || get('Amazon_secretAccessKey');

export const EMAIL_SUPPORT_FROM_ADDRESS: string = get('EMAIL_SUPPORT_FROM_ADDRESS');

export const MAILCHIMP_API_KEY: string = get('MAILCHIMP_API_KEY');
export const MAILCHIMP_REGION: string = get('MAILCHIMP_REGION');
export const MAILCHIMP_SAAS_ALL_LIST_ID: string = get('MAILCHIMP_SAAS_ALL_LIST_ID');

const stripeTestSecretKey = get('STRIPE_TEST_SECRETKEY') || get('Stripe_Test_SecretKey');
const stripeLiveSecretKey = get('STRIPE_LIVE_SECRETKEY') || get('Stripe_Live_SecretKey');
export const STRIPE_SECRETKEY = dev ? stripeTestSecretKey : stripeLiveSecretKey;
export const STRIPE_TEST_SECRETKEY = stripeTestSecretKey;
export const STRIPE_LIVE_SECRETKEY = stripeLiveSecretKey;

const stripeTestPubKey = get('STRIPE_TEST_PUBLISHABLEKEY') || get('Stripe_Test_PublishableKey');
const stripeLivePubKey = get('STRIPE_LIVE_PUBLISHABLEKEY') || get('Stripe_Live_PublishableKey');
export const STRIPE_PUBLISHABLEKEY = dev ? stripeTestPubKey : stripeLivePubKey;
export const STRIPE_TEST_PUBLISHABLEKEY = stripeTestPubKey;
export const STRIPE_LIVE_PUBLISHABLEKEY = stripeLivePubKey;

const stripeTestPlanId = get('STRIPE_TEST_PLANID') || get('Stripe_Test_PlanId');
const stripeLivePlanId = get('STRIPE_LIVE_PLANID') || get('Stripe_Live_PlanId');
export const STRIPE_PLANID = dev ? stripeTestPlanId : stripeLivePlanId;
export const STRIPE_TEST_PLANID: string = stripeTestPlanId;
export const STRIPE_LIVE_PLANID: string = stripeLivePlanId;

export const STRIPE_LIVE_ENDPOINTSECRET: string = get('STRIPE_LIVE_ENDPOINTSECRET')
  || get('Stripe_Live_EndpointSecret');
