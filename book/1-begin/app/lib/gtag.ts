// 4
// import { GA_TRACKING_ID } from './consts';

// // https://developers.google.com/analytics/devguides/collection/gtagjs/pages
// export const pageview = url => {
//   if (!GA_TRACKING_ID) { return; }
//   (window as any).gtag('config', GA_TRACKING_ID, {
//     page_location: url,
//   });
// };

// // https://developers.google.com/analytics/devguides/collection/gtagjs/events
// export const event = ({ action, category, label, value }) => {
//   if (!GA_TRACKING_ID) { return; }
//   (window as any).gtag('event', action, {
//     event_category: category,
//     event_label: label,
//     value,
//   });
// };
