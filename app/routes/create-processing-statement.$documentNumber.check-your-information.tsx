import * as React from "react";
import { type LoaderFunction, redirect, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { useEffect } from "react";
import setApiMock from "tests/msw/helpers/setApiMock";
import { formatAddress } from "~/components";
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
import type { Exporter, ProcessingStatement, IUnauthorised, IExporter, IError, Catch } from "~/types";
import isEmpty from "lodash/isEmpty";
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
  const csrf = await createCSRFToken(request);
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

const getProcessedProducts = (processingStatement: ProcessingStatement) => {
  const { catches, products } = processingStatement;
  const result = products?.map((product) => {
    const matchingCatches = catches?.filter((catchItem: Catch) => catchItem.productId === product.id);
    return {
      ...product,
      catches: matchingCatches,
    };
  });
  return result;
};

const CheckYourInformation = () => {
  const { t } = useTranslation(["common", "pscheckYourInformation"]);
  const { documentNumber, processingStatement, exporter, csrf } = useLoaderData<loaderDataProps>();

  const processedProducts = getProcessedProducts(processingStatement);
  const errors: IError[] = useActionData<IError[]>() ?? [];
  const hasErrors: boolean = Array.isArray(errors) && errors?.length > 0;
  const notificationMessages: string[] = [];
  const exporterDetails: Exporter = (exporter?.model as Exporter) ?? {};
  const navigation = useNavigation();

  if (hasExporterAddressBeenUpdated(exporterDetails)) {
    notificationMessages.push(t("commonSummaryPageNotificationBannerMessage0"));
  }

  const hasNotifications: boolean = Array.isArray(notificationMessages) && notificationMessages.length > 0;

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
      journey="processingStatement"
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
          documentNumber={documentNumber}
        />
        <h2 className="govuk-heading-l">{t("psSummaryPageProcessedProducts", { ns: "psCheckYourInformation" })}</h2>
        {processedProducts?.map((product, index) => (
          <div key={product.id}>
            <div className="govuk-inset-text">
              <p>{`${t("psSummaryPageConsignmentItem", { ns: "psCheckYourInformation" })} ${index + 1}`}</p>
            </div>
            <dl className="govuk-summary-list govuk-!-margin-bottom-5">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("psSummaryPageProductDescription", { ns: "psCheckYourInformation" })}
                </dt>
                <dd className="govuk-summary-list__value">{product.description}</dd>
                <dd className="govuk-summary-list__actions">
                  {
                    <a
                      id="consignmentDescriptionChangeLink"
                      className="govuk-link"
                      href={`/create-processing-statement/${documentNumber}/add-consignment-details/${product.id}?nextUri=${route(
                        "/create-processing-statement/:documentNumber/check-your-information",
                        {
                          documentNumber,
                        }
                      )}`}
                    >
                      {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                    </a>
                  }
                </dd>
              </div>
            </dl>
            {product?.catches?.map((catchItem) => (
              <dl key={catchItem.id} className="govuk-summary-list govuk-!-margin-bottom-5">
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {" "}
                    {t("psSummaryPageCommodityCode", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{product.commodityCode}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {" "}
                    {t("psSummaryPageSpecies", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{`${catchItem.species} (${catchItem.speciesCode})`}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {" "}
                    {t("psSummaryPageCertificateIssuedInTheUK", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {catchItem.catchCertificateType === "uk" ? "Yes" : "No"}
                  </dd>
                </div>
                {catchItem.catchCertificateType === "non_uk" && catchItem.issuingCountry && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key govuk-!-width-one-half">
                      {t("psSummaryPageIssuingCountry", { ns: "psCheckYourInformation" })}
                    </dt>
                    <dd className="govuk-summary-list__value">{catchItem.issuingCountry.officialCountryName}</dd>
                  </div>
                )}
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageCatchCertificate", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{catchItem.catchCertificateNumber}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageCatchCertificateWeight", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{`${catchItem.totalWeightLanded}kg`}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageExportWeightBeforeProcessing", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{`${catchItem.exportWeightBeforeProcessing}kg`}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key govuk-!-width-one-half">
                    {t("psSummaryPageExportWeightAfterProcessing", { ns: "psCheckYourInformation" })}
                  </dt>
                  <dd className="govuk-summary-list__value">{`${catchItem.exportWeightAfterProcessing}kg`}</dd>
                </div>
                <div className="govuk-!-margin-bottom-5"></div>
              </dl>
            ))}
          </div>
        ))}

        <h2 className="govuk-heading-l">{t("psSummaryPagePlantHeader", { ns: "psCheckYourInformation" })}</h2>
        <dl className="govuk-summary-list govuk-!-margin-bottom-5">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPageProcessingPlantName", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{processingStatement?.plantName}</dd>
            <dd className="govuk-summary-list__actions">
              {
                <a
                  id="plantNameChangeLink"
                  className="govuk-link"
                  href={`${route("/create-processing-statement/:documentNumber/add-processing-plant-details", {
                    documentNumber,
                  })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                    documentNumber,
                  })}`}
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
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPagePlantPersonResponsible", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{processingStatement?.personResponsibleForConsignment}</dd>
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
          </div>
        </dl>
        <h2 className="govuk-heading-l">{t("psSummaryPageTransportDetails", { ns: "psCheckYourInformation" })}</h2>
        <dl className="govuk-summary-list govuk-!-margin-bottom-5">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPageConfirmationExportHealthCertificate", { ns: "psCheckYourInformation" })}
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
                  })}`}
                >
                  {t("psSummaryPageChangeLinkText", { ns: "psCheckYourInformation" })}
                </a>
              }
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPageConfirmationIssueDate", { ns: "psCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{processingStatement?.healthCertificateDate}</dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("psSummaryPageConfirmationDestinationCountry", { ns: "psCheckYourInformation" })}
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
                  })}`}
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
        <div>
          <h2 className="govuk-heading-l">{t("psSummaryPageProcessingStatement", { ns: "psCheckYourInformation" })}</h2>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <div>
                <p>{t("psSummaryPageConfirmationText", { ns: "psCheckYourInformation" })}</p>
                <ul className="govuk-list govuk-list--bullet">
                  <li>{t("psSummaryPageConfirmationTextPointOne", { ns: "psCheckYourInformation" })}</li>
                  <li>{t("psSummaryPageConfirmationTextPointTwo", { ns: "psCheckYourInformation" })}</li>
                  <li>{t("psSummaryPageConfirmationTextPointThree", { ns: "psCheckYourInformation" })}</li>
                </ul>
              </div>
            </div>
          </div>
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
