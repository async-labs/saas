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

export const MONGO_URL: string = env.MONGO_URL
  || IS_DEV ? env.MONGO_URL_TEST : env.MONGO_URL
  || required('MONGO_URL') || '';

export const COOKIE_DOMAIN: string = env.COOKIE_DOMAIN
  || IS_DEV ? env.DEVELOPMENT_COOKIE_DOMAIN : env.PRODUCTION_COOKIE_DOMAIN
    || IS_DEV ? 'localhost' : '.async-await.com';

export const SESSION_NAME: string = env.SESSION_NAME || 'saas.sid';

export const SESSION_SECRET: string = env.SESSION_SECRET || required('SESSION_SECRET') || '';

export const EMAIL_SUPPORT_FROM_ADDRESS: string = env.EMAIL_SUPPORT_FROM_ADDRESS
  || required('EMAIL_SUPPORT_FROM_ADDRESS') || '';
