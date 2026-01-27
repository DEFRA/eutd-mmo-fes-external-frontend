import * as React from "react";
import {
  Main,
  Title,
  BackToProgressLink,
  ErrorSummary,
  CatchDetailsTableHeader,
  SecureForm,
  FilterSearch,
} from "~/components";
import { useLoaderData, useActionData, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { type MetaFunction, type LoaderFunction, type ActionFunction, redirect } from "react-router";
import type {
  IUnauthorised,
  ProcessingStatement,
  Catch,
  CatchIndex,
  ErrorResponse,
  IError,
  ActionDataWithErrors,
  ProcessingStatementProduct,
} from "~/types";
import {
  updateProcessingStatement,
  getProcessingStatement,
  getBearerTokenForRequest,
  validateResponseData,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  countUniqueDocumentByCatchCertificateNumber,
  displayErrorTransformedMessages,
  getCatchAddedHeaders,
  getCatchesWithTags,
  getMeta,
  getTitleKey,
  scrollToId,
} from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { useEffect } from "react";
import { ButtonGroup } from "~/composite-components";
import i18next from "~/i18next.server";
import type { TFunction } from "i18next";

type ILoaderData = {
  documentNumber: string;
  products: ProcessingStatementProduct[];
  catches: (Catch & CatchIndex & { tagClass?: string })[];
  pageTitle: string;
  commonTitle: string;
  csrf: string;
  productId?: string;
  q?: string;
  nextUri?: string;
  productDescription: string;
  totalDocuments: number;
  initialPageNo?: number;
};

const applyMatchedFromSession = (session: any, psData: ProcessingStatement, hasActiveQuery: boolean) => {
  // Only apply filtering if there's an active search query
  if (!hasActiveQuery) {
    return;
  }
  const matchedFromSession = session.get("matchCatches");
  if (Array.isArray(matchedFromSession)) {
    const matchingCatches: (Catch & CatchIndex)[] = matchedFromSession as (Catch & CatchIndex)[];
    if (matchingCatches.length > 0) {
      const matchingProductIds = new Set(matchingCatches.map((c) => c.productId));
      psData.catches = matchingCatches;
      if (Array.isArray(psData.products))
        psData.products = psData.products.filter((p: ProcessingStatementProduct) => matchingProductIds.has(p.id));
    } else {
      psData.catches = [];
      psData.products = [];
    }
    session.unset("matchCatches");
  }
};

const handleFilterAction = async (
  values: Record<string, unknown>,
  session: any,
  psData: ProcessingStatement,
  documentNumber?: string
): Promise<Response | null> => {
  const q = (values.q as string) ?? "";
  const actionType = (values.actionType as string) ?? "";

  if (actionType === "reset") {
    session.unset("matchCatches");
    session.unset("matchQuery");
    return redirect(
      route("/create-processing-statement/:documentNumber/catch-added", { documentNumber: documentNumber as string }),
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  if (actionType === "search") {
    if (q && Array.isArray(psData.catches)) {
      const qLower = q.toLowerCase();
      const matchingCatches = psData.catches.filter((ctch: Catch) => {
        const species = (ctch.species ?? "").toString().toLowerCase();
        const speciesCode = (ctch.speciesCode ?? "").toString().toLowerCase();
        const productDescription = (ctch.productDescription ?? "").toString().toLowerCase();
        return species.includes(qLower) || speciesCode.includes(qLower) || productDescription.includes(qLower);
      });

      session.set("matchCatches", matchingCatches);
      session.set("matchQuery", q);
    } else {
      session.set("matchCatches", []);
      session.set("matchQuery", "");
    }

    const searchParams = q ? `?q=${encodeURIComponent(q)}` : "";
    return redirect(
      route("/create-processing-statement/:documentNumber/catch-added", { documentNumber: documentNumber as string }) +
        searchParams,
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return null;
};

export const meta: MetaFunction = (args) => getMeta(args);

const hasNoAddedProducts = (psData: ProcessingStatement) =>
  !Array.isArray(psData.products) || (Array.isArray(psData.products) && psData.products.length < 1);
const hasNoAddedCatches = (psData: ProcessingStatement) =>
  !Array.isArray(psData.catches) || (Array.isArray(psData.catches) && psData.catches.length < 1);

export const loader: LoaderFunction = async ({ request, params }) => {
  setApiMock(request.url);

  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);
  const hasActionExecuted = session.get("actionExecuted");

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  if (hasActionExecuted) {
    session.unset("actionExecuted");
  }

  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  validateResponseData(processingStatement);

  const psData = processingStatement as ProcessingStatement;

  // Check if there's an active search query before applying session filtering
  const url = new URL(request.url);
  const urlQuery = url.searchParams.get("q");

  // If the user navigates to the catch-added page without a search query (no `q`),
  // treat this as a fresh navigation back to the page and clear transient
  // match/search session state so previous search/filter values do not persist.
  if (!urlQuery && session.get("matchQuery")) {
    session.unset("actionExecuted");
    session.unset("matchQuery");
    session.unset("matchCatches");
  }

  const sessionQuery = session.get("matchQuery");
  const hasActiveQuery = !!(urlQuery ?? sessionQuery);

  applyMatchedFromSession(session, psData, hasActiveQuery);

  if (!hasActionExecuted && !hasActiveQuery) {
    if (hasNoAddedProducts(psData)) {
      return redirect(`/create-processing-statement/${documentNumber}/add-consignment-details`);
    } else if (hasNoAddedCatches(psData)) {
      const lastProduct = psData?.products?.[psData?.products.length - 1];
      const lastProductId = lastProduct?.id;
      if (lastProductId) {
        return redirect(`/create-processing-statement/${documentNumber}/add-consignment-details/${lastProductId}`);
      }
    }
  }

  const t = await i18next.getFixedT(request, ["catchAdded", "title"]);
  const titleKey = getTitleKey(psData.catches);

  const product = psData.products?.findLast((p: ProcessingStatementProduct) => p.id);

  const pageNo = parseInt(url.searchParams.get("pageNo") ?? "1", 10);
  const q = urlQuery ?? (typeof sessionQuery === "string" ? sessionQuery : undefined);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const productDescription = psData.products?.length === 1 ? psData.products[0].description : undefined;
  const totalDocuments = countUniqueDocumentByCatchCertificateNumber(psData.catches);

  return new Response(
    JSON.stringify({
      documentNumber,
      products: psData.products,
      catches: getCatchesWithTags(psData.catches),
      pageTitle: t(titleKey, { count: psData.products?.length, ns: "catchAdded" }),
      commonTitle: t("psCommonTitle", { ns: "title" }),
      csrf,
      productId: product?.id,
      q,
      nextUri,
      productDescription,
      totalDocuments,
      initialPageNo: pageNo,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  session.set("actionExecuted", true);
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  validateResponseData(processingStatement);

  const psData = processingStatement as ProcessingStatement;
  const form = await request.formData();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const { _action, ...values } = Object.fromEntries(form);
  const nextUri = (form.get("nextUri") as string) || "";

  const maybeHandled = await handleFilterAction(values, session, psData, documentNumber as string);
  if (maybeHandled) return maybeHandled;
  const isDraft = _action === "saveAsDraft";
  const isSaveAndContinue = _action === "saveAndContinue";
  const isEdit = _action === "edit";

  if (isEdit) {
    return redirect(values["url"] as string);
  }

  const addAnotherCatch = values.addAnotherCatch === "Yes";

  let errorData;

  if (isDraft || isSaveAndContinue) {
    errorData = await updateProcessingStatement(
      bearerToken,
      documentNumber,
      { catches: psData.catches },
      `/create-processing-statement/${documentNumber}/catch-added`,
      undefined,
      isDraft,
      true
    );
  }

  if (isDraft) {
    session.unset("actionExecuted");
    session.unset("matchQuery");
    session.unset("matchCatches");
    return redirect(route("/create-processing-statement/processing-statements"), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (errorData && Array.isArray(psData?.catches)) {
    const { errors, ...data } = errorData as ErrorResponse;
    const transformedErrors: IError[] = displayErrorTransformedMessages(errors);

    return new Response(
      JSON.stringify({
        groupedErrors: transformedErrors,
        ...data,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
  if (addAnotherCatch) {
    session.unset("actionExecuted");
    session.unset("matchQuery");
    session.unset("matchCatches");
    return redirect(`/create-processing-statement/${documentNumber}/add-consignment-details`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.unset("actionExecuted");
  session.unset("matchQuery");
  session.unset("matchCatches");

  // Check if plant details are already filled
  const hasPlantDetails = psData.plantName && psData.plantApprovalNumber && psData.personResponsibleForConsignment;

  let redirectUrl: string;
  if (!nextUri || isEmpty(nextUri)) {
    // If no nextUri, check if plant details exist
    if (hasPlantDetails) {
      // Skip plant details page and go directly to check-your-information
      redirectUrl = `/create-processing-statement/${documentNumber}/check-your-information`;
    } else {
      // Plant details not filled, go to plant details page
      redirectUrl = `/create-processing-statement/${documentNumber}/add-processing-plant-details`;
    }
  } else {
    // Use the provided nextUri
    redirectUrl = nextUri;
  }

  return redirect(redirectUrl, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const populateNavigationLinks = (
  t: TFunction<"common"[], undefined>,
  documentNumber: string,
  currentPage: number,
  totalPages: number
) => ({
  previousLink: () => (
    <a
      className="govuk-link govuk-pagination__link"
      href={`/create-processing-statement/${documentNumber}/catch-added?pageNo=${currentPage - 1}`}
      rel="prev"
    >
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
    </a>
  ),

  pageLinks: () =>
    Array.from({ length: totalPages }, (_, index) => {
      const pageNum = index + 1;
      const isCurrentPage = pageNum === currentPage;

      return (
        <li
          key={`pagination-${pageNum}`}
          className={
            isCurrentPage ? "govuk-pagination__item govuk-pagination__item--current" : "govuk-pagination__item"
          }
        >
          {isCurrentPage ? (
            <a
              className="govuk-link govuk-pagination__link"
              href={`/create-processing-statement/${documentNumber}/catch-added?pageNo=${pageNum}`}
              aria-label={`page${pageNum}`}
            >
              {pageNum}
            </a>
          ) : (
            <a
              className="govuk-link govuk-pagination__link"
              href={`/create-processing-statement/${documentNumber}/catch-added?pageNo=${pageNum}`}
              aria-label={`${t("commonDashboardPage", { ns: "common" })} ${pageNum}`}
            >
              {pageNum}
            </a>
          )}
        </li>
      );
    }),

  nextLink: () => (
    <a
      className="govuk-link govuk-pagination__link"
      href={`/create-processing-statement/${documentNumber}/catch-added?pageNo=${currentPage + 1}`}
      rel="next"
    >
      <span className="govuk-pagination__link-title">{t("commonDashboardNext", { ns: "common" })}</span>
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
    </a>
  ),
});

const CatchAdded = () => {
  const {
    documentNumber,
    products,
    catches,
    csrf,
    productId,
    productDescription,
    totalDocuments,
    q,
    nextUri,
    initialPageNo,
  } = useLoaderData<ILoaderData>();
  const actionData = useActionData<ActionDataWithErrors>();
  const groupedErrors: IError[] = ((actionData?.groupedErrors ?? []) as unknown as IError[][]).flat();
  const { t } = useTranslation(["catchDetailsTableHeader", "common"]);
  const count = products.length;

  // Group catches by product for display
  const catchesByProduct = products.map((product: ProcessingStatementProduct) => ({
    product,
    catches: catches.filter((c: Catch) => c.productId === product.id),
  }));

  const itemsPerPage = 15;
  const shouldShowPagination = catches.length > itemsPerPage;
  const totalPages = shouldShowPagination ? Math.ceil(catches.length / itemsPerPage) : 0;
  const currentPage = initialPageNo ?? 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCatches = catches.slice(startIndex, endIndex);

  useEffect(() => {
    if (!isEmpty(groupedErrors)) {
      scrollToId("errorIsland");
    }
  }, [groupedErrors]);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const navigationLinks = populateNavigationLinks(t, documentNumber, currentPage, totalPages);

  return (
    <Main backUrl={`/create-processing-statement/${documentNumber}/add-catch-details/${productId}/0`}>
      {Array.isArray(groupedErrors) && groupedErrors.length > 0 && <ErrorSummary errors={groupedErrors} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title
            title={t(count === 1 ? "psCatchAddedSingleCatchTitle" : "psCatchAddedMultiCatchTitle", {
              count,
              ns: "catchAdded",
            })}
          />
          <SecureForm method="post" csrf={csrf} className="govuk-!-margin-bottom-4">
            <FilterSearch
              label={t("psFilterLabel", { ns: "catchAdded" })}
              hint={t("psFilterHint", { ns: "catchAdded" })}
              searchButtonLabel={t("psFilterButtonLabel", { ns: "catchAdded" })}
              resetButtonLabel={t("psFilterResetButtonLabel", { ns: "catchAdded" })}
              defaultValue={q}
            />
          </SecureForm>
          {productDescription && (
            <h2 className={"govuk-heading-l govuk-!-margin-top-5"} id="summary-table-title">
              {`${t(totalDocuments === 1 ? "catchDetailsHeading" : "catchDetailsHeadingMultiple", {
                totalDocuments: totalDocuments,
                ns: "catchAdded",
              })} ${productDescription}`}
            </h2>
          )}
          <div className="govuk-warning-text govuk-!-margin-bottom-4" data-testid="warning-message">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              {t("editProductInformationMessage", { ns: "catchAdded" })}
            </strong>
          </div>
          <table className="govuk-table">
            <CatchDetailsTableHeader
              headersToRender={getCatchAddedHeaders(
                t("productDescription", { ns: "catchDetailsTableHeader" }),
                t("speciesNameFAO", { ns: "catchDetailsTableHeader" }),
                t("catchCertificateNumber", { ns: "catchDetailsTableHeader" }),
                t("catchCertificateWeight", { ns: "catchDetailsTableHeader" }),
                t("exportWeightBeforeProcessing", { ns: "catchDetailsTableHeader" }),
                t("exportWeightAfterProcessing", { ns: "catchDetailsTableHeader" })
              )}
            />
            <tbody className="govuk-table__body">
              {!isEmpty(q) && catches.length === 0 && products.length === 0 ? (
                <tr className="govuk-table__row">
                  <td colSpan={6} className="govuk-table__cell">
                    {t("commonNoResultsFound", { ns: "common" })}
                  </td>
                </tr>
              ) : (
                <>
                  {catchesByProduct.map(({ product, catches: productCatches }) => {
                    if (productCatches.length === 0) {
                      // Product has no catches - show "No catches added" row
                      return (
                        <tr className="govuk-table__row" key={`product-${product.id}`}>
                          <td className="govuk-table__cell">
                            <strong
                              className="govuk-tag govuk-tag--grey govuk-!-margin-bottom-2"
                              style={{ display: "block" }}
                            >
                              {product.description}
                            </strong>
                            <div className="govuk-!-margin-top-2">
                              <Link
                                id="change-link"
                                className="govuk-link"
                                to={`/create-processing-statement/${documentNumber}/add-consignment-details/${product.id}`}
                                data-testid="change-link"
                              >
                                {t("commonChangeLink", { ns: "common" })}
                              </Link>
                            </div>
                          </td>
                          <td colSpan={5} className="govuk-table__cell">
                            {t("commonNoCatchesAdded", { ns: "common" })}
                          </td>
                        </tr>
                      );
                    }

                    // Product has catches - show all catches for this product (with pagination)
                    return productCatches
                      .filter((catch_: Catch & CatchIndex) => paginatedCatches.some((pc) => pc._id === catch_._id))
                      .map((item: Catch & CatchIndex & { tagClass?: string }) => {
                        const actualIndex = catches.findIndex((c) => c._id === item._id);

                        return (
                          <tr className="govuk-table__row" key={`catches-data-${item._id}`}>
                            <td className="govuk-table__cell" id={`catches-${actualIndex}-productDescription`}>
                              <strong
                                className={`govuk-tag ${item.tagClass} govuk-!-margin-bottom-2`}
                                data-testid={`catches-${actualIndex}-tag`}
                                style={{ display: "block" }}
                              >
                                {item.productDescription}
                              </strong>
                              <div className="govuk-!-margin-top-2">
                                <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                                  <input
                                    type="hidden"
                                    name="url"
                                    value={`/create-processing-statement/${documentNumber}/add-consignment-details/${item.productId}`}
                                  />
                                  <Link
                                    id="change-link"
                                    className="govuk-link"
                                    to={`/create-processing-statement/${documentNumber}/add-consignment-details/${item.productId}`}
                                    data-testid="change-link"
                                  >
                                    {t("commonChangeLink", { ns: "common" })}
                                  </Link>
                                </SecureForm>
                              </div>
                            </td>
                            <td className="govuk-table__cell" id={`catches-${actualIndex}-species`}>
                              {item.species}
                            </td>
                            <td className="govuk-table__cell" id={`catches-${actualIndex}-catchCertificateNumber`}>
                              {item.catchCertificateNumber}
                            </td>
                            <td className="govuk-table__cell" id={`catches-${actualIndex}-totalWeightLanded`}>
                              {Number(item.totalWeightLanded).toFixed(2)}kg
                            </td>
                            <td
                              className="govuk-table__cell"
                              id={`catches-${actualIndex}-exportWeightBeforeProcessing`}
                            >
                              {Number(item.exportWeightBeforeProcessing).toFixed(2)}kg
                            </td>
                            <td className="govuk-table__cell" id={`catches-${actualIndex}-exportWeightAfterProcessing`}>
                              {Number(item.exportWeightAfterProcessing).toFixed(2)}kg
                            </td>
                          </tr>
                        );
                      });
                  })}
                </>
              )}
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
                  <>{navigationLinks.previousLink()}</>
                )}
              </div>

              <ul className="govuk-pagination__list">{navigationLinks.pageLinks()}</ul>

              <div className="govuk-pagination__next">
                {isLastPage ? (
                  <>
                    <span className="govuk-pagination__link-title">{t("commonDashboardNext", { ns: "common" })}</span>
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
                  <>{navigationLinks.nextLink()}</>
                )}
              </div>
            </nav>
          )}

          <br />
          <SecureForm method="post" csrf={csrf}>
            <div id="radioButtons" className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h2 className="govuk-fieldset__heading">{t("psAddAnotherSpecies", { ns: "catchAdded" })}</h2>
                </legend>
                <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherCatchYes"
                      name="addAnotherCatch"
                      type="radio"
                      value="Yes"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="addAnotherCatchYes">
                      {t("commonYesLabel", { ns: "common" })}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherCatchNo"
                      name="addAnotherCatch"
                      type="radio"
                      value="No"
                      defaultChecked
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="addAnotherCatchNo">
                      {t("commonNoLabel", { ns: "common" })}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <input type="hidden" name="nextUri" value={nextUri ?? ""} />
            <br />
            <ButtonGroup />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-processing-statement/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default CatchAdded;
