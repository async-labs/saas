// 7
// import * as request from 'request';

// import {
//   MAILCHIMP_API_KEY, MAILCHIMP_REGION, MAILCHIMP_SAAS_ALL_LIST_ID,
// } from './consts';

// const LIST_IDS = {
//   signups: MAILCHIMP_SAAS_ALL_LIST_ID,
// };

// function callAPI({ path, method, data }) {
//   const ROOT_URI = `https://${MAILCHIMP_REGION}.api.mailchimp.com/3.0`;
//   // For us, MAILCHIMP_REGION has value of 'us17'.

//   const API_KEY = MAILCHIMP_API_KEY;

//   return new Promise((resolve, reject) => {
//     request.post(
//       {
//         method,
//         uri: `${ROOT_URI}${path}`,
//         headers: {
//           Accept: 'application/json',
//           Authorization: `Basic ${Buffer.from(`apikey:${API_KEY}`).toString('base64')}`,
//         },
//         json: true,
//         body: data,
//       },
//       (err, body) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(body);
//         }
//       },
//     );
//   });
// }

// async function subscribe({ email, listName }) {
//   const data = {
//     // eslint-disable-next-line
    email_address: email,
//     status: 'subscribed',
//   };

//   const path = `/lists/${LIST_IDS[listName]}/members/`;

//   await callAPI({ path, method: 'POST', data });
// }

// export { subscribe };
