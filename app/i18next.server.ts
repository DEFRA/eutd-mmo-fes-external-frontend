import Backend from "i18next-fs-backend";
import path from "node:path";
import { RemixI18Next } from "remix-i18next/server";
import { initLanguages } from "./i18n";
import { i18nextCookie } from "./cookies.server";

const { fallbackLng, supportedLngs } = initLanguages();

const i18next = new RemixI18Next({
  detection: { fallbackLanguage: fallbackLng, supportedLanguages: supportedLngs, cookie: i18nextCookie },
  // This is the configuration for i18next used
  // when translating messages server-side only
  i18next: {
    backend: {
      loadPath: path.resolve("./public/locales-v2/{{lng}}/{{ns}}.json"),
    },
  },
  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the file system
  // Tip: You could pass `resources` to the `i18next` configuration and avoid a backend here
  plugins: [Backend],
});

export default i18next;
