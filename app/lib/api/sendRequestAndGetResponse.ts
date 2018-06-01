import 'isomorphic-unfetch';

import getRootUrl from './getRootUrl';

function makeQueryString(params) {
  const esc = encodeURIComponent;
  const query = Object.keys(params)
    .map(k => `${esc(k)}=${params[k] ? esc(params[k]) : ''}`)
    .join('&');

  return query;
}

export default async function sendRequestAndGetResponse(path, opts: any = {}) {
  const { externalServer } = opts;

  const headers = Object.assign(
    {},
    opts.headers || {},
    externalServer
      ? {}
      : {
          'Content-type': 'application/json; charset=UTF-8',
        },
  );

  const { request } = opts;
  if (request && request.headers && request.headers.cookie) {
    headers.cookie = request.headers.cookie;
  }

  const qs = (opts.qs && `?${makeQueryString(opts.qs)}`) || '';

  const response = await fetch(
    externalServer ? `${path}${qs}` : `${getRootUrl()}${path}${qs}`,
    Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
  );

  const text = await response.text();
  try {
    const data = JSON.parse(text);

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return text;
    }

    throw err;
  }
}
