import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";

import type { ProgressLoaderProps } from "~/types";

export const HelpLink = () => {
  const { t } = useTranslation();

  const { documentName } = useLoaderData<ProgressLoaderProps>();

  return (
    <div className="govuk-!-margin-bottom-6 govuk-!-margin-top-8" data-testid="help-section">
      <hr className="horizontal-line" />
      <h2 className="govuk-heading-l" data-test-id="get-help-heading">
        {t("getHelpHeading")}
      </h2>
      <p className="govuk-body" data-test-id="get-help-body">
        {t("getHelpBody", { documentName })}
      </p>
      <p className="govuk-body">
        <span data-test-id="get-help-phone">{t("getHelpPhone")}</span>
        <br />
        <span data-test-id="get-help-hours"> {t("getHelpHours")}</span>
      </p>
      <p className="govuk-body">
        <a data-test-id="call-charges-link" className="govuk-link" href="https://www.gov.uk/call-charges">
          {t("callChargesText")}
        </a>
      </p>
      <p className="govuk-body" data-test-id="get-help-guidance">
        {t("getHelpReadGuidance")}&nbsp;
        <a
          data-test-id="exporting-link"
          className="govuk-link"
          href="https://www.gov.uk/guidance/exporting-or-moving-fish-from-the-uk#get-help-with-fish-export-documents"
        >
          {t("getHelpMovingFish")}&nbsp;
          {t("commonHelpLinkOpenInNewTab")}
        </a>
      </p>
    </div>
  );
};
