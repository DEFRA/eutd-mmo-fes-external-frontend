import type { Journey } from "~/types";
import { Link, useLoaderData } from "@remix-run/react";
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
      downloadLink: "ccCreatedDownloadLink",
      notesSubHeading: "ccCreatedDownloadDocumentNotesSubHeading",
      downloadFirefox: "downloadDocumentNotesFirefox",
      downloadMobile: "downloadDocumentNotesMobile",
      emailToImporter: "ccCreatedEmailToImporter",
      emailToImporterText: "processingStatementEmailToImporterText",
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
      createLink = route("/create-storage-document/storage-documents");
      break;
  }

  const { t } = useTranslation([translationFile, "common"]);
  const { completedDocument, feedbackURL, noOfVessels, analyticsCookieAccepted } = useLoaderData();
  const { documentNumber, documentUri } = completedDocument;

  useScrollOnPageLoad();

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
          <ol className="govuk-list govuk-list--number">
            <li>
              <Link reloadDocument to={`/pdf/export-certificates/${documentUri}`} className="govuk-link">
                <strong>{t(translationTags[journey].downloadLink)}</strong>.
              </Link>{" "}
              {t(translationTags[journey].notesSubHeading)}
              <ul className="govuk-list govuk-list--bullet">
                <li>{t(translationTags[journey].downloadFirefox)}</li>
                <li>{t(translationTags[journey].downloadMobile)}</li>
              </ul>
            </li>
            <li>
              <strong>{t(translationTags[journey].emailToImporter)}</strong>.{" "}
              {t(translationTags[journey].emailToImporterText)}
            </li>
          </ol>
          <Link to={createLink} className="govuk-link">
            {t(translationTags[journey].createNewLink)}
          </Link>
        </div>
      </div>
    </Main>
  );
};
