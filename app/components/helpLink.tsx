import { useTranslation } from "react-i18next";

export const HelpLink = () => {
  const { t } = useTranslation("common");
  return (
    <div className="govuk-!-margin-bottom-6 govuk-!-margin-top-8 govuk-!-margin-bottom-6">
      <hr className="horizontal-line" />
      <h2 className="govuk-heading-l">{t("helpLinkNeedHelp")}</h2>
      <a
        data-testid="guidance-on-exporting-fish"
        className="govuk-link"
        href="https://www.gov.uk/guidance/exporting-and-importing-fish-if-theres-no-brexit-deal"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("commonHelpLinkGetHelpExportingFish")}
      >
        {t("commonHelpLinkGetHelpExportingFish")}
        <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
      </a>
      <br />
      <a
        data-testid="eu-2026-changes-guidance"
        rel="noopener noreferrer"
        href="https://www.gov.uk/guidance/eu-iuu-regulation-2026-changes"
        target="_blank"
        className="govuk-link"
      >
        {t("commonDashboardEU2026ChangesGuidance")}
        <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
      </a>
    </div>
  );
};
