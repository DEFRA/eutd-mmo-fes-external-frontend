import * as React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useScrollOnPageLoad } from "~/hooks";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import { formatAddress } from "~/components";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getExporterDetailsFromMongo,
  getStorageDocument,
  hasRequiredDataStorageDocumentSummary,
  instanceOfUnauthorised,
} from "~/.server";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { backUri, scrollToId, hasExporterAddressBeenUpdated } from "~/helpers";
import type {
  Exporter,
  IExporter,
  StorageDocument,
  IUnauthorised,
  StorageDocumentCatch,
  ITransport,
  IValidationError,
} from "~/types";
import { useNavigation } from "react-router-dom";
import {
  CheckInfoExporterDetails,
  StorageDocumentTransportDisplay,
  CheckYourInformationLayout,
  CheckYourInformationProductLayout,
  CheckYourInformationRow,
} from "~/composite-components";
import { getSessionFromRequest } from "~/sessions.server";
import { json } from "~/communication.server";
import { CheckYourInformationPSSDAction } from "~/models";

type loaderProps = {
  documentNumber: string;
  storageDocument: StorageDocument;
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
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  if (instanceOfUnauthorised(storageDocument)) {
    return redirect("/forbidden");
  }

  const exporter: IExporter = await getExporterDetailsFromMongo(bearerToken, documentNumber, "storageNotes");

  if (!hasRequiredDataStorageDocumentSummary(exporter?.model, storageDocument)) {
    return redirect(`/create-storage-document/${documentNumber}/progress`);
  }

  return json(
    {
      documentNumber,
      storageDocument,
      exporter,
      csrf,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  CheckYourInformationPSSDAction(request, params, "storageNotes");

const CheckYourInformation = () => {
  const { t } = useTranslation(["common", "sdCheckYourInformation", "transportation"]);
  const { documentNumber, storageDocument, exporter, csrf } = useLoaderData<loaderProps>();
  const errors: IValidationError[] = useActionData<IValidationError[]>() ?? [];
  const hasErrors: boolean = Array.isArray(errors) && errors?.length > 0;
  const notificationMessages: string[] = [];
  const exporterDetails: Exporter = exporter.model as Exporter;
  const navigation = useNavigation();
  if (hasExporterAddressBeenUpdated(exporterDetails)) {
    notificationMessages.push(t("commonSummaryPageNotificationBannerMessage0"));
  }

  const catches: StorageDocumentCatch[] = storageDocument.catches;
  const transport: ITransport = storageDocument.transport as ITransport;
  const arrivalTransport: ITransport = storageDocument.arrivalTransport as ITransport;
  const hasNotifications: boolean = Array.isArray(notificationMessages) && notificationMessages.length > 0;

  const checkIfErrorExist: (
    ctch: StorageDocumentCatch,
    validationErrors: IValidationError[]
  ) => IValidationError | undefined = (ctch: StorageDocumentCatch, validationErrors: IValidationError[]) =>
    Array.isArray(validationErrors) && validationErrors.length > 0
      ? validationErrors.find(
          (error: IValidationError) =>
            error.certificateNumber === ctch.certificateNumber && error.product === ctch.product
        )
      : undefined;

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
      backUrl={`/create-storage-document/:documentNumber/${backUri(transport, "storageNotes")}`}
      summaryHeading="sdSummaryPageHeading"
      headingTranslation="sdCheckYourInformation"
      checkInformationHeader="sdSummaryPageDocumentDetailsHeader"
      csrf={csrf}
      journey="storageNotes"
    >
      <>
        <CheckInfoExporterDetails
          checkExporterDetailsHeader={t("sdProgressPageExporterDetails", { ns: "sdCheckYourInformation" })}
          exporterDetails={exporterDetails}
          companyNameTitle={t("commonAddExporterDetailsCompanyName", { ns: "common" })}
          changeLinkText={t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
          companyAddress={t("commonSummaryPageExporterCompanyAddress", { ns: "checkYourInformation" })}
          exporterDetailsRoute="/create-storage-document/:documentNumber/add-exporter-details"
          checkInfoRoute="/create-storage-document/:documentNumber/check-your-information"
          documentNumber={documentNumber}
        />

        <h2 className="govuk-heading-l">{t("sdCheckYourInformationProudcts", { ns: "sdCheckYourInformation" })}</h2>
        {Array.isArray(catches) &&
          catches.map((ctch: StorageDocumentCatch, index: number) => {
            const catchValidationError: IValidationError | undefined = checkIfErrorExist(ctch, errors);
            return (
              <CheckYourInformationProductLayout
                catchItem={ctch}
                index={index}
                catchValidationError={catchValidationError}
                key={`catch-${ctch._id}`}
                documentNumber={documentNumber}
              />
            );
          })}
        {arrivalTransport && (
          <>
            <h2 className="govuk-heading-l">
              {t("sdCheckYourInformationArrivalAtStorageFacility", { ns: "sdCheckYourInformation" })}
            </h2>
            <dl className="govuk-summary-list govuk-!-margin-bottom-5">
              {arrivalTransport?.vehicle && (
                <CheckYourInformationRow
                  label={t("sdCheckYourInformationTransportType", { ns: "sdCheckYourInformation" })}
                  value={t(arrivalTransport?.vehicle, { ns: "transportation" })}
                  actionURL={`${route(
                    "/create-storage-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk",
                    {
                      documentNumber,
                    }
                  )}?nextUri=${route("/create-storage-document/:documentNumber/check-your-information", {
                    documentNumber,
                  })}`}
                  isActionEnabled={true}
                  t={t}
                />
              )}
              {arrivalTransport?.vehicle === "train" && (
                <StorageDocumentTransportDisplay
                  documentNumber={documentNumber}
                  transportType="trainArrival"
                  transport={arrivalTransport}
                />
              )}
              {arrivalTransport?.vehicle === "plane" && (
                <StorageDocumentTransportDisplay
                  transportType="planeArrival"
                  transport={arrivalTransport}
                  documentNumber={documentNumber}
                />
              )}
              {arrivalTransport?.vehicle === "containerVessel" && (
                <StorageDocumentTransportDisplay
                  transport={arrivalTransport}
                  transportType="containerVesselArrival"
                  documentNumber={documentNumber}
                />
              )}
              {arrivalTransport?.vehicle === "truck" && (
                <StorageDocumentTransportDisplay
                  documentNumber={documentNumber}
                  transport={arrivalTransport}
                  transportType="truckArrival"
                />
              )}
            </dl>
          </>
        )}
        <h2 className="govuk-heading-l">
          {t("sdCheckYourInformationStorageDetailsText", { ns: "sdCheckYourInformation" })}
        </h2>
        <dl
          key={`facilities-${storageDocument.facilityName}-${storageDocument.facilityPostcode}`}
          className="govuk-summary-list govuk-!-margin-bottom-5"
        >
          {storageDocument.facilityArrivalDate && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key govuk-!-width-one-half">
                {t("sdCommonFacilityFacilityArrivalDate", { ns: "sdCheckYourInformation" })}
              </dt>
              <dd className="govuk-summary-list__value">
                {moment(storageDocument.facilityArrivalDate, "DD/MM/YYYY").format("D MMMM YYYY")}
              </dd>
            </div>
          )}
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("sdCommonFacilityNameTitle", { ns: "sdCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{storageDocument.facilityName}</dd>
            <dd className="govuk-summary-list__actions">
              <a
                aria-label={t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                className="govuk-link"
                href={`/create-storage-document/${documentNumber}/add-storage-facility-details?nextUri=${route(
                  "/create-storage-document/:documentNumber/check-your-information",
                  { documentNumber }
                )}`}
              >
                {t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
              </a>
            </dd>
          </div>
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("commonAddExporterDetailsAddressContent", { ns: "sdCheckYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">
              {formatAddress(
                storageDocument?.facilityAddressOne,
                storageDocument?.facilityAddressTwo,
                storageDocument?.facilityTownCity,
                storageDocument?.facilityPostcode
              )}
            </dd>
          </div>
          {storageDocument.facilityApprovalNumber && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key govuk-!-width-one-half">
                {t("sdCheckYourInformationApprovalNumber", { ns: "sdCheckYourInformation" })}
              </dt>
              <dd className="govuk-summary-list__value">{storageDocument.facilityApprovalNumber}</dd>
              <dd className="govuk-summary-list__actions">
                <a
                  aria-label={t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                  className="govuk-link"
                  href={`/create-storage-document/${documentNumber}/add-storage-facility-approval?nextUri=${route(
                    "/create-storage-document/:documentNumber/check-your-information",
                    { documentNumber }
                  )}`}
                >
                  {t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                </a>
              </dd>
            </div>
          )}
          {storageDocument.facilityStorage && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key govuk-!-width-one-half">
                {t("sdCheckYourInformationProductStorage", { ns: "sdCheckYourInformation" })}
              </dt>
              <dd className="govuk-summary-list__value">{storageDocument.facilityStorage}</dd>
              <dd className="govuk-summary-list__actions">
                <a
                  aria-label={t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                  className="govuk-link"
                  href={`/create-storage-document/${documentNumber}/add-storage-facility-approval?nextUri=${route(
                    "/create-storage-document/:documentNumber/check-your-information",
                    { documentNumber }
                  )}`}
                >
                  {t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                </a>
              </dd>
            </div>
          )}
        </dl>
        <h2 className="govuk-heading-l">{t("commonSummaryPageTransportHeader", { ns: "sdCheckYourInformation" })}</h2>
        <dl className="govuk-summary-list govuk-!-margin-bottom-5">
          {storageDocument.transport?.vehicle && (
            <CheckYourInformationRow
              label={t("sdCheckYourInformationTransportType", { ns: "sdCheckYourInformation" })}
              value={t(storageDocument.transport?.vehicle, { ns: "transportation" })}
              actionURL={`${route("/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk", {
                documentNumber,
              })}?nextUri=${route("/create-storage-document/:documentNumber/check-your-information", {
                documentNumber,
              })}`}
              isActionEnabled={true}
              t={t}
            />
          )}
          {storageDocument.transport?.vehicle === "containerVessel" && (
            <StorageDocumentTransportDisplay
              transport={transport}
              transportType="containerVessel"
              documentNumber={documentNumber}
            />
          )}
          {storageDocument.transport?.vehicle === "plane" && (
            <StorageDocumentTransportDisplay
              transport={transport}
              transportType="plane"
              documentNumber={documentNumber}
            />
          )}
          {storageDocument.transport?.vehicle === "train" && (
            <StorageDocumentTransportDisplay
              transport={transport}
              transportType="train"
              documentNumber={documentNumber}
            />
          )}
          {storageDocument.transport?.vehicle === "truck" && transport.cmr === "true" && (
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key govuk-!-width-one-half">
                {t("doYouHaveaRoadTransportDocumentHeader", { ns: "transportation" })}
              </dt>
              <dd className="govuk-summary-list__value">{t("commonYesLabel", { ns: "common" })}</dd>
              <dd className="govuk-summary-list__actions">
                <a
                  aria-label={t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                  className="govuk-link"
                  href={`/create-storage-document/${documentNumber}/${backUri(
                    transport,
                    "storageNotes"
                  )}?nextUri=${route("/create-storage-document/:documentNumber/check-your-information", {
                    documentNumber,
                  })}`}
                >
                  {t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                </a>
              </dd>
            </div>
          )}
          {storageDocument.transport?.vehicle === "truck" && transport.cmr !== "true" && (
            <StorageDocumentTransportDisplay
              transportType="truck"
              transport={transport}
              documentNumber={documentNumber}
            />
          )}
        </dl>
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            {t("sdSummaryPageWarning", { ns: "sdCheckYourInformation" })}
          </strong>
        </div>
        <h2 className="govuk-heading-l">
          {t("sdCheckYourInformationCreateStorageDocumentHeader", { ns: "sdCheckYourInformation" })}
        </h2>
        <p className="govuk-body">
          {t("sdCheckYourInformationCreateStorageDocumentContent", { ns: "sdCheckYourInformation" })}
        </p>
        <ul className="govuk-list govuk-list--bullet govuk-list">
          <li>{t("sdCheckYourInformationCreateStorageDocumentListOne", { ns: "sdCheckYourInformation" })}</li>
          <li>{t("sdCheckYourInformationCreateStorageDocumentListTwo", { ns: "sdCheckYourInformation" })}</li>
          <li>{t("sdCheckYourInformationCreateStorageDocumentListThree", { ns: "sdCheckYourInformation" })}</li>
        </ul>
        <Button
          className="govuk-button govuk-button--start"
          label={t("sdSummaryPageMainCreateBtn", { ns: "sdCheckYourInformation" })}
          aria-label={t("sdSummaryPageMainCreateBtn", { ns: "sdCheckYourInformation" })}
          type={BUTTON_TYPE.SUBMIT}
          data-module="govuk-button"
          name="_action"
          //@ts-ignore
          value="createStorageDocument"
          data-testid="create-sd-button"
          disabled={navigation.state === "submitting"}
        />
      </>
    </CheckYourInformationLayout>
  );
};

export default CheckYourInformation;
