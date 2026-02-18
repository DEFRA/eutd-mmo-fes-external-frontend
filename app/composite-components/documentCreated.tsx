import type { Journey } from "~/types";
import { Link, useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { Main } from "~/components";
import { useScrollOnPageLoad } from "~/hooks";
import { useEffect } from "react";
import { shouldRenderGA } from "~/helpers";
import { useRedirectOnBackFromCreatedPage } from "~/hooks/useRedirectOnBackFromCreatedPage";

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
  const { documentNumber, documentUri, documentStatus } = completedDocument;
  useScrollOnPageLoad();
  // Add back button redirect for all journeys by inferring from documentNumber
  let redirectPath: string | undefined;
  if (documentNumber) {
    if (documentNumber.includes("CC")) {
      redirectPath = "/create-catch-certificate/catch-certificates";
    } else if (documentNumber.includes("PS")) {
      redirectPath = "/create-processing-statement/processing-statements";
    } else if (documentNumber.includes("SD")) {
      redirectPath = "/create-non-manipulation-document/non-manipulation-documents";
    }
  }
  useRedirectOnBackFromCreatedPage(documentStatus, redirectPath ?? "");

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
      <div className="govuk-!-display-inline-block" style={{ verticalAlign: "middle" }}>
        <svg
          version="1.1"
          fill="currentColor"
          width="35"
          height="35"
          viewBox="0 0 35.000000 35.000000"
          preserveAspectRatio="xMidYMid meet"
        >
          <title>icon important</title>
          <g transform="translate(0.000000,35.000000) scale(0.100000,-0.100000)">
            <path
              d="M100 332 c-87 -48 -125 -155 -82 -232 48 -87 155 -125 232 -82 87 48
                125 155 82 232 -48 87 -155 125 -232 82z m100 -122 c0 -53 -2 -60 -20 -60 -18
                0 -20 7 -20 60 0 53 2 60 20 60 18 0 20 -7 20 -60z m0 -111 c0 -12 -7 -19 -20
                -19 -19 0 -28 28 -14 43 11 11 34 -5 34 -24z"
            ></path>
          </g>
        </svg>
      </div>
      <div
        className="govuk-!-display-inline-block govuk-!-padding-left-2 govuk-phase-banner__text"
        style={{ width: "90%", verticalAlign: "middle" }}
      >
        <strong>{t(translationTags[journey].notesSubHeading)}</strong>
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
      <Link to={createLink} className="govuk-link">
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
      <Link to={createLink} className="govuk-link">
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
