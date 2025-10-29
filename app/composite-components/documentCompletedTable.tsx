import { Link, useSearchParams } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import type { IGetAllDocumentsData, ICompletedDocumentData, DashboardLinks } from "~/types";
import moment from "moment";
import { camelCaseToSpacedLowerCase } from "~/helpers/string";
import last from "lodash/last";
import { format, subMonths, addMonths, compareAsc, parse } from "date-fns";

type DocumentCompletedTableProps = {
  journey: string;
  documents: IGetAllDocumentsData;
  showCopyButton: boolean;
  dashboardLinks: DashboardLinks;
};

const lastDatItem = (searchParams: URLSearchParams) => last(getCompletedPagination(searchParams));

const FirstDatItem = (searchParams: URLSearchParams) => getCompletedPagination(searchParams)[0];

export function getCompletedPagination(searchParams: URLSearchParams): string[] {
  const month = searchParams?.get("month") ? Number(searchParams?.get("month")) - 1 : new Date().getMonth();
  const year = searchParams?.get("year") ? Number(searchParams?.get("year")) : new Date().getFullYear();
  const position = searchParams?.get("position") ? Number(searchParams?.get("position")) : 0;

  // Used for urlPosition 0 or if no position is specified
  const fallback = [
    format(new Date(year, month), "MMM y"),
    format(subMonths(new Date(year, month), 1), "MMM y"),
    format(subMonths(new Date(year, month), 2), "MMM y"),
  ];

  if (position === 0) {
    return fallback;
  }

  if (position === 1) {
    return [
      format(addMonths(new Date(year, month), 1), "MMM y"),
      format(new Date(year, month), "MMM y"),
      format(subMonths(new Date(year, month), 1), "MMM y"),
    ];
  }

  if (position === 2) {
    return [
      format(addMonths(new Date(year, month), 2), "MMM y"),
      format(addMonths(new Date(year, month), 1), "MMM y"),
      format(new Date(year, month), "MMM y"),
    ];
  }

  return fallback;
}

export const paginationNextLinkDate = (searchParams: URLSearchParams) =>
  parse(lastDatItem(searchParams) as string, "MMM y", new Date());

export const paginationPreviousLinkDate = (searchParams: URLSearchParams) =>
  addMonths(parse(FirstDatItem(searchParams), "MMM y", new Date()), 2);

export const urlMonthIndex = (searchParams: URLSearchParams) =>
  searchParams.get("month") ? Number(searchParams.get("month")) - 1 : new Date().getMonth();

export const urlYear = (searchParams: URLSearchParams) =>
  searchParams.get("year") ? Number(searchParams.get("year")) : new Date().getFullYear();

export const DocumentCompletedTable = ({
  documents,
  journey,
  showCopyButton,
  dashboardLinks,
}: DocumentCompletedTableProps) => {
  const { t } = useTranslation(["common"]);
  const [searchParams] = useSearchParams();
  const disableNext = compareAsc(new Date(paginationPreviousLinkDate(searchParams)), new Date());

  return (
    <>
      {Array.isArray(documents?.completed) && documents.completed.length > 0 ? (
        <table className="govuk-table" data-testid={`${journey}-completed-table`}>
          <caption className="tablecaption">
            <h2 className="govuk-heading-l">{t("completed")}</h2>
          </caption>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">
                {t("commonDocumentNumber")}
              </th>
              <th scope="col" className="govuk-table__header">
                {t("commonDashboardYourReference")}
              </th>
              <th scope="col" className="govuk-table__header">
                {t("commonDashboardDateCreated")}
              </th>
              <th scope="col" className="govuk-table__header govuk-table__header--numeric">
                {t("commonDashboardAction")}
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {Array.isArray(documents?.completed) &&
              documents.completed.map((document: ICompletedDocumentData) => (
                <tr className="govuk-table__row" key={document.documentNumber}>
                  <td scope="row" className="govuk-table__cell govuk-!-width-one-quarter">
                    {document.documentNumber}
                  </td>
                  <td scope="row" className="govuk-table__cell tablerowuserref">
                    {document.userReference}
                  </td>
                  <td scope="row" className="govuk-table__cell">
                    {moment(document.createdAt).format("DD MMM YYYY") || "Unknown"}
                  </td>
                  <td scope="row" className="govuk-table__cell govuk-table__cell--numeric">
                    <Link
                      data-testid={`${journey}-viewcompleted`}
                      reloadDocument
                      to={`/pdf/export-certificates/${document.documentUri}`}
                      className="govuk-link"
                    >
                      {t("commonDashboardView", { ns: "common" })}
                      <span className="govuk-visually-hidden">
                        {`${t(journey)} ${document.documentNumber} ${document.userReference ? document.userReference : ""}`}
                      </span>
                    </Link>
                    <br />
                    {document.links?.voidLink()}
                    <br />
                    {showCopyButton && document.links?.copyLink()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      ) : (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-l">{t("completed")}</h2>
            <div data-testid={`no-${camelCaseToSpacedLowerCase(journey)}-created-this-month`}>
              {t(`${journey}DashboardCompleteSubtitleText`, {
                journey: camelCaseToSpacedLowerCase(journey),
                ns: "dashboard",
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="govuk-pagination" role="navigation" aria-label="results" data-testid={`${journey}-pagination`}>
        <div className="govuk-pagination__prev">
          {disableNext === 1 ? (
            <>
              <svg
                className="govuk-pagination__icon govuk-pagination__icon--prev"
                xmlns="http://www.w3.org/2000/svg"
                height="13"
                width="15"
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 15 13"
              >
                <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
              </svg>
              <span className="govuk-pagination__link-title">{t("commonDashboardPrev", { ns: "common" })}</span>
            </>
          ) : (
            <>{dashboardLinks?.previousLink()}</>
          )}
        </div>
        <ul className="govuk-pagination__list">{dashboardLinks?.monthlyLinks()}</ul>
        <div className="govuk-pagination__next">{dashboardLinks?.nextLink()}</div>
      </nav>
    </>
  );
};
