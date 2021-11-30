const { NEXT_PUBLIC_GA_MEASUREMENT_ID } = process.env;

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url) => {
  (window as any).gtag('config', NEXT_PUBLIC_GA_MEASUREMENT_ID, {
    page_location: url,
  });
};

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const event = ({ action, category, label }) => {
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};
