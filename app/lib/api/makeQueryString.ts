function makeQueryString(params) {
  const query = Object.keys(params)
    .filter((k) => !!params[k])
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');

  return query;
}

export { makeQueryString };
