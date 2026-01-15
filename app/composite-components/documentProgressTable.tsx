import { useTranslation } from "react-i18next";
import type { IProgressDocumentData, IGetAllDocumentsData, Journey } from "~/types";
import { getStatusName, getStatusClassName } from "~/helpers/dashboard";
import { DocumentTableHeader } from "./DocumentTableHeader";

type DocumentProgressTableProps = {
  journey: Journey;
  documents: IGetAllDocumentsData;
  hasDrafts: boolean;
  maximumDraftsLength: number;
};

export const DocumentProgressTable = ({
  documents,
  journey,
  maximumDraftsLength,
  hasDrafts,
}: DocumentProgressTableProps) => {
  const { t } = useTranslation(["common"]);

  return (
    <>
      <h2 className="govuk-heading-l">{t("commonDashboardInProgress")}</h2>
      <p className="govuk-body" style={journey === "storageNotes" ? { whiteSpace: "pre-line" } : undefined}>
        {t(`${journey}DashboardGuidance`, { maximumConcurrentDrafts: maximumDraftsLength, ns: "dashboard" })}
        {journey === "catchCertificate" && (
          <>
            <br />
            {t(`${journey}DashboardGuidanceForPendingSubmission`, { ns: "dashboard" })}
            <br />
            {t(`${journey}DashboardGuidanceForFailedSubmission`, { ns: "dashboard" })}
          </>
        )}
      </p>
      {hasDrafts ? (
        <table className="govuk-table" data-testid={`${journey}-inprogress-table`}>
          <DocumentTableHeader
            journey={journey}
            showDateStarted={true}
            showStatus={journey === "catchCertificate"}
            showEuCatchIntegration={false}
          />
          <tbody className="govuk-table__body">
            {documents.inProgress.map((document: IProgressDocumentData) => (
              <tr className="govuk-table__row" key={document.documentNumber}>
                <td scope="row" className="govuk-table__cell govuk-!-width-one-quarter">
                  {document.documentNumber}
                </td>
                <td scope="row" className="govuk-table__cell tablerowuserref">
                  {document.userReference}
                </td>
                <td scope="row" className="govuk-table__cell">
                  {document.startedAt || "Unknown"}
                </td>
                {journey === "catchCertificate" && (
                  <td scope="row" className="govuk-table__cell">
                    <div className={`govuk-tag govuk-tag--${getStatusClassName(document.status, document.isFailed)}`}>
                      {getStatusName(document.status, document.isFailed, t)}
                    </div>
                  </td>
                )}
                <td scope="row" className="govuk-table__cell govuk-table__cell--numeric">
                  {document.status !== "PENDING" && (
                    <>
                      {document?.links?.continueLink()}
                      <br />
                      {document.status !== "LOCKED" && document?.links?.deleteLink()}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          {journey === "storageNotes" && (
            <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
          )}
          <p className="govuk-body">{t(`${journey}DashboardNoAnyDocInProgress`, { ns: "dashboard" })}</p>
          {journey === "storageNotes" && (
            <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
          )}
        </>
      )}
    </>
  );
};
