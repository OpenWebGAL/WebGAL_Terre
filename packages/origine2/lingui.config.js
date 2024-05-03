/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ["en", "zhCn","ja"],
  sourceLocale:"zhCn",
  fallbackLocales:{
    default:'zhCn',
  },
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["src"],
    },
  ],
};
