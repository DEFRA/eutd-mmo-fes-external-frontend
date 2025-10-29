import * as React from "react";
import { type JSXElementConstructor, type ReactElement, useEffect, useState } from "react";
import { useLoaderData, useActionData, type ShouldRevalidateFunction } from "@remix-run/react";
import { type MetaFunction, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { FormInput, ErrorPosition, Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames/bind";
import isEmpty from "lodash/isEmpty";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ButtonGroup, CatchDetailsTable } from "~/composite-components";
import type { TFunction } from "i18next";
import type { Catch, pageLinks, ErrorResponse } from "~/types";
import { displayErrorTransformedMessages, getMeta, scrollToId } from "~/helpers";
import { useHydrated } from "remix-utils/use-hydrated";
import { AddCatchDetailsAction, AddCatchDetailsLoader } from "~/models";

interface ILoaderData {
  catchId: string;
  catchCertificateNumber: string;
  totalWeightLanded: string;
  exportWeightBeforeProcessing: string;
  exportWeightAfterProcessing: string;
  documentNumber: string;
  speciesExemptLink: string;
  species?: Catch;
  catchIndex: number;
  nextUri?: string;
  speciesSelected: string;
  speciesCode: string;
  specieCode: string;
  catches: Catch[];
  totalRecords: number;
  prevLink: number;
  nextLink: number;
  isLastPage: boolean;
  isFirstPage: boolean;
  isEditing?: boolean;
  lang?: string;
  totalPages: number;
  catchCertificateType?: string;
  pageNo: number;
  csrf: string;
}

export const meta: MetaFunction = ({ data }) => getMeta(data);

export const loader: LoaderFunction = async ({ request, params }) => AddCatchDetailsLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  AddCatchDetailsAction(request, params);

export const shouldRevalidate: ShouldRevalidateFunction = ({ actionResult, defaultShouldRevalidate }) => {
  if (actionResult) return isEmpty(actionResult.errors);

  return defaultShouldRevalidate;
};
const getTitleTranslationKey = (isForUKCatchCertificate: boolean) =>
  isForUKCatchCertificate ? "psAddCatchDetailsHeadingUk" : "psAddCatchDetailsHeading";
const getCatchCertificateNumberHintTextTranslationKey = (isForUKCatchCertificate: boolean) =>
  isForUKCatchCertificate ? "psAddCatchDetailsCCNumberHint" : "psAddCatchDetailsCCNumberNonUKHint";

const getCatchCertificateNumber = (
  isHydrated: boolean,
  currentCatchCertificateNumber: string,
  catchCertificateNumber: string
) => (isHydrated ? currentCatchCertificateNumber : currentCatchCertificateNumber ?? catchCertificateNumber);
const getCurrentTotalWeightLanded = (
  isHydrated: boolean,
  currentTotalWeightLanded: string,
  totalWeightLanded: string
) => (isHydrated ? currentTotalWeightLanded : currentTotalWeightLanded ?? totalWeightLanded);
const getExportWeightBeforeProcessing = (
  isHydrated: boolean,
  currentExportWeightBeforeProcessing: string,
  exportWeightBeforeProcessing: string
) =>
  isHydrated
    ? currentExportWeightBeforeProcessing
    : currentExportWeightBeforeProcessing ?? exportWeightBeforeProcessing;

const getExportWeightAfterProcessing = (
  isHydrated: boolean,
  currentExportWeightAfterProcessing: string,
  exportWeightAfterProcessing: string
) =>
  isHydrated ? currentExportWeightAfterProcessing : currentExportWeightAfterProcessing ?? exportWeightAfterProcessing;

const getCatchCertificateNumberErrorProp = (errors: any, key: string) =>
  errors?.[key]?.message ? { className: "govuk-error-message" } : {};
const getCatchCertificateNumberContainerClass = (errors: any, key: string) =>
  errors?.[key]?.message ? "govuk-form-group--error" : "";
const getCatchCertificateNumberStaticErrorMessage = (
  errors: any,
  key: string,
  t: TFunction<"translation", undefined>
) => (errors?.[key]?.message ? t(errors?.[key]?.message, { ns: "errorsText" }) : "");
const getNonUkCatchCertificateInputClassName = (errors: any, catchIndex: number) =>
  isEmpty(errors[`catches-${catchIndex}-totalWeightLanded`])
    ? "govuk-input govuk-!-width-one-half"
    : "govuk-input govuk-!-width-one-half govuk-input--error";

const getAddProductDetailsValue = (isEditing: boolean | undefined) => (isEditing ? "updateCatch" : "addCatch");
const getAddProductDetailsLabel = (isEditing: boolean | undefined) =>
  isEditing ? "psUpdateCatchWeightsButtonLabel" : "psAddCatchWeightsButtonLabel";

const AddCatchDetails = () => {
  const { t } = useTranslation();
  const {
    documentNumber,
    catchIndex,
    nextUri,
    catches,
    totalRecords,
    isEditing,
    speciesSelected,
    speciesCode,
    catchId,
    catchCertificateNumber,
    totalWeightLanded,
    exportWeightBeforeProcessing,
    exportWeightAfterProcessing,
    specieCode,
    nextLink,
    prevLink,
    isFirstPage,
    isLastPage,
    lang,
    pageNo,
    totalPages,
    catchCertificateType,
    csrf,
  } = useLoaderData<ILoaderData>();
  const { errors = {}, response } = useActionData() ?? {};
  const [currentCatchCertificateNumber, setCurrentCatchCertificateNumber] = useState<string>("");
  const [currentTotalWeightLanded, setCurrentTotalWeightLanded] = useState<string>("");
  const [currentExportWeightBeforeProcessing, setCurrentExportWeightBeforeProcessing] = useState<string>("");
  const [currentExportWeightAfterProcessing, setCurrentExportWeightAfterProcessing] = useState<string>("");

  const isForUKCatchCertificate = catchCertificateType === "uk";
  const ccNumberKey = `catches-${catchIndex}-catchCertificateNumber`;

  const isHydrated = useHydrated();

  const previousLinkLayout = (
    <a
      className="govuk-link govuk-pagination__link"
      href={`/create-processing-statement/${documentNumber}/add-catch-details/${specieCode}?catchType=${isForUKCatchCertificate ? "uk" : "non_uk"}&pageNo=${prevLink}`}
      rel="next"
      data-testid="previous-link"
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
  );
  const nextLinkLayout = (
    <a
      className="govuk-link govuk-pagination__link"
      href={`/create-processing-statement/${documentNumber}/add-catch-details/${specieCode}/?catchType=${isForUKCatchCertificate ? "uk" : "non_uk"}&pageNo=${nextLink}`}
      rel="previous"
      data-testid="next-link"
    >
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
    </a>
  );
  const populateNavigationLinks = (
    previousLinkLayout: ReactElement<any, string | JSXElementConstructor<any>>,
    nextLinkLayout: ReactElement<any, string | JSXElementConstructor<any>>
  ): pageLinks => ({
    previousLink: () => previousLinkLayout,
    nextLink: () => nextLinkLayout,
  });

  const navigationLinks = populateNavigationLinks(previousLinkLayout, nextLinkLayout);

  useEffect(() => {
    if (isEmpty(errors) && lang === null) {
      setCurrentCatchCertificateNumber(catchCertificateNumber || "");
      setCurrentTotalWeightLanded(totalWeightLanded || "");
      setCurrentExportWeightBeforeProcessing(exportWeightBeforeProcessing || "");
      setCurrentExportWeightAfterProcessing(exportWeightAfterProcessing || "");
    }
  }, [catchCertificateNumber, totalWeightLanded, exportWeightBeforeProcessing, exportWeightAfterProcessing]);

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useEffect(() => {
    if (response) {
      setCurrentCatchCertificateNumber(response.catchCertificateNumber);
      setCurrentTotalWeightLanded(response.totalWeightLanded);
      setCurrentExportWeightBeforeProcessing(response.exportWeightBeforeProcessing);
      setCurrentExportWeightAfterProcessing(response.exportWeightAfterProcessing);
    }
  }, [response]);

  const onCancel = () => {
    setCurrentCatchCertificateNumber("");
    setCurrentTotalWeightLanded("");
    setCurrentExportWeightBeforeProcessing("");
    setCurrentExportWeightAfterProcessing("");
  };

  // FI0-7801 - Scenario 3 - Add Catch type page going back with at least 1 catch added
  return (
    <Main backUrl={`/create-processing-statement/${documentNumber}/add-consignment-details`}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div id="event-name-hint" className="govuk-hint">
            {speciesSelected}
          </div>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm
            method="post"
            action={`/create-processing-statement/${documentNumber}/add-catch-details/${speciesCode}?catchType=${catchCertificateType}&pageNo=1`}
            csrf={csrf}
          >
            <fieldset className="govuk-!-width-two-thirds govuk-fieldset">
              <legend className="govuk-fieldset__legend">
                <Title title={`${t(getTitleTranslationKey(isForUKCatchCertificate), { ns: "psAddCatchDetails" })}`} />
              </legend>
              <FormInput
                containerClassName="govuk-form-group"
                label={t("commonCatchCertificateNumber")}
                name="catchCertificateNumber"
                type="text"
                value={getCatchCertificateNumber(isHydrated, currentCatchCertificateNumber, catchCertificateNumber)}
                hint={{
                  id: `hint-catches-${catchIndex}-catchCertificateNumber`,
                  position: "above",
                  text: `${t(getCatchCertificateNumberHintTextTranslationKey(isForUKCatchCertificate), {
                    ns: "psAddCatchDetails",
                  })}`,
                  className: "govuk-hint govuk-!-margin-bottom-2",
                }}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                inputClassName={classNames("govuk-input govuk-!-width-full", {
                  "govuk-input--error": errors?.[ccNumberKey]?.message,
                })}
                inputProps={{
                  id: `catches-${catchIndex}-catchCertificateNumber`,
                  "aria-describedby": `hint-catches-${catchIndex}-catchCertificateNumber`,
                }}
                labelProps={{ htmlFor: `catches-${catchIndex}-catchCertificateNumber` }}
                errorProps={getCatchCertificateNumberErrorProp(errors, ccNumberKey)}
                staticErrorMessage={getCatchCertificateNumberStaticErrorMessage(errors, ccNumberKey, t)}
                errorPosition={ErrorPosition.AFTER_LABEL}
                containerClassNameError={getCatchCertificateNumberContainerClass(errors, ccNumberKey)}
                onChange={(e) => setCurrentCatchCertificateNumber(e.currentTarget.value)}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
              {!isForUKCatchCertificate && (
                <FormInput
                  containerClassName="govuk-form-group govuk-!-margin-bottom-2"
                  inputClassName={getNonUkCatchCertificateInputClassName(errors, catchIndex)}
                  label={t("psAddCatchWeightsTotalWeightOnCatchCertificate", { ns: "addCatchWeights" })}
                  name={`totalWeightLanded`}
                  value={getCurrentTotalWeightLanded(isHydrated, currentTotalWeightLanded, totalWeightLanded)}
                  type="text"
                  inputProps={{
                    id: `catches-${catchIndex}-totalWeightLanded`,
                  }}
                  labelProps={{ htmlFor: `catches-${catchIndex}-totalWeightLanded` }}
                  errorProps={{
                    className: !isEmpty(errors["catches-0-totalWeightLanded"]) ? "govuk-error-message" : "",
                  }}
                  staticErrorMessage={
                    !isEmpty(errors[`catches-${catchIndex}-totalWeightLanded`])
                      ? t(errors[`catches-${catchIndex}-totalWeightLanded`]?.message, { ns: "errorsText" })
                      : ""
                  }
                  errorPosition={ErrorPosition.AFTER_LABEL}
                  containerClassNameError={
                    !isEmpty(errors[`catches-${catchIndex}-totalWeightLanded`]) ? "govuk-form-group--error" : ""
                  }
                  onChange={(e) => setCurrentTotalWeightLanded(e.currentTarget.value)}
                  hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                  hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                />
              )}
              <FormInput
                containerClassName="govuk-form-group"
                label={t("psAddCatchWeightsExportWeightBeforeProcessing", { ns: "addCatchWeights" })}
                name="exportWeightBeforeProcessing"
                type="text"
                labelClassName="govuk-!-display-block"
                value={getExportWeightBeforeProcessing(
                  isHydrated,
                  currentExportWeightBeforeProcessing,
                  exportWeightBeforeProcessing
                )}
                inputClassName={
                  isEmpty(errors[`catches-${catchIndex}-exportWeightBeforeProcessing`])
                    ? "govuk-input govuk-!-width-one-half"
                    : "govuk-input govuk-!-width-one-half govuk-input--error"
                }
                inputProps={{
                  id: `catches-${catchIndex}-exportWeightBeforeProcessing`,
                }}
                labelProps={{ htmlFor: `catches-${catchIndex}-exportWeightBeforeProcessing` }}
                errorProps={{
                  className: !isEmpty(errors[`catches-${catchIndex}-exportWeightBeforeProcessing`])
                    ? "govuk-error-message"
                    : "",
                }}
                staticErrorMessage={
                  !isEmpty(errors[`catches-${catchIndex}-exportWeightBeforeProcessing`])
                    ? t(errors[`catches-${catchIndex}-exportWeightBeforeProcessing`]?.message, { ns: "errorsText" })
                    : ""
                }
                errorPosition={ErrorPosition.AFTER_LABEL}
                containerClassNameError={
                  !isEmpty(errors[`catches-${catchIndex}-exportWeightBeforeProcessing`])
                    ? "govuk-form-group--error"
                    : ""
                }
                onChange={(e) => setCurrentExportWeightBeforeProcessing(e.currentTarget.value)}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
              <FormInput
                containerClassName="govuk-form-group"
                label={t("psAddCatchWeightsExportWeightAfterProcessing", { ns: "addCatchWeights" })}
                name={`exportWeightAfterProcessing`}
                type="text"
                value={getExportWeightAfterProcessing(
                  isHydrated,
                  currentExportWeightAfterProcessing,
                  exportWeightAfterProcessing
                )}
                inputClassName={
                  isEmpty(errors[`catches-${catchIndex}-exportWeightAfterProcessing`])
                    ? "govuk-input govuk-!-width-one-half"
                    : "govuk-input govuk-!-width-one-half govuk-input--error"
                }
                hint={{
                  id: `hint-catches-${catchIndex}-exportWeightAfterProcessing`,
                  position: "above",
                  text: t("psAddCatchWeightsExportWeightAfterProcessingHint", { ns: "addCatchWeights" }),
                  className: "govuk-hint govuk-!-margin-bottom-0 govuk-!-width-one-half",
                }}
                inputProps={{
                  id: `catches-${catchIndex}-exportWeightAfterProcessing`,
                  "aria-describedby": `hint-catches-${catchIndex}-exportWeightAfterProcessing`,
                }}
                labelProps={{ htmlFor: `catches-${catchIndex}-exportWeightAfterProcessing` }}
                errorProps={{
                  className: !isEmpty(errors[`catches-${catchIndex}-exportWeightAfterProcessing`])
                    ? "govuk-error-message"
                    : "",
                }}
                staticErrorMessage={
                  !isEmpty(errors[`catches-${catchIndex}-exportWeightAfterProcessing`])
                    ? t(errors[`catches-${catchIndex}-exportWeightAfterProcessing`]?.message, { ns: "errorsText" })
                    : ""
                }
                errorPosition={ErrorPosition.AFTER_LABEL}
                containerClassNameError={
                  !isEmpty(errors[`catches-${catchIndex}-exportWeightAfterProcessing`]) ? "govuk-form-group--error" : ""
                }
                onChange={(e) => setCurrentExportWeightAfterProcessing(e.currentTarget.value)}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
            </fieldset>
            <div className="govuk-button-group">
              <Button
                id="cancel"
                label={t("commonCancelButtonCancelButtonText", { ns: "common" })}
                className="govuk-button govuk-button--secondary"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                // @ts-ignore
                value="cancelCatch"
                data-testid="cancel-button"
                onClick={onCancel}
              />
              <Button
                id="addProductDetails"
                label={t(getAddProductDetailsLabel(isEditing), { ns: "addCatchWeights" })}
                className="govuk-button"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                value={getAddProductDetailsValue(isEditing)}
                // @ts-ignore
                data-testid="add-product-details"
              />
            </div>
            <div className="govuk-!-width-full-width">
              <CatchDetailsTable
                isForUKCatchCertificate={isForUKCatchCertificate}
                catches={catches}
                species={speciesSelected}
                documentNumber={documentNumber}
                onClickHandler={() => scrollToId("catchDetails")}
                navigationLinks={navigationLinks}
                totalRecords={totalRecords}
                totalPages={totalPages}
                specieCode={specieCode}
                isFirstPage={isFirstPage}
                isLastPage={isLastPage}
                pageNo={pageNo}
              />
            </div>
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
            <input type="hidden" name="catchId" value={catchId} />
            <input type="hidden" name="pageNo" value={pageNo} />
            <input type="hidden" name="species" value={speciesSelected} />
            <input type="hidden" name="speciesCode" value={specieCode} />
            <input type="hidden" name="catchCertificateType" value={catchCertificateType} />
            <input type="hidden" name="lastAddedOrdEditedIndex" value={catchIndex} />
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

export default AddCatchDetails;
