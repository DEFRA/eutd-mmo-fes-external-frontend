import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { Fragment, useEffect } from "react";
import { ErrorSummary, Main, NotificationBanner, SecureForm, Title, formatAddress } from "~/components";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { getWhoseWaters, landingsEntryOptions, scrollToId, hasExporterAddressBeenUpdated } from "~/helpers";
import type {
  Exporter,
  LandingStatus,
  ProductLanded,
  LandingsEntryOptionType,
  SystemFailure,
  Journey,
  IError,
} from "~/types";
import {
  LandingDetailsSummary,
  TransportationDetailsSummary,
  CheckYourInformationDocumentNumber,
} from "~/composite-components";
import isEmpty from "lodash/isEmpty";
import lowerCase from "lodash/lowerCase";
import { useTranslation } from "react-i18next";
import { useScrollOnPageLoad } from "~/hooks";
import { useNavigation } from "react-router-dom";
import { CheckYourInformationAction, CheckYourInformationLoader } from "~/models";

type CommonLinkProps = {
  routeLink: any;
  documentNumber: string;
  textOne: string;
  textTwo: string;
};

const CommonLink = ({ routeLink, documentNumber, textOne, textTwo }: CommonLinkProps) => (
  <a
    className="govuk-link"
    href={`${route(routeLink, {
      documentNumber,
    })}?nextUri=${route("/create-catch-certificate/:documentNumber/check-your-information", {
      documentNumber,
    })}`}
  >
    {textOne}
    <span className="govuk-visually-hidden"> {lowerCase(textTwo)}</span>
  </a>
);

export const loader: LoaderFunction = async ({ request, params }) => CheckYourInformationLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  CheckYourInformationAction(request, params);

