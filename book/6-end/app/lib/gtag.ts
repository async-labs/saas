import { GA_TRACKING_ID } from './consts';

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  if (!GA_TRACKING_ID) {
    return;
  }
  // eslint-disable-next-line
  (window as any).gtag('config', GA_TRACKING_ID, {
    // eslint-disable-next-line
    page_location: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label, value }) => {
  if (!GA_TRACKING_ID) {
    return;
  }

  // eslint-disable-next-line
  (window as any).gtag('event', action, {
    // eslint-disable-next-line
    event_category: category,
    // eslint-disable-next-line
    event_label: label,
    value,
  });
};
