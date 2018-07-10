import env from './env';

const { GA_TRACKING_ID } = env;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = url => {
  (window as any).gtag('config', GA_TRACKING_ID, {
    page_location: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};
