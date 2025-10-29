import * as React from "react";
import { type LoaderFunction, redirect, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { Fragment, useEffect } from "react";
import setApiMock from "tests/msw/helpers/setApiMock";
import { ErrorMessage, formatAddress } from "~/components";
import {
  getBearerTokenForRequest,
  getProcessingStatement,
  getExporterDetailsFromMongo,
  instanceOfUnauthorised,
  hasRequiredDataProcessingStatementSummary,
  createCSRFToken,
} from "~/.server";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { hasExporterAddressBeenUpdated, scrollToId } from "~/helpers";
import type {
  Exporter,
  ProcessingStatement,
  IUnauthorised,
  IExporter,
  Catch,
  IError,
  ProcessingStatementProduct,
} from "~/types";
import isEmpty from "lodash/isEmpty";
import lowerCase from "lodash/lowerCase";
import { useTranslation } from "react-i18next";
import { useScrollOnPageLoad } from "~/hooks";
import { useNavigation } from "react-router-dom";
import { CheckInfoExporterDetails, CheckYourInformationLayout } from "~/composite-components";
import { getSessionFromRequest } from "~/sessions.server";
import { json } from "~/communication.server";
import { CheckYourInformationPSSDAction } from "~/models";

type loaderDataProps = {
  documentNumber: string;
  processingStatement: ProcessingStatement;
  exporter: IExporter;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  const exporter: IExporter = await getExporterDetailsFromMongo(bearerToken, documentNumber, "processingStatement");

  if (!hasRequiredDataProcessingStatementSummary(exporter?.model, processingStatement)) {
    return redirect(`/create-processing-statement/${documentNumber}/progress`);
  }

  return json(
    {
      documentNumber,
      processingStatement,
      exporter,
      csrf,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  CheckYourInformationPSSDAction(request, params, "processingStatement");

const CheckYourInformation = () => {
  const { t } = useTranslation(["common", "pscheckYourInformation"]);
  const { documentNumber, processingStatement, exporter, csrf } = useLoaderData<loaderDataProps>();
  const errors: IError[] = useActionData<IError[]>() ?? [];
  const hasErrors: boolean = Array.isArray(errors) && errors?.length > 0;
  const notificationMessages: string[] = [];
  const exporterDetails: Exporter = (exporter?.model as Exporter) ?? {};
  const navigation = useNavigation();

  if (hasExporterAddressBeenUpdated(exporterDetails)) {
    notificationMessages.push(t("commonSummaryPageNotificationBannerMessage0"));
  }

  const hasNotifications: boolean = Array.isArray(notificationMessages) && notificationMessages.length > 0;

  const checkIfErrorExist: (errorObj: IError[], value: string) => boolean = (errsArray: IError[], value: string) =>
    Array.isArray(errsArray) && errsArray?.some((key: IError) => Object.values(key).includes(value));

  const getErrorMessage: (key: string) => string = (key: string) =>
    errors?.find((error: IError) => error.key === key)?.message ?? "";

  useScrollOnPageLoad();
  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <CheckYourInformationLayout
      hasNotifications={hasNotifications}
      documentNumber={documentNumber}
      notificationMessages={notificationMessages}
      hasErrors={hasErrors}
      errors={errors}
      backUrl={"/create-processing-statement/:documentNumber/what-export-destination"}
      summaryHeading="psSummaryPageHeading"
      headingTranslation="psCheckYourInformation"
      checkInformationHeader="psSummaryPageDocumentDetailsHeader"
      csrf={csrf}
    >
      <>
        <CheckInfoExporterDetails
          checkExporterDetailsHeader={t("psProgressPageExporterDetails", { ns: "psCheckYourInformation" })}
          exporterDetails={exporterDetails}
          companyNameTitle={t("commonAddExporterDetailsCompanyName", { ns: "common" })}
          changeLinkText={t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
          companyAddress={t("commonSummaryPageExporterCompanyAddress", { ns: "checkYourInformation" })}
          exporterDetailsRoute="/create-processing-statement/:documentNumber/add-exporter-details"
          checkInfoRoute="/create-processing-statement/:documentNumber/check-your-information"
          summaryPageChangeText={t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
          documentNumber={documentNumber}
        />

        <h2 className="govuk-heading-l">{t("psSummaryPageConsignmentHeader", { ns: "psCheckYourInformation" })}</h2>
        <div
          id="dateValidationError"
          className={
            checkIfErrorExist(errors, "dateValidationError")
              ? "govuk-form-group govuk-form-group--error"
              : "govuk-form-group"
          }
        >
          {checkIfErrorExist(errors, "dateValidationError") && (
            <ErrorMessage
              text={t(getErrorMessage("dateValidationError"), { ns: "errorsText" })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <dl className="govuk-summary-list govuk-!-margin-bottom-5">
            {Array.isArray(processingStatement?.products) && processingStatement?.products.length > 0 ? (
              processingStatement?.products.map((p: ProcessingStatementProduct, index: number) => (
                <Fragment key={`processing-${p.id}`}>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key govuk-!-width-one-half">
                      {t("psSummaryPageConsignmentCommodityCode", { ns: "psCheckYourInformation" })}
                    </dt>
                    <dd className="govuk-summary-list__value">{p.commodityCode}</dd>
                    <dd className="govuk-summary-list__actions">
                      {
                        <a
                          id={`productCommodityCodeChangeLink-${index}`}
                          className="govuk-link"
                          href={`/create-processing-statement/${documentNumber}/add-consignment-details/${index}?nextUri=${route(
                            "/create-processing-statement/:documentNumber/check-your-information",
                            {
                              documentNumber,
                            }
                          )}#commodityCode`}
                        >
                          {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                        </a>
                      }
                    </dd>
                  </div>
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key govuk-!-width-one-half">
                      {t("psSummaryPageConsignmentProductDescription", { ns: "psCheckYourInformation" })}
                    </dt>
                    <dd className="govuk-summary-list__value">{p.description}</dd>
                    <dd className="govuk-summary-list__actions">
                      {
                        <a
                          id={`productDescriptionChangeLink-${index}`}
                          className="govuk-link"
                          href={`/create-processing-statement/${documentNumber}/add-consignment-details/${index}?nextUri=${route(
                            "/create-processing-statement/:documentNumber/check-your-information",
                            {
                              documentNumber,
                            }
                          )}#consignmentDescription`}
                        >
                          {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                        </a>
                      }
                    </dd>
                  </div>
                </Fragment>
              ))
            ) : (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("psSummaryPageConsignmentDesc", { ns: "psCheckYourInformation" })}
                </dt>
                <dd className="govuk-summary-list__value">{processingStatement?.consignmentDescription}</dd>
                <dd className="govuk-summary-list__actions">
                  {
                    <a
                      id="consignmentDescriptionChangeLink"
                      className="govuk-link"
                      href={`/create-processing-statement/${documentNumber}/add-consignment-details?nextUri=${route(
                        "/create-processing-statement/:documentNumber/check-your-information",
                        {
                          documentNumber,
                        }
                      )}#consignmentDescription`}
                    >
                      {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                    </a>
                  }
                </dd>
              </div>
            )}
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key govuk-!-width-one-half">
                {t("psSummaryPageConsignmentHealthCertNumber", { ns: "psCheckYourInformation" })}
              </dt>
              <dd className="govuk-summary-list__value">{processingStatement?.healthCertificateNumber}</dd>
              <dd className="govuk-summary-list__actions">
                {
                  <a
                    id="healthCertificateNumberChangeLink"
                    className="govuk-link"
                    href={`${route("/create-processing-statement/:documentNumber/add-health-certificate", {
                      documentNumber,
                    })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                      documentNumber,
                    })}#healthCertificateNumber`}
                  >
                    {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                  </a>
                }
              </dd>
            </div>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key govuk-!-width-one-half">
                {t("psSummaryPageConsignmentHealthCertDate", { ns: "psCheckYourInformation" })}
              </dt>
              <dd className="govuk-summary-list__value">{processingStatement?.healthCertificateDate}</dd>
              <dd className="govuk-summary-list__actions">
                {
                  <a
                    id="healthCertificateDateChangeLink"
                    className="govuk-link"
                    href={`${route("/create-processing-statement/:documentNumber/add-health-certificate", {
                      documentNumber,
                    })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                      documentNumber,
                    })}#healthCertificateDate`}
                  >
                    {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                  </a>
                }
              </dd>
            </div>
          </dl>
        </div>
        <h2 className="govuk-heading-l">{t("psSummaryPageCatchesHeader", { ns: "psCheckYourInformation" })}</h2>
        {Array.isArray(processingStatement?.catches) &&
          processingStatement.catches.length > 0 &&
          processingStatement.catches.map((catchRecord: Catch, index: number) => (
            <div
              key={`processing-catches-${catchRecord._id}`}
              id={`catches-${index}-catchCertificateNumber`}
              className={
                checkIfErrorExist(errors, `catches-${index}-catchCertificateNumber`)
                  ? "govuk-form-group govuk-form-group--error"
                  : "govuk-form-group"
              }
            >
              {checkIfErrorExist(errors, `catches-${index}-catchCertificateNumber`) && (
                <ErrorMessage
                  text={t(getErrorMessage(`catches-${index}-catchCertificateNumber`), { ns: "errorsText" })}
                  visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                />
              )}
              <dl className="govuk-summary-list govuk-!-margin-bottom-5">
                {catchRecord.catchCertificateType ? (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key govuk-!-width-one-half">
                      {t("psSummaryPageWasCCissued", { ns: "psCheckYourInformation" })}
                    </dt>
                    <dd className="govuk-summary-list__value">
                      {catchRecord.catchCertificateType === "uk"
                        ? t("commonThereIs", { ns: "common" })
                        : t("commonThereIsNot", { ns: "common" })}
                    </dd>
                    <dd className="govuk-summary-list__actions">
                      {
                        <a
                          id={`catch-certificate-type-${index}-change-link`}
                          className="govuk-link"
                          href={`/create-processing-statement/${documentNumber}/add-catch-type/${catchRecord._id}?nextUri=${route(
                            "/create-processing-statement/:documentNumber/check-your-information",
                            {
                              documentNumber,
                            }
                          )}#catches-catchCertificateType`}
                        >
                          {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                          <span className="govuk-visually-hidden">
                            {lowerCase(t("commonAddExporterDetailsCompanyName", { ns: "common" }))}
                          </span>
                        </a>
                      }
                    </dd>
                  </div>
                ) : null}
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageCatchesHiddenTextSpecies", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{catchRecord.species}</dd>
                  <dd className="govuk-summary-list__actions">
                    {
                      <a
                        id={`species${index}ChangeLink`}
                        className="govuk-link"
                        href={`/create-processing-statement/${documentNumber}/add-catch-type/${catchRecord._id}?nextUri=${route(
                          "/create-processing-statement/:documentNumber/check-your-information",
                          {
                            documentNumber,
                          }
                        )}#catches-species`}
                      >
                        {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                        <span className="govuk-visually-hidden">
                          {lowerCase(t("commonAddExporterDetailsCompanyName", { ns: "common" }))}
                        </span>
                      </a>
                    }
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageCatchesCatchCertNumber", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{catchRecord.catchCertificateNumber}</dd>
                  <dd className="govuk-summary-list__actions">
                    {
                      <a
                        id={`catchCertificateNumber${index}ChangeLink`}
                        className="govuk-link"
                        href={`/create-processing-statement/${documentNumber}/add-catch-details/${catchRecord.speciesCode}/${index}?catchType=${catchRecord.catchCertificateType}&pageNo=1&nextUri=${route(
                          "/create-processing-statement/:documentNumber/check-your-information",
                          {
                            documentNumber,
                          }
                        )}#catches-${index}-catchCertificateNumber`}
                      >
                        {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                        <span className="govuk-visually-hidden">
                          {lowerCase(t("commonAddExporterDetailsCompanyName", { ns: "common" }))}
                        </span>
                      </a>
                    }
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageCatchesTotalWeight", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{catchRecord.totalWeightLanded}kg</dd>
                  <dd className="govuk-summary-list__actions">
                    {
                      <a
                        id={`totalWeightLanded${index}ChangeLink`}
                        className="govuk-link"
                        href={`/create-processing-statement/${documentNumber}/add-catch-details/${catchRecord.speciesCode}/${index}?catchType=${catchRecord.catchCertificateType}&pageNo=1&nextUri=${route(
                          "/create-processing-statement/:documentNumber/check-your-information",
                          {
                            documentNumber,
                          }
                        )}#catches-${index}-totalWeightLanded`}
                      >
                        {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                        <span className="govuk-visually-hidden">
                          {lowerCase(t("commonAddExporterDetailsCompanyName", { ns: "common" }))}
                        </span>
                      </a>
                    }
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageCatchesWeightBefore", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{catchRecord.exportWeightBeforeProcessing}kg</dd>
                  <dd className="govuk-summary-list__actions">
                    {
                      <a
                        id={`exportWeightBeforeProcessing${index}ChangeLink`}
                        className="govuk-link"
                        href={`/create-processing-statement/${documentNumber}/add-catch-details/${catchRecord.speciesCode}/${index}?catchType=${catchRecord.catchCertificateType}&pageNo=1&nextUri=${route(
                          "/create-processing-statement/:documentNumber/check-your-information",
                          {
                            documentNumber,
                          }
                        )}#catches-${index}-exportWeightBeforeProcessing`}
                      >
                        {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                        <span className="govuk-visually-hidden">
                          {lowerCase(t("commonAddExporterDetailsCompanyName", { ns: "common" }))}
                        </span>
                      </a>
                    }
                  </dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageCatchesWeightAfter", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{catchRecord.exportWeightAfterProcessing}kg</dd>
                  <dd className="govuk-summary-list__actions">
                    {
                      <a
                        id={`exportWeightAfterProcessing${index}ChangeLink`}
                        className="govuk-link"
                        href={`/create-processing-statement/${documentNumber}/add-catch-details/${catchRecord.speciesCode}/${index}?catchType=${catchRecord.catchCertificateType}&pageNo=1&nextUri=${route(
                          "/create-processing-statement/:documentNumber/check-your-information",
                          {
                            documentNumber,
                          }
                        )}#catches-${index}-exportWeightAfterProcessing`}
                      >
                        {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                        <span className="govuk-visually-hidden">
                          {lowerCase(t("commonAddExporterDetailsCompanyName", { ns: "common" }))}
                        </span>
                      </a>
                    }
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        <h2 className="govuk-heading-l">{t("psSummaryPagePlantHeader", { ns: "psCheckYourInformation" })}</h2>
        <dl className="govuk-summary-list govuk-!-margin-bottom-5">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPagePlantPersonResponsible", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{processingStatement?.personResponsibleForConsignment}</dd>
            <dd className="govuk-summary-list__actions">
              {
                <a
                  id="personResponsibleForConsignmentChangeLink"
                  className="govuk-link"
                  href={`${route("/create-processing-statement/:documentNumber/add-processing-plant-details", {
                    documentNumber,
                  })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                    documentNumber,
                  })}#personResponsibleForConsignment`}
                >
                  {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                </a>
              }
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPagePlantApprovalNumber", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{processingStatement.plantApprovalNumber}</dd>
            <dd className="govuk-summary-list__actions">
              {
                <a
                  id="plantApprovalNumberChangeLink"
                  className="govuk-link"
                  href={`${route("/create-processing-statement/:documentNumber/add-processing-plant-details", {
                    documentNumber,
                  })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                    documentNumber,
                  })}#plantApprovalNumber`}
                >
                  {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                </a>
              }
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPagePlantName", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{processingStatement?.plantName}</dd>
            <dd className="govuk-summary-list__actions">
              {
                <a
                  id="plantNameChangeLink"
                  className="govuk-link"
                  href={`${route("/create-processing-statement/:documentNumber/add-processing-plant-address", {
                    documentNumber,
                  })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                    documentNumber,
                  })}#plantName`}
                >
                  {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                </a>
              }
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPagePlantAddress", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">
              {formatAddress(
                processingStatement?.plantAddressOne,
                processingStatement?.plantTownCity,
                processingStatement?.plantPostcode
              )}
            </dd>
            <dd className="govuk-summary-list__actions">
              {
                <a
                  id="plantAddressChangeLink"
                  className="govuk-link"
                  href={`${route("/create-processing-statement/:documentNumber/add-processing-plant-address", {
                    documentNumber,
                  })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                    documentNumber,
                  })}#consignmentPlantAddress`}
                >
                  {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                  <span className="govuk-visually-hidden">
                    {" "}
                    {lowerCase(t("commonSummaryPageExporterCompanyAddress", { ns: "checkYourInformation" }))}
                  </span>
                </a>
              }
            </dd>
          </div>
        </dl>
        <h2 className="govuk-heading-l">{t("psSummaryPageTransportDetails", { ns: "psCheckYourInformation" })}</h2>
        <dl className="govuk-summary-list govuk-!-margin-bottom-5">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPageTransportDestination", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{processingStatement?.exportedTo?.officialCountryName}</dd>
            <dd className="govuk-summary-list__actions">
              {
                <a
                  id="exportToChangeLink"
                  className="govuk-link"
                  href={`${route("/create-processing-statement/:documentNumber/what-export-destination", {
                    documentNumber,
                  })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                    documentNumber,
                  })}#exportDestinationInput`}
                >
                  {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                </a>
              }
            </dd>
          </div>
        </dl>

        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            {t("psSummaryPageWarning", { ns: "psCheckYourInformation" })}
          </strong>
        </div>
        <Button
          className="govuk-button govuk-button--start"
          label={t("psSummaryPageMainCreateBtn", { ns: "psCheckYourInformation" })}
          type={BUTTON_TYPE.SUBMIT}
          data-module="govuk-button"
          name="_action"
          //@ts-ignore
          value="createProcessingStatement"
          data-testid="create-ps-button"
          disabled={navigation.state === "submitting"}
        />
      </>
    </CheckYourInformationLayout>
  );
};

export default CheckYourInformation;
