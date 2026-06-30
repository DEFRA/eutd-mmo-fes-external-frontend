import { useTranslation } from "react-i18next";

type SidebarProps = {
  journey: string;
  dashboardFeedbackURL: string;
};

export const Sidebar = ({ journey, dashboardFeedbackURL }: SidebarProps) => {
  const { t } = useTranslation(["common"]);
  function renderLandingLinks() {
    return (
      <>
        <hr className="sidebar-divider" />
        <h3 className="sectionheader sidebar-section-header">{t("commonDashboardlandingLinksHeader")}</h3>
        <p>
          <a
            data-testid="prior-notification-form"
            rel="noopener noreferrer"
            href="https://www.gov.uk/government/publications/give-prior-notification-to-land-fish-in-the-eu"
            target="_blank"
            className="govuk-link"
          >
            {t("commonDashboardPriorNotificationForm")}{" "}
            <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
          </a>{" "}
          (PDF)
          <br />
          <a
            data-test-id="pre-landing-declaration"
            rel="noopener noreferrer"
            href="https://www.gov.uk/government/publications/make-a-pre-landing-declaration-to-land-fish-in-an-eu-port"
            target="_blank"
            className="govuk-link"
          >
            {t("commonDashboardPreLandingDeclaration")}{" "}
            <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
          </a>{" "}
          (PDF)
        </p>
        <hr className="sidebar-divider" />
      </>
    );
  }

  function renderCatchCertSubSection() {
    return (
      <>
        <h3 className="sectionheader sidebar-section-header">{t("commonDashboardCatchCertSubSectionHeader")}</h3>
        <p>
          {t("commonDashboardForFishNotCaught")}
          <br />
          <a
            data-testid="create-uk-processing-statement"
            rel="noopener noreferrer"
            href="https://www.gov.uk/guidance/create-a-uk-processing-statement"
            target="_blank"
            className="govuk-link"
          >
            {t("processingStatementRendererHeaderSectionTitle", { ns: "dashboard" })}{" "}
            <span className="sidebar-govuk-link">(gov.uk)</span>{" "}
            <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
          </a>
          <br />
          <a
            data-testid="create-uk-storage-document"
            rel="noopener noreferrer"
            href="https://www.gov.uk/guidance/create-a-uk-storage-document"
            target="_blank"
            className="govuk-link"
          >
            {t("commonDashboardCreateaUkStorageDocument")} <span className="sidebar-govuk-link">(gov.uk)</span>{" "}
            <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
          </a>
        </p>

        {renderDashboardFeedbackLinkSubSection()}
      </>
    );
  }

  function renderProcessingStatementSubSection() {
    return (
      <>
        <hr className="sidebar-divider" />
        <h3 className="sectionheader sidebar-section-header">
          {t("psDashboardOtherFishExportServices", { ns: "dashboard" })}
        </h3>
        <p>
          <a
            data-testid="create-uk-catch-certificate"
            rel="noopener noreferrer"
            href="https://www.gov.uk/guidance/create-a-uk-catch-certificate"
            target="_blank"
            className="govuk-link"
          >
            {t("commonDashboardCreateAUkCatchCertificate")}
            <span className="sidebar-govuk-link">(gov.uk)</span>{" "}
            <span className="govuk-visually-hidden">({t("commonHelpLinkOpenInNewTab")})</span>
          </a>
          <br />
          <a
            data-testid="create-uk-storage-document"
            rel="noopener noreferrer"
            href="https://www.gov.uk/guidance/create-a-uk-storage-document"
            target="_blank"
            className="govuk-link"
          >
            {t("commonDashboardCreateaUkStorageDocument")}
            <span className="sidebar-govuk-link">(gov.uk)</span>{" "}
            <span className="govuk-visually-hidden">({t("commonHelpLinkOpenInNewTab")})</span>
          </a>
        </p>

        {renderDashboardFeedbackLinkSubSection()}
      </>
    );
  }

  function renderStorageNoteSubSection() {
    return (
      <>
        <hr className="sidebar-divider" />
        <h3 className="sectionheader sidebar-section-header">
          {t("psDashboardOtherFishExportServices", { ns: "dashboard" })}
        </h3>
        <p>
          <a
            rel="noopener noreferrer"
            href="https://www.gov.uk/guidance/create-a-uk-catch-certificate"
            target="_blank"
            className="govuk-link"
          >
            {t("commonDashboardCreateAUkCatchCertificate")} <span className="sidebar-govuk-link">(gov.uk)</span>{" "}
            <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
          </a>
          <br />
          <a
            rel="noopener noreferrer"
            href="https://www.gov.uk/guidance/create-a-uk-processing-statement"
            target="_blank"
            className="govuk-link"
          >
            {t("processingStatementRendererHeaderSectionTitle", { ns: "dashboard" })}{" "}
            <span className="sidebar-govuk-link--narrow">(gov.uk)</span>{" "}
            <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
          </a>
        </p>
        {renderDashboardFeedbackLinkSubSection()}
      </>
    );
  }

  function renderDashboardFeedbackLinkSubSection() {
    return (
      <>
        <hr className="sidebar-divider" />
        <h3 className="sectionheader sidebar-section-header">{t("commonDashboardFeedbackHeading")}</h3>
        <p>
          {t("commonDashboardFeedbackText")}
          <a
            data-testid="dashboard-feedback-url-link"
            rel="noopener noreferrer"
            href={dashboardFeedbackURL}
            target="_blank"
            className="govuk-link"
          >
            {t("commonDashboardFeedbackHyperLink")}{" "}
            <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
          </a>
        </p>
      </>
    );
  }

  return (
    <>
      <hr className="horizontal-line" />
      <h2 className="inprogress">{t("helpLinkNeedHelp")}</h2>
      <p>
        <a
          data-testid="guidance-on-exporting-fish"
          rel="noopener noreferrer"
          href="https://www.gov.uk/guidance/exporting-and-importing-fish-if-theres-no-brexit-deal"
          target="_blank"
          className="govuk-link"
        >
          {t("commonDashboardGuidanceOnExportingFish")}{" "}
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
          {t("commonDashboardEU2026ChangesGuidance")}{" "}
          <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
        </a>
      </p>
      {journey === "catchCertificate" && renderLandingLinks()}
      {journey === "catchCertificate" && renderCatchCertSubSection()}
      {journey === "processingStatement" && renderProcessingStatementSubSection()}
      {journey === "storageNotes" && renderStorageNoteSubSection()}
    </>
  );
};
