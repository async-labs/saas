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
  const headers = Object.assign({}, opts.headers || {}, {
    'Content-type': 'application/json; charset=UTF-8',
  });

  const qs = (opts.qs && `?${makeQueryString(opts.qs)}`) || '';

  const response = await fetch(
    `${getRootUrl()}${path}${qs}`,
    Object.assign({ method: 'POST', credentials: 'include' }, opts, { headers }),
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
