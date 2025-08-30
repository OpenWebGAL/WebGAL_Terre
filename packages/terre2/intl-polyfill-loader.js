module.exports = function (source) {
  const polyfillCode = `
    global.IntlPolyfill = require('intl/lib/core');
    require('intl/locale-data/jsonp/en');
    require('intl/locale-data/jsonp/zh');
    require('intl/locale-data/jsonp/ja');
    global.Intl = global.IntlPolyfill;
    global.IntlPolyfill.__applyLocaleSensitivePrototypes();
    require('date-time-format-timezone/build/src/date-time-format-timezone-golden-zones-no-locale');
  `;

  return polyfillCode + source;
};