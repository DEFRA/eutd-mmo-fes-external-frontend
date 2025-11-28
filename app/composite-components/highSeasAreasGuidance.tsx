import { Details } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";

export const HighSeasAreasGuidance = () => {
  const { t } = useTranslation(["directLandings"]);

  return (
    <Details
      summary={t("ccAddLandingHSAGuidanceLabel")}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
    >
      <div>
        <p>{t("ccAddLandingHSAGuidanceDesc1Content")}</p>
        <a
          href="https://www.gov.uk/government/publications/eu-iuu-regulation-2026-changes-guidance/fishing-area#high-seas"
          className="govuk-link govuk-link--no-visited-state"
          target="_blank"
          rel="noreferrer noopener"
        >
          {t("ccAddLandingHSAGuidanceDesc2Link")}
        </a>
      </div>
    </Details>
  );
};