const CheckYourInformation = () => {
  const navigation = useNavigation();

  const { t } = useTranslation(["checkYourInformation", "common", "progress"]);
  const {
    documentNumber,
    status,
    transport,
    transportations,
    exporter,
    exportPayload,
    exportLocation,
    conservation,
    landingsEntryOption,
    hasSystemFailure,
    validationErrors,
    csrf,
  } = useLoaderData();
  const exporterDetails: Exporter = exporter.model;

  const landingsEntry: LandingsEntryOptionType | {} =
    landingsEntryOptions.find(
      (landingOption: LandingsEntryOptionType) => landingOption.value === landingsEntryOption
    ) ?? {};

  const isLocked = status === "LOCKED";
  const isDirectLanding = landingsEntryOption === "directLanding";

  const isVesselOverriddenByAdmin = (landing: LandingStatus) => landing?.model?.vessel?.vesselOverriddenByAdmin;
  const isAnyVesselOverriddenByAdmin = (landings: LandingStatus[]) =>
    landings?.some((landing: LandingStatus) => isVesselOverriddenByAdmin(landing));
  const isOverriddenByAdmin = () =>
    exportPayload.items?.some((item: ProductLanded) => item.landings && isAnyVesselOverriddenByAdmin(item.landings));
  const isVesselNotFound = () => {
    const isVesselNotFoundInTheArray =
      !isEmpty(exportPayload.items) &&
      exportPayload.items.some(
        (item: ProductLanded) =>
          !isEmpty(item.landings) && item.landings?.find((landing) => landing.model?.vessel?.vesselNotFound)
      );
    return isVesselNotFoundInTheArray;
  };

  const getNotificationMsgFormat = (_errors: SystemFailure | IError[]) => {
    if (isLocked) {
      return t("ccSummaryPageDocumentLockedNotification");
    } else if (isVesselNotFound() && isEmpty(_errors)) {
      return t("ccSummaryPageVesselNotFound");
    } else if (isOverriddenByAdmin() && isDirectLanding) {
      return t("ccSummaryPageOverridenByAdminNotificationDirectLanding");
    } else if (isOverriddenByAdmin()) {
      return t("ccSummaryPageOverridenByAdminNotificationNonDirectLanding");
    } else {
      return "";
    }
  };

  const getBackToRoutes = () => {
    if (isLocked) {
      return route("/create-catch-certificate/catch-certificates");
    } else {
      return route("/create-catch-certificate/:documentNumber/progress", { documentNumber });
    }
  };

  const getNotificationMsg = (exporterDetails: Exporter, _errors: SystemFailure | IError[]) => {
    let notificationMsgs: string[] = [];

    let notificationMsg: string = getNotificationMsgFormat(_errors);
    if (!isEmpty(notificationMsg)) {
      notificationMsgs.push(notificationMsg);
    }

    if (hasExporterAddressBeenUpdated(exporterDetails)) {
      notificationMsgs.push(t("commonSummaryPageNotificationBannerMessage0", { ns: "common" }));
    }

    if (hasSystemFailure) {
      notificationMsgs.push(t("ccSummaryPageSystemError"));
    }

    return notificationMsgs;
  };
  const journey: Journey = "catchCertificate";
  const backTo = getBackToRoutes();
  const actionData = useActionData();
  const errors = actionData?.submitCertificate?.errors ?? validationErrors;

  if (Array.isArray(errors)) {
    errors.forEach((validationError: IError) => {
      const landing: ProductLanded | undefined = exportPayload?.items.find(
        (payloadData: ProductLanded) => payloadData.product.species?.code === validationError.value?.species
      );

      if (landing) {
        validationError.value = {
          ...validationError.value,
          species: landing.product.species.label,
        };
      }
    });
  }

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  let totalNumberOfVessels = 0;

  if (exportPayload.items !== undefined) {
    if (exportPayload.items.length > 0) {
      exportPayload.items.forEach((vessel: ProductLanded) => {
        if (vessel.landings !== undefined) {
          totalNumberOfVessels += vessel.landings.length;
        }
      });
    }
  }

  const notificationMessages = getNotificationMsg(exporterDetails, errors);
  return (
    <Main backUrl={backTo}>
      {Array.isArray(notificationMessages) && notificationMessages.length > 0 && (
        <NotificationBanner
          header={t("commonImportant", { ns: "common" })}
          messages={notificationMessages}
          dataTestId="notification-message"
        />
      )}
      {Array.isArray(errors) && <ErrorSummary errors={errors} />}
      <SecureForm method="post" csrf={csrf}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <Title
              title={t("commonSummaryPageMainHeader", {
                ns: "checkYourInformation",
              })}
            />
            <CheckYourInformationDocumentNumber
              documentNumberTitle={t("commonDocumentNumber", { ns: "common" })}
              documentNumber={documentNumber}
            />
            <h2 className="govuk-heading-l">{t("commonProgressPageExporterDetails", { ns: "progress" })}</h2>
            <dl className="govuk-summary-list govuk-!-margin-bottom-5">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("ccAddExporterDetailsExporterNameOfPersonResponsible", { ns: "common" })}
                </dt>
                <dd className="govuk-summary-list__value">{exporterDetails.exporterFullName}</dd>
                <dd className="govuk-summary-list__actions">
                  {!isLocked && (
                    <a
                      className="govuk-link"
                      href={`${route("/create-catch-certificate/:documentNumber/add-exporter-details", {
                        documentNumber,
                      })}?nextUri=${route("/create-catch-certificate/:documentNumber/check-your-information", {
                        documentNumber,
                      })}#exporterFullName`}
                    >
                      {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                      <span className="govuk-visually-hidden">
                        {" "}
                        {lowerCase(t("ccAddExporterDetailsExporterNameOfPersonResponsible", { ns: "common" }))}
                      </span>
                    </a>
                  )}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("commonAddExporterDetailsCompanyName", { ns: "common" })}
                </dt>
                <dd className="govuk-summary-list__value">{exporterDetails.exporterCompanyName}</dd>
                <dd className="govuk-summary-list__actions">
                  {!isLocked && (
                    <a
                      className="govuk-link"
                      href={`${route("/create-catch-certificate/:documentNumber/add-exporter-details", {
                        documentNumber,
                      })}?nextUri=${route("/create-catch-certificate/:documentNumber/check-your-information", {
                        documentNumber,
                      })}#exporterCompanyName`}
                    >
                      {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                      <span className="govuk-visually-hidden">
                        {lowerCase(t("commonAddExporterDetailsCompanyName", { ns: "common" }))}
                      </span>
                    </a>
                  )}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("commonSummaryPageExporterCompanyAddress", { ns: "checkYourInformation" })}
                </dt>
                <dd className="govuk-summary-list__value">
                  {formatAddress(
                    exporterDetails.addressOne,
                    exporterDetails.addressTwo,
                    exporterDetails.townCity,
                    exporterDetails.postcode
                  )}
                </dd>
                <dd className="govuk-summary-list__actions">
                  {!isLocked && (
                    <CommonLink
                      routeLink="/create-catch-certificate/:documentNumber/add-exporter-details"
                      documentNumber={documentNumber}
                      textOne={t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                      textTwo={t("commonSummaryPageExporterCompanyAddress", { ns: "checkYourInformation" })}
                    />
                  )}
                </dd>
              </div>
            </dl>
            <LandingDetailsSummary
              documentNumber={documentNumber}
              landingsEntry={landingsEntry}
              exportPayload={exportPayload}
              isLocked={isLocked}
              isDirectLanding={isDirectLanding}
              isOverriddenByAdmin={isOverriddenByAdmin()}
              errors={errors}
            />
            <TransportationDetailsSummary
              documentNumber={documentNumber}
              exportLocation={exportLocation}
              transportation={transport}
              transportations={transportations}
              isLocked={isLocked}
            />
            <h2 className="govuk-heading-l">
              {t("ccSummaryPageConservationAndManagement", { ns: "checkYourInformation" })}
            </h2>
            <dl className="govuk-summary-list govuk-!-margin-bottom-5">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("ccWhoseWatersWereTheyCaughtInHeaderText", { ns: "whoseWatersWereTheyCaughtIn" })}
                </dt>
                <dd className="govuk-summary-list__value">
                  {getWhoseWaters(conservation).map((waters) => (
                    <Fragment key={`getwhoseWater-${waters}`}>
                      {waters}
                      <br />
                    </Fragment>
                  ))}
                </dd>
                <dd className="govuk-summary-list__actions">
                  {!isLocked && (
                    <CommonLink
                      routeLink="/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in"
                      documentNumber={documentNumber}
                      textOne={t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                      textTwo={t("ccWhoseWatersWereTheyCaughtInHeaderText", { ns: "checkYourInformation" })}
                    />
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="govuk-warning-text">
          <span className="govuk-warning-text__icon" aria-hidden="true">
            !
          </span>
          <strong className="govuk-warning-text__text">
            <span className="govuk-visually-hidden">Warning</span>
            {t("ccSummaryPageWarning", { ns: "checkYourInformation" })}
          </strong>
        </div>
        <input type="hidden" name="journey" value={journey} />
        <input type="hidden" name="noOfVessels" value={totalNumberOfVessels} />
        {!isLocked && (
          <Button
            className="govuk-button govuk-button--start"
            label={t("ccSummaryPageMainCreateBtn", { ns: "checkYourInformation" })}
            type={BUTTON_TYPE.SUBMIT}
            data-module="govuk-button"
            name="_action"
            //@ts-ignore
            value="createCatchCertificate"
            data-testid="create-cc-button"
            data-prevent-double-click="true"
            disabled={navigation.state === "submitting"}
          />
        )}
      </SecureForm>
    </Main>
  );
};
export default CheckYourInformation;
