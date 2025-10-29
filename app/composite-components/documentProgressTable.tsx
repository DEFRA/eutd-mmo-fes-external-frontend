import { useTranslation } from "react-i18next";
import type { IProgressDocumentData, IGetAllDocumentsData, Journey } from "~/types";
import { getStatusName, getStatusClassName } from "~/helpers/dashboard";

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
      {hasDrafts ? (
        <>
          <p className="govuk-body">
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
          <table className="govuk-table" data-testid={`${journey}-inprogress-table`}>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  {t("commonDocumentNumber")}
                </th>
                <th scope="col" className="govuk-table__header">
                  {t("commonDashboardYourReference")}
                </th>
                <th scope="col" className="govuk-table__header">
                  {t("commonDashboardDateStarted")}
                </th>
                {journey === "catchCertificate" && (
                  <th scope="col" className="govuk-table__header">
                    {t("commonDashboardStatus")}
                  </th>
                )}
                <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                  {t("commonDashboardAction")}
                </th>
              </tr>
            </thead>
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
                      <div
                        className={`govuk-!-font-weight-bold govuk-tag govuk-tag--${getStatusClassName(
                          document.status,
                          document.isFailed
                        )}`}
                      >
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
        </>
      ) : (
        <p className="govuk-body">{t(`${journey}DashboardNoAnyDocInProgress`, { ns: "dashboard" })}</p>
      )}
    </>
  );
};
