import 'isomorphic-unfetch';

export default async function sendRequestAndGetResponse(path, opts: any = {}) {
  const headers = Object.assign({}, opts.headers || {}, {
    'Content-type': 'application/json; charset=UTF-8',
  });

  const { request } = opts;
  if (request && request.headers && request.headers.cookie) {
    headers.cookie = request.headers.cookie;
  }

  const qs = opts.qs || '';

  const response = await fetch(
    `${process.env.URL_APP}${path}${qs}`,
    Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
  );

  console.log(`${process.env.URL_APP}${path}${qs}`);
  console.log(response.status);
  console.log(response.statusText);

  const text = await response.text();

  if (response.status >= 400) {
    // console.error(text);
    throw new Error(response.status.toString());
  }

  try {
    const data = JSON.parse(text);

    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return text;
    }

    throw err;
  }
}

// import 'isomorphic-unfetch';

// import { makeQueryString } from './makeQueryString';

// export default async function sendRequestAndGetResponse(path, opts: any = {}) {
//   const { sameServer } = opts;

//   const headers = Object.assign(
//     {},
//     opts.headers || {},
//     sameServer
//       ? {}
//       : {
//           'Content-type': 'application/json; charset=UTF-8',
//         },
//   );

//   const { request } = opts;
//   if (request && request.headers && request.headers.cookie) {
//     headers.cookie = request.headers.cookie;
//   }

//   const qs = (opts.qs && `?${makeQueryString(opts.qs)}`) || '';

//   const response = await fetch(
//     sameServer ? `${path}${qs}` : `${process.env.URL_API}${path}${qs}`,
//     Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
//   );

//   const text = await response.text();

//   if (response.status >= 400) {
//     console.error(text);
//     throw new Error(response.statusText);
//   }

//   try {
//     const data = JSON.parse(text);

//     return data;
//   } catch (err) {
//     if (err instanceof SyntaxError) {
//       return text;
//     }

//     throw err;
//   }
// }
