const { createSecureHeaders } = require('next-secure-headers');
const webpack = require('webpack');

module.exports = {
  async headers () {
    return [{
      source: '/(.*)',
      headers: createSecureHeaders({
        /*contentSecurityPolicy: {
          directives: {
            defaultSrc: "'self'",
            styleSrc: ["'self'", "https://fonts.googleapis.com"]
          }
        },*/
        referrerPolicy: 'same-origin'
      })
    }]
  },
  api: {
    externalResolver: true
  },
  webpack: (config, options) => {
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
      resource.request = resource.request.replace(/^node:/, "");
    }));
    return config;
  }
};
