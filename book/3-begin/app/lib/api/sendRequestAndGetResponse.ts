// 4
// import 'isomorphic-unfetch';

// // 5
// // import { getStore } from '../store';

// import { makeQueryString } from './makeQueryString';

// import { URL_API } from '../consts';

// // eslint-disable-next-line
export default async function sendRequestAndGetResponse(path, opts: any = {}) {
//   const { externalServer } = opts;

//   const headers = Object.assign(
//     {},
//     opts.headers || {},
//     externalServer
//       ? {}
//       : {
//         'Content-type': 'application/json; charset=UTF-8',
//       },
//   );

//   const { request } = opts;
//   if (request && request.headers && request.headers.cookie) {
//     headers.cookie = request.headers.cookie;
//   }

//   const qs = (opts.qs && `?${makeQueryString(opts.qs)}`) || '';

//   const response = await fetch(
//     externalServer ? `${path}${qs}` : `${URL_API}${path}${qs}`,
//     Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
//   );

//   const text = await response.text();
//   if (response.status >= 400) {
//     console.error(text);
//     throw new Error(response.statusText);
//   }

//   try {
//     const data = JSON.parse(text);

//     // 5
//     // const store = getStore();

//     // if (data.error) {
//     //   if (response.status === 201 && data.error === 'You need to log in.' && !externalServer) {
//     //     if (store && store.currentUser && store.currentUser.isLoggedIn && !store.isServer) {
//     //       store.currentUser.logout();
//     //     }
//     //   }

//     //   throw new Error(data.error);
//     // }

//     // if (store && store.currentUser && !store.currentUser.isLoggedIn && !store.isServer) {
//     //   store.currentUser.login();
//     // }

//     return data;
//   } catch (err) {
//     if (err instanceof SyntaxError) {
//       return text;
//     }

//     throw err;
//   }
// }
