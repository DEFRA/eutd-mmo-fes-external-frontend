import type { Catch, pageLinks } from "~/types";
import { useTranslation } from "react-i18next";
import { type MouseEventHandler } from "react";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { CatchDetailsTableHeader } from "~/components";
import { getCatchDetailsHeaders } from "~/helpers";

type ProductTableRowProps = {
  productId: string;
  catches: Catch[];
  navigationLinks: pageLinks;
  documentNumber: string;
  totalPages: number;
  isLastPage: boolean;
  pageNo: number;
  isFirstPage: boolean;
  productDescription: string;
  speciesCountByCode: number;
  documentCountByCertificateNumber: number;
  onClickHandler: MouseEventHandler<HTMLButtonElement>;
};

export const CatchDetailsTable = ({
  productId,
  catches,
  navigationLinks,
  documentNumber,
  totalPages,
  isLastPage,
  pageNo,
  isFirstPage,
  productDescription,
  speciesCountByCode,
  documentCountByCertificateNumber,
  onClickHandler,
}: ProductTableRowProps) => {
  const { t } = useTranslation(["whatAreYouExporting", "catchDetailsTableHeader", "common"]);

  return (
    <>
      <h2 className={"govuk-heading-l govuk-!-margin-top-5"}>
        {`${t("psAddCatchDetailsTableHeader", {
          uniqueSpeciesCount: speciesCountByCode,
          uniqueDocumentCount: documentCountByCertificateNumber,
          ns: "psAddCatchDetails",
        })} ${productDescription}`}
      </h2>
      <table className="govuk-table" id="yourproducts">
        <CatchDetailsTableHeader
          headersToRender={getCatchDetailsHeaders(
            t("speciesNameFAO", { ns: "catchDetailsTableHeader" }),
            t("catchCertificateWeight", { ns: "catchDetailsTableHeader" }),
            t("exportWeightBeforeProcessing", { ns: "catchDetailsTableHeader" }),
            t("exportWeightAfterProcessing", { ns: "catchDetailsTableHeader" }),
            t("action", { ns: "catchDetailsTableHeader" })
          )}
        />
        <tbody>
          {catches.map((ctch: Catch, index: number) => (
            <tr className="govuk-table__row" key={`catches-${ctch.species}-${ctch._id}`}>
              <td className="govuk-table__cell">
                <p className="govuk-!-margin-0">{ctch.species}</p>
              </td>
              <td className="govuk-table__cell">{ctch.totalWeightLanded}</td>
              <td className="govuk-table__cell">{ctch.exportWeightBeforeProcessing}</td>
              <td className="govuk-table__cell">{ctch.exportWeightAfterProcessing}</td>
              <td className="govuk-table__cell govuk-!-text-align-right">
                <Button
                  label={t("commonEditLink", { ns: "common" })}
                  className="govuk-button govuk-button--secondary govuk-!-margin-right-3"
                  type={BUTTON_TYPE.SUBMIT}
                  data-module="govuk-button"
                  onClick={onClickHandler}
                  data-testid={`edit-button-${index}`}
                  name="_action"
                  value={`editButton-${ctch._id}-${pageNo}`}
                  visuallyHiddenText={{
                    text:
                      t("catchCertificate", { ns: "common" }) + " " + ctch.catchCertificateNumber + " " + ctch.species,
                    className: "govuk-visually-hidden",
                  }}
                />
                {catches.length > 1 && (
                  <Button
                    label={t("commonRemoveButton", { ns: "common" })}
                    className="govuk-button govuk-button--secondary"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    data-testid={`remove-button-${index}`}
                    name="_action"
                    value={`removeCatch-${ctch._id}-${pageNo}`}
                    visuallyHiddenText={{
                      text:
                        t("catchCertificate", { ns: "common" }) +
                        " " +
                        ctch.catchCertificateNumber +
                        " " +
                        ctch.species,
                      className: "govuk-visually-hidden",
                    }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {catches.filter((data) => "catchCertificateNumber" in data).length > 0 && totalPages > 1 && (
        <nav className="govuk-pagination" role="navigation" aria-label="results" data-testid="pagination">
          <div className="govuk-pagination__prev">
            {isFirstPage ? (
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
              <>{navigationLinks?.previousLink()}</>
            )}
          </div>
          <ul className="govuk-pagination__list">
            {Array.from(Array(totalPages).keys()).map((index) => {
              const pageNum = index + 1;

              return (
                <li
                  key={`pagination-${pageNum}`}
                  className={
                    pageNo == pageNum
                      ? "govuk-pagination__item govuk-pagination__item--current"
                      : "govuk-pagination__item"
                  }
                >
                  <a
                    className="govuk-link govuk-pagination__link"
                    href={`/create-processing-statement/${documentNumber}/add-catch-details/${productId}&pageNo=${pageNum}`}
                    aria-label={`${t("commonDashboardPage")} ${pageNum}`}
                  >
                    {pageNum}{" "}
                  </a>
                </li>
              );
            })}
          </ul>
          <div className="govuk-pagination__next">
            {isLastPage ? (
              <>
                <span className="govuk-pagination__link-title ">{t("commonDashboardNext", { ns: "common" })}</span>{" "}
                <svg
                  className="govuk-pagination__icon govuk-pagination__icon--next"
                  xmlns="http://www.w3.org/2000/svg"
                  height="13"
                  width="15"
                  aria-hidden="true"
                  focusable="false"
                  viewBox="0 0 15 13"
                >
                  <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
                </svg>
              </>
            ) : (
              <>{navigationLinks?.nextLink()}</>
            )}
          </div>
        </nav>
      )}
    </>
  );
};
