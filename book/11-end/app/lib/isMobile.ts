const mobileRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

export function isMobile(opts) {
  if (!opts) {
    opts = {};
  }

  let ua = opts.ua;

  if (!ua && typeof navigator !== 'undefined') {
    ua = navigator.userAgent;
  }

  if (!ua && opts.req && opts.req.headers && typeof opts.req.headers['user-agent'] === 'string') {
    ua = opts.req.headers['user-agent'];
    // console.log(ua);
  }

  if (typeof ua !== 'string') {
    return false;
  }

  return mobileRE.test(ua);
}
