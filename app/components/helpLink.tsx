import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";

import type { ProgressLoaderProps } from "~/types";

export const HelpLink = () => {
  const { t } = useTranslation();

  const { documentNumber } = useLoaderData<ProgressLoaderProps>();

  return (
    <div className="govuk-!-margin-bottom-6 govuk-!-margin-top-8 govuk-!-margin-bottom-6" data-testid="help-section">
      <hr className="horizontal-line" />
      <h2 className="govuk-heading-l">{t("getHelpHeading")}</h2>
      <p className="govuk-body">{t("getHelpBody", { documentNumber })}</p>
      <p className="govuk-body">
        {t("getHelpPhone")}
        <br />
        {t("getHelpHours")}
      </p>
      <p className="govuk-body">
        <a data-test-id="call-charges-link" className="govuk-link" href="https://www.gov.uk/call-charges">
          {t("callChargesText")}
        </a>
      </p>
      <p className="govuk-body">
        {t("getHelpReadGuidance")} &nbsp;
        <a data-test-id="call-charges-link" className="govuk-link" href="https://www.gov.uk/call-charges">
          {t("getHelpMovingFish")} &nbsp;
          {t("commonHelpLinkOpenInNewTab")}
        </a>
      </p>
    </div>
  );
};
