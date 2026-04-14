import type { Journey } from "~/types";
import { Link, PrefetchPageLinks, useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { Main } from "~/components";
import { useScrollOnPageLoad } from "~/hooks";
import { useEffect } from "react";
import { shouldRenderGA } from "~/helpers";

type DocumentCreatedType = {
  journey: Journey;
};

export const DocumentCreatedComponent = ({ journey }: DocumentCreatedType) => {
  const translationTags: any = {
    catchCertificate: {
      panelTitle: "ccCreatedPanelTitle",
      panelBody: "ccCreatedPanelBody",
      nextStepsHeader: "ccCreatedNextStepsHeader",
      downloadLink: "ccCreatedDownloadSectionHeader",
      notesSubHeading: "ccCreatedDownloadDocumentNotesSubHeading",
      downloadFirefox: "downloadDocumentNotesFirefox",
      downloadMobile: "downloadDocumentNotesMobile",
      emailSectionHeader: "ccCreatedEmailSectionHeader",
      emailToImporter: "ccCreatedEmailToImporter",
      emailToImporterText: "ccCreatedImportersResponsibility",
      emailToImporterText2: "ccCreatedImportersResponsibilityBIP",
      createNewLink: "ccCreatedViewOrCreateNewLink",
    },
    processingStatement: {
      panelTitle: "psCreatedPanelTitle",
      panelBody: "psCreatedPanelBody",
      nextStepsHeader: "psCreatedNextStepsHeader",
      downloadLink: "psCreatedDownloadLink",
      notesSubHeading: "psCreatedDownloadDocumentNotesSubHeading",
      downloadFirefox: "psCreatedDownloadDocumentNotesFirefox",
      downloadMobile: "psCreatedDownloadDocumentNotesMobile",
      emailToImporter: "psCreatedEmailToImporter",
      emailToImporterText: "commonDocumentCreatedImportersResponsibility",
      emailToImporterText2: "commonDocumentCreatedImportersResponsibilityBIP",
      createNewLink: "psCreatedViewOrCreateNewLink",
    },
    storageNotes: {
      panelTitle: "sdCreatedPanelTitle",
      panelBody: "sdCreatedPanelBody",
      nextStepsHeader: "sdCreatedNextStepsHeader",
      downloadLink: "sdCreatedDownloadLink",
      notesSubHeading: "sdCreatedDownloadDocumentNotesSubHeading",
      downloadFirefox: "sdCreatedDownloadDocumentNotesFirefox",
      downloadMobile: "sdCreatedDownloadDocumentNotesMobile",
      emailToImporter: "sdCreatedEmailToImporter",
      emailToImporterText: "commonDocumentCreatedImportersResponsibility",
      emailToImporterText2: "commonDocumentCreatedImportersResponsibilityBIP",
      createNewLink: "sdCreatedViewOrCreateNewLink",
    },
  };

  let translationFile = "";
  let gtagName = "";
  let createLink = "";
  switch (journey) {
    case "catchCertificate":
      translationFile = "catchCertificateCreated";
      gtagName = "completedCatchCertificate";
      createLink = route("/create-catch-certificate/catch-certificates");
      break;
    case "processingStatement":
      translationFile = "processingStatementCreated";
      gtagName = "completedProcessingStatement";
      createLink = route("/create-processing-statement/processing-statements");
      break;
    case "storageNotes":
      translationFile = "storageDocumentCreated";
      gtagName = "completedStorageDocs";
      createLink = route("/create-non-manipulation-document/non-manipulation-documents");
      break;
  }

  const { t } = useTranslation([translationFile, "common"]);
  const { completedDocument, feedbackURL, noOfVessels, analyticsCookieAccepted } = useLoaderData();
  const { documentNumber, documentUri } = completedDocument;

  useScrollOnPageLoad();

  // Clear all previous history entries and only keep the dashboard URL
  // so the browser back button always navigates to the dashboard
  useEffect(() => {
    const createdPageUrl = window.location.href;

    // Replace the previous history entry with the dashboard URL
    window.history.replaceState({ dashboardRedirect: true }, "", createLink);

    // Push the created page back as the current visible entry
    window.history.pushState({ createdPage: true }, "", createdPageUrl);
  }, [createLink]);

  /* istanbul ignore next */
  useEffect(() => {
    if (shouldRenderGA(analyticsCookieAccepted)) {
      //Protect from gtag not yet loaded
      if (window.gtag) {
        window.gtag("event", gtagName, {
          numberOfVessels: noOfVessels,
        });
      }
    }
  }, []);

  const renderDownloadLink = () => (
    <h3 className="govuk-heading-s">
      <Link reloadDocument to={`/pdf/export-certificates/${documentUri}`} className="govuk-link">
        <strong>{t(translationTags[journey].downloadLink)}</strong>
      </Link>
    </h3>
  );

  const renderDownloadBulletPoints = () => (
    <ul className="govuk-list govuk-list--bullet">
      <li>{t(translationTags[journey].downloadFirefox)}</li>
      <li>{t(translationTags[journey].downloadMobile)}</li>
    </ul>
  );

  const renderImportantNotice = () => (
    <div className="govuk-!-margin-bottom-4">
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">
          <span className="govuk-visually-hidden">Warning</span>
          {t(translationTags[journey].notesSubHeading)}
        </strong>
      </div>
    </div>
  );

  const renderCatchCertificateSteps = () => (
    <>
      <div className="govuk-!-margin-bottom-6">
        {renderDownloadLink()}
        {renderDownloadBulletPoints()}
        {renderImportantNotice()}
      </div>
      <div className="govuk-!-margin-bottom-6">
        <h3 className="govuk-heading-s">
          <strong>{t(translationTags[journey].emailSectionHeader)}</strong>
        </h3>
        <ul className="govuk-list govuk-list--bullet">
          <li>{t(translationTags[journey].emailToImporterText)}</li>
          <li>{t(translationTags[journey].emailToImporterText2)}</li>
        </ul>
      </div>
      <PrefetchPageLinks page={createLink} />
      <Link to={createLink} className="govuk-link" prefetch="render">
        {t(translationTags[journey].createNewLink)}
      </Link>
    </>
  );

  const renderProcessingAndStorageSteps = () => (
    <>
      <ol className="govuk-list govuk-list--number">
        <li>
          {renderDownloadLink()}
          {renderDownloadBulletPoints()}
          {renderImportantNotice()}
        </li>
        <li>
          <strong>{t(translationTags[journey].emailToImporter)}</strong>
          <ul className="govuk-list govuk-list--bullet">
            <li>{t(translationTags[journey].emailToImporterText)}</li>
            <li>{t(translationTags[journey].emailToImporterText2)}</li>
          </ul>
        </li>
      </ol>
      <PrefetchPageLinks page={createLink} />
      <Link to={createLink} className="govuk-link" prefetch="render">
        {t(translationTags[journey].createNewLink)}
      </Link>
    </>
  );

  return (
    <Main feedbackLink={feedbackURL}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title">{t(translationTags[journey].panelTitle)}</h1>
            <div className="govuk-panel__body">
              {t(translationTags[journey].panelBody)}
              <br />
              <strong>{documentNumber}</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="govuk-grid-row govuk-!-margin-top-8">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{t(translationTags[journey].nextStepsHeader)}</h2>
          {journey === "catchCertificate" ? renderCatchCertificateSteps() : renderProcessingAndStorageSteps()}
        </div>
      </div>
    </Main>
  );
};
