import * as React from "react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./languageToggle";
import type { ILanguageToggleProps } from "~/types";

export const Banner = ({ locale, languages, params }: ILanguageToggleProps) => {
  const { t } = useTranslation("banner");

  return (
    <div className="govuk-phase-banner banner banner-container">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">{t("tag")}</strong>
        <span
          className="govuk-phase-banner__text"
          data-testid="banner-text"
          data-href="https://defragroup.eu.qualtrics.com/jfe/form/SV_3q6Yrf53I3bdoCa"
        >
          <span>{t("bannerThisIsANewService")} </span>
          <a
            className="govuk-link"
            href="https://defragroup.eu.qualtrics.com/jfe/form/SV_3q6Yrf53I3bdoCa"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("bannerFeedback")}
            <span className="govuk-visually-hidden">{t("bannerOpensInANewTab")}</span>
          </a>
          <span> {t("bannerWillHelpUs")}</span>
        </span>
      </p>
      <LanguageToggle languages={languages} locale={locale} params={params} />
    </div>
  );
};
