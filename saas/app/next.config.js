const withTM = require('next-transpile-modules')([ // eslint-disable-line
  '@mui/material',
  '@mui/icons-material',
]);

module.exports = withTM({
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  modularizeImports: {
    '@mui/material/?(((\\w*)?/?)*)': {
      transform: '@mui/material/{{ matches.[1] }}/{{member}}',
    },
    '@mui/icons-material/?(((\\w*)?/?)*)': {
      transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}',
    },
  },
});
