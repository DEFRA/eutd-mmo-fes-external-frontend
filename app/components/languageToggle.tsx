import * as React from "react";
import { Link } from "@remix-run/react";
import type { ILanguageToggleProps } from "~/types";

export const LanguageToggle = ({ languages, locale, params }: ILanguageToggleProps) => {
  const queryParams = params?.slice(1);
  const dict: { [key: string]: string } = {};
  const entries = queryParams ? queryParams.split("&") : [];

  entries.forEach((entry: string) => {
    const strs: string[] = entry.split("=");

    for (const key in strs) {
      if (parseInt(key) % 2 == 0 && !dict[strs[key]] && strs[key] !== "lng") {
        dict[strs[key]] = `${strs[key]}=${strs[parseInt(key) + 1]}`;
      }
    }
  });

  const _queryParams = Object.values(dict).join("&");

  return (
    <nav className="govuk-language-select">
      <ul className="govuk-language-select__list">
        {Object.keys(languages).map((key: string) =>
          locale === key ? (
            <li key={key} className="govuk-language-select__list-item" data-testid={languages[key].displayName}>
              <span aria-current="true">{languages[key].displayName}</span>
            </li>
          ) : (
            <li key={key} className="govuk-language-select__list-item" data-testid={languages[key].displayName}>
              <Link
                to={`?lng=${key}${_queryParams ? "&" + _queryParams : ""}`}
                hrefLang={key}
                lang={key}
                rel="alternate"
                className="govuk-link"
                data-journey-click={`link - click:lang-select:${languages[key].displayName}`}
                replace
              >
                <span className="govuk-visually-hidden">{languages[key].description}</span>
                <span aria-hidden="true">{languages[key].displayName}</span>
              </Link>
            </li>
          )
        )}
      </ul>
    </nav>
  );
};
