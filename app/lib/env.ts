
function withDefaults(env) {
  const { NODE_ENV, PORT, GA_TRACKING_ID, URL_APP, URL_API, StripePublishableKey,
    BUCKET_FOR_POSTS, BUCKET_FOR_TEAM_AVATARS, LAMBDA_API_ENDPOINT } = env;

  return {
    NODE_ENV: NODE_ENV || 'development',
    PORT: PORT || 3000,
    GA_TRACKING_ID,
    URL_APP: URL_APP || 'http://localhost:3000',
    URL_API: URL_API || 'http://localhost:8000',
    StripePublishableKey, BUCKET_FOR_POSTS, BUCKET_FOR_TEAM_AVATARS, LAMBDA_API_ENDPOINT,
  };
}
export default (typeof window !== 'undefined' ? (window as any).__ENV__ : withDefaults(process.env));
