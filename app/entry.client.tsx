import * as React from "react";
import { HydratedRouter } from "react-router-dom";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next/client";
import { initLanguages } from "./i18n";

// Global BUILD_ID injected by Vite define config
declare const __BUILD_ID__: string;

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(Backend)
  .init({
    ...initLanguages(),
    ns: getInitialNamespaces(),
    backend: {
      // Cache-bust locale JSON URLs with build ID to ensure fresh translations after deploy
      loadPath: `/locales-v2/{{lng}}/{{ns}}.json?v=${__BUILD_ID__}`,
    },
    detection: {
      order: ["htmlTag"],
      caches: [],
    },
  })
  .then(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <HydratedRouter />
      </I18nextProvider>
    );
  });
