import type { Exporter, IError, ITransport, IValidationError, StorageDocumentCatch } from "~/types";
import { changeLinkUri } from "~/helpers";
import { route } from "routes-gen";
import { useTranslation } from "react-i18next";
import lowerCase from "lodash/lowerCase";
import { Main, NotificationBanner, ErrorSummary, Title, SecureForm, formatAddress, ErrorMessage } from "~/components";
import * as React from "react";
import moment from "moment";
import capitalize from "lodash/capitalize";

type CheckYourInformationDocumentNumberProps = {
  checkInformationHeader?: string;
  documentNumberTitle: string;
  documentNumber: string;
};

export const CheckYourInformationDocumentNumber = ({
  checkInformationHeader,
  documentNumberTitle,
  documentNumber,
}: CheckYourInformationDocumentNumberProps) => (
  <>
    {checkInformationHeader && <h2 className="govuk-heading-l">{checkInformationHeader}</h2>}
    <dl className="govuk-summary-list govuk-!-margin-bottom-5">
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-half">{documentNumberTitle}</dt>
        <dd className="govuk-summary-list__value">{documentNumber}</dd>
      </div>
    </dl>
  </>
);

type CheckInfoExporterDetailsProps = {
  checkExporterDetailsHeader: string;
  exporterDetails: Exporter;
  companyNameTitle: string;
  changeLinkText: string;
  companyAddress: string;
  exporterDetailsRoute: any;
  checkInfoRoute: any;
  summaryPageChangeText?: string;
  documentNumber: string;
};

export const CheckInfoExporterDetails = ({
  checkExporterDetailsHeader,
  exporterDetails,
  companyNameTitle,
  changeLinkText,
  companyAddress,
  exporterDetailsRoute,
  checkInfoRoute,
  summaryPageChangeText,
  documentNumber,
}: CheckInfoExporterDetailsProps) => (
  <>
    <h2 className="govuk-heading-l">{checkExporterDetailsHeader}</h2>
    <dl className="govuk-summary-list govuk-!-margin-bottom-5">
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-half">{companyNameTitle}</dt>
        <dd className="govuk-summary-list__value">{exporterDetails?.exporterCompanyName}</dd>
        <dd className="govuk-summary-list__actions">
          <a
            id="exporterCompanyNameChangeLink"
            aria-label={changeLinkText}
            className="govuk-link"
            href={`${route(exporterDetailsRoute, {
              documentNumber,
            })}?nextUri=${route(checkInfoRoute, {
              documentNumber,
            })}#exporterCompanyName`}
          >
            {changeLinkText}
          </a>
        </dd>
      </div>
      <div className="govuk-summary-list__row">
        <dt className="govuk-summary-list__key govuk-!-width-one-half">{companyAddress}</dt>
        <dd className="govuk-summary-list__value">
          {formatAddress(
            exporterDetails?.addressOne,
            exporterDetails?.addressTwo,
            exporterDetails?.townCity,
            exporterDetails?.postcode
          )}
        </dd>
        {summaryPageChangeText && (
          <dd className="govuk-summary-list__actions">
            <a
              id="exporterDetailsChangeLink"
              className="govuk-link"
              href={`${route("/create-processing-statement/:documentNumber/add-exporter-details", {
                documentNumber,
              })}?nextUri=${route("/create-processing-statement/:documentNumber/check-your-information", {
                documentNumber,
              })}`}
            >
              {summaryPageChangeText}
              <span className="govuk-visually-hidden"> {lowerCase(companyAddress)}</span>
            </a>
          </dd>
        )}
      </div>
    </dl>
  </>
);

type StorageDocumentTransportDisplayProps = {
  transport: ITransport;
  transportType: string;
  documentNumber: string;
};

export const StorageDocumentTransportDisplay = ({
  transport,
  transportType,
  documentNumber,
}: StorageDocumentTransportDisplayProps) => {
  const { t } = useTranslation(["common", "sdCheckYourInformation", "transportation"]);

  const commonFields = [
    {
      label: t("sdCheckYourInformationConsignmentDestination", { ns: "sdCheckYourInformation" }),
      value: transport.exportedTo?.officialCountryName,
      hasChangeLink: true,
      backLinkId: "exportedTo",
    },
    {
      label: t(`sdCheckYourInformationVehicleDepartureFrom${capitalize(transport.vehicle)}`, {
        ns: "sdCheckYourInformation",
      }),
      value: transport.departurePlace,
      hasChangeLink: true,
      backLinkId: "departurePlace",
    },
    {
      label: t(`sdCheckYourInformationVehicleDepartureFrom${capitalize(transport.vehicle)}`, {
        ns: "sdCheckYourInformation",
      }),
      value: transport.departurePort,
      hasChangeLink: true,
      backLinkId: "departurePort",
    },
    {
      label: t("sdCheckYourInformationDepartureDate", { ns: "sdCheckYourInformation" }),
      value: transport.departureDate,
      hasChangeLink: true,
      backLinkId: "departureDate-day",
    },
    {
      label: t("sdCheckYourInformationDepartureDate", { ns: "sdCheckYourInformation" }),
      value: transport.exportDate,
      hasChangeLink: true,
      backLinkId: "exportDate-day",
    },
  ];

  const sharedContainerVesselPlaneFields = [
    {
      label: t("sdCheckYourInformationContainer", { ns: "sdCheckYourInformation" }),
      value: transport.containerNumber,
      hasChangeLink: true,
    },
    {
      label: t("sdCheckYourInformationContainer", { ns: "sdCheckYourInformation" }),
      value: transport.containerNumbers?.join(", "),
      hasChangeLink: true,
      backLinkId: "containerNumbers.0",
    },
  ];

  const sharedFreightBillNumberDepartureCountry = [
    {
      label: t("sdCheckYourInformationFreightNumber", { ns: "sdCheckYourInformation" }),
      value: transport.freightBillNumber,
      hasChangeLink: true,
      backLinkId: "freightBillNumber",
    },
    {
      label: t("sdCheckYourInformationDepartureCountry", { ns: "sdCheckYourInformation" }),
      value: transport.departureCountry,
      hasChangeLink: true,
      backLinkId: "departureCountry",
    },
  ];

  const transportLabels: any = {
    truckArrival: [
      {
        label: t("sdAddTransportationDetailsTruckNationality", { ns: "sdCheckYourInformation" }),
        value: transport.nationalityOfVehicle,
        hasChangeLink: true,
        backLinkId: "nationalityOfVehicle",
      },
      {
        label: t("sdAddTransportationDetailsRegistrationNumber", { ns: "sdCheckYourInformation" }),
        value: transport.registrationNumber,
        hasChangeLink: true,
        backLinkId: "registrationNumber",
      },
      ...sharedFreightBillNumberDepartureCountry,
      ...commonFields,
    ],
    planeArrival: [
      {
        label: t("sdCheckYourInformationAirWaybillNumber", { ns: "sdCheckYourInformation" }),
        value: transport.airwayBillNumber,
        hasChangeLink: true,
        backLinkId: "airwayBillNumber",
      },
      {
        label: t("sdTransportPlaneFlightNumber", { ns: "sdCheckYourInformation" }),
        value: transport.flightNumber,
        hasChangeLink: true,
        backLinkId: "flightNumber",
      },
      ...sharedContainerVesselPlaneFields,
      ...sharedFreightBillNumberDepartureCountry,
      ...commonFields,
    ],
    trainArrival: [
      {
        label: t("sdTransportRailNumber", { ns: "sdCheckYourInformation" }),
        value: transport.railwayBillNumber,
        hasChangeLink: true,
        backLinkId: "railwayBillNumber",
      },
      ...sharedFreightBillNumberDepartureCountry,
      ...commonFields,
    ],
    containerVesselArrival: [
      {
        label: t("sdCheckYourInformationVesselName", { ns: "sdCheckYourInformation" }),
        value: transport.vesselName,
        hasChangeLink: true,
        backLinkId: "vesselName",
      },
      {
        label: t("sdCheckYourInformationFlagState", { ns: "sdCheckYourInformation" }),
        value: transport.flagState,
        hasChangeLink: true,
        backLinkId: "flagState",
      },
      ...sharedContainerVesselPlaneFields,
      ...sharedFreightBillNumberDepartureCountry,
      ...commonFields,
    ],
    truck: [
      ...commonFields,
      {
        label: t("sdAddTransportationDetailsTruckNationality", { ns: "sdCheckYourInformation" }),
        value: transport.nationalityOfVehicle,
        hasChangeLink: true,
        backLinkId: "nationalityOfVehicle",
      },
      {
        label: t("sdAddTransportationDetailsRegistrationNumber", { ns: "sdCheckYourInformation" }),
        value: transport.registrationNumber,
        hasChangeLink: true,
        backLinkId: "registrationNumber",
      },
      ...sharedFreightBillNumberDepartureCountry,
    ],
    plane: [
      ...commonFields,
      {
        label: t("sdCheckYourInformationAirWaybillNumber", { ns: "sdCheckYourInformation" }),
        value: transport.airwayBillNumber,
        hasChangeLink: true,
        backLinkId: "airwayBillNumber",
      },
      {
        label: t("sdTransportPlaneFlightNumber", { ns: "sdCheckYourInformation" }),
        value: transport.flightNumber,
        hasChangeLink: true,
        backLinkId: "flightNumber",
      },
      ...sharedContainerVesselPlaneFields,
      ...sharedFreightBillNumberDepartureCountry,
    ],
    train: [
      ...commonFields,
      {
        label: t("sdTransportRailNumber", { ns: "sdCheckYourInformation" }),
        value: transport.railwayBillNumber,
        hasChangeLink: true,
        backLinkId: "railwayBillNumber",
      },
      ...sharedFreightBillNumberDepartureCountry,
    ],
    containerVessel: [
      ...commonFields,
      {
        label: t("sdCheckYourInformationVesselName", { ns: "sdCheckYourInformation" }),
        value: transport.vesselName,
        hasChangeLink: true,
        backLinkId: "vesselName",
      },
      {
        label: t("sdCheckYourInformationFlagState", { ns: "sdCheckYourInformation" }),
        value: transport.flagState,
        hasChangeLink: true,
        backLinkId: "flagState",
      },
      ...sharedContainerVesselPlaneFields,
      ...sharedFreightBillNumberDepartureCountry,
    ],
  };

  return (
    <>
      {transportLabels[transportType].map((itemData: any) => {
        if (!itemData.value) return null;

        return (
          <div key={itemData.label} className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">{itemData.label}</dt>
            <dd className="govuk-summary-list__value">{itemData.value}</dd>
            {itemData.hasChangeLink && (
              <dd className="govuk-summary-list__actions">
                <a
                  aria-label={t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                  className="govuk-link"
                  href={`/create-storage-document/${documentNumber}/${changeLinkUri(transportType, transport)}?nextUri=${route(
                    "/create-storage-document/:documentNumber/check-your-information",
                    {
                      documentNumber,
                    }
                  )}#${itemData.backLinkId}`}
                >
                  {t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
                </a>
              </dd>
            )}
          </div>
        );
      })}
    </>
  );
};

type CheckYourInformationLayoutProps = {
  hasNotifications: boolean;
  documentNumber: string;
  notificationMessages: string[];
  hasErrors: boolean;
  errors: IError[];
  children: JSX.Element;
  backUrl: any;
  summaryHeading: string;
  headingTranslation: string;
  checkInformationHeader: string;
  csrf: string;
};

export const CheckYourInformationLayout = ({
  hasNotifications,
  documentNumber,
  notificationMessages,
  hasErrors,
  errors,
  children,
  backUrl,
  summaryHeading,
  headingTranslation,
  checkInformationHeader,
  csrf,
}: CheckYourInformationLayoutProps) => {
  const { t } = useTranslation(["common", "pscheckYourInformation", "sdCheckYourInformation"]);
  return (
    <Main backUrl={route(backUrl, { documentNumber })}>
      {hasNotifications && (
        <NotificationBanner header={t("commonImportant", { ns: "common" })} messages={notificationMessages} />
      )}
      {hasErrors && <ErrorSummary errors={errors} />}
      <SecureForm method="post" csrf={csrf}>
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <Title
              title={t(summaryHeading, {
                ns: headingTranslation,
              })}
            />
            <CheckYourInformationDocumentNumber
              checkInformationHeader={t(checkInformationHeader, { ns: headingTranslation })}
              documentNumberTitle={t("commonDocumentNumber", { ns: "common" })}
              documentNumber={documentNumber}
            />
            {children}
          </div>
        </div>
      </SecureForm>
    </Main>
  );
};

export const InsetText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="govuk-inset-text">{children}</div>
);

type CheckYourInformationRowProps = {
  label: string;
  value: string;
  isActionEnabled?: boolean;
  actionURL?: string;
  t: any;
};

export const CheckYourInformationRow = ({
  label,
  value,
  isActionEnabled = false,
  actionURL,
  t,
}: CheckYourInformationRowProps) => (
  <div className="govuk-summary-list__row">
    <dt className="govuk-summary-list__key govuk-!-width-one-half">{label}</dt>
    <dd className="govuk-summary-list__value">{value}</dd>
    {isActionEnabled && (
      <dd className="govuk-summary-list__actions">
        <a
          aria-label={t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
          className="govuk-link"
          href={actionURL}
        >
          {t("sdSummaryPageChangeLinkText", { ns: "sdCheckYourInformation" })}
        </a>
      </dd>
    )}
  </div>
);

export const CheckYourInformationProductLayout = ({
  catchItem: ctch,
  index,
  catchValidationError,
  documentNumber,
}: {
  catchItem: StorageDocumentCatch;
  index: number;
  catchValidationError: IValidationError | undefined;
  documentNumber: string;
}) => {
  const { t } = useTranslation(["common", "pscheckYourInformation", "sdCheckYourInformation"]);

  return (
    <div
      key={`catchesdata-${ctch._id}`}
      id={`catches-${index}-certificateNumber`}
      className={catchValidationError !== undefined ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}
    >
      {catchValidationError?.message !== undefined && (
        <ErrorMessage
          text={t(catchValidationError?.message, { ns: "errorsText" })}
          visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
        />
      )}
      <InsetText>
        {t(
          ctch.certificateType === "uk"
            ? "sdCheckYourInformationProductsInsetTextUKIssued"
            : "sdCheckYourInformationProductsInsetTextThirdCountryIssued",
          { ns: "sdCheckYourInformation" }
        )}
      </InsetText>
      <dl className="govuk-summary-list govuk-!-margin-bottom-5">
        <CheckYourInformationRow
          label={t("sdSummaryPageWasCCissued", { ns: "sdCheckYourInformation" })}
          value={ctch.certificateType === "uk" ? t("commonYesLabel") : t("commonNoLabel")}
          isActionEnabled={true}
          actionURL={`/create-storage-document/${documentNumber}/add-product-to-this-consignment/${index}?nextUri=${route(
            "/create-storage-document/:documentNumber/check-your-information",
            { documentNumber: documentNumber }
          )}`}
          t={t}
        />
        <CheckYourInformationRow
          label={t("sdCheckYourInformationUkentryDocumentNumber", { ns: "sdCheckYourInformation" })}
          value={ctch.certificateNumber}
          isActionEnabled={true}
          actionURL={`/create-storage-document/${documentNumber}/add-product-to-this-consignment/${index}?nextUri=${route(
            "/create-storage-document/:documentNumber/check-your-information",
            { documentNumber }
          )}`}
          t={t}
        />
      </dl>
      <InsetText>
        {t("sdConsignmentItemlabel", { ns: "sdCheckYourInformation" }).replace(
          "{{itemNumber}}",
          (index + 1).toString()
        )}
      </InsetText>
      <dl className="govuk-summary-list govuk-!-margin-bottom-5">
        <CheckYourInformationRow
          label={t("sdSpeciesLabel", { ns: "sdCheckYourInformation" })}
          value={ctch.product}
          isActionEnabled={true}
          actionURL={`/create-storage-document/${documentNumber}/add-product-to-this-consignment/${index}?nextUri=${route(
            "/create-storage-document/:documentNumber/check-your-information",
            { documentNumber }
          )}`}
          t={t}
        />
        <CheckYourInformationRow
          label={t("sdCommodityCodeLabel", { ns: "sdCheckYourInformation" })}
          value={ctch.commodityCode}
          t={t}
        />
        {ctch.productDescription && (
          <CheckYourInformationRow
            label={t("sdProductDescription", { ns: "sdCheckYourInformation" })}
            value={ctch.productDescription}
            t={t}
          />
        )}
        {Array.isArray(ctch.supportingDocuments) && ctch.supportingDocuments.length > 0 && (
          <CheckYourInformationRow
            label={t("sdSupportingDocuments", { ns: "sdCheckYourInformation" })}
            value={ctch.supportingDocuments.join(", ")}
            t={t}
          />
        )}
        {ctch.netWeightProductArrival && (
          <CheckYourInformationRow
            label={t("sdNetWeightArrival", { ns: "sdCheckYourInformation" })}
            value={ctch.netWeightProductArrival + "kg"}
            t={t}
          />
        )}
        {ctch.netWeightFisheryProductArrival && (
          <CheckYourInformationRow
            label={t("sdNetFisheryWeightArrival", { ns: "sdCheckYourInformation" })}
            value={ctch.netWeightFisheryProductArrival + "kg"}
            t={t}
          />
        )}
        {ctch.netWeightProductDeparture && (
          <CheckYourInformationRow
            label={t("sdNetWeightDeparture", { ns: "sdCheckYourInformation" })}
            value={ctch.netWeightProductDeparture + "kg"}
            isActionEnabled={true}
            actionURL={`/create-storage-document/${documentNumber}/departure-product-summary?nextUri=${route(
              "/create-storage-document/:documentNumber/check-your-information",
              { documentNumber }
            )}`}
            t={t}
          />
        )}
        {ctch.netWeightFisheryProductDeparture && (
          <CheckYourInformationRow
            label={t("sdNetFisheryWeightDeparture", { ns: "sdCheckYourInformation" })}
            value={ctch.netWeightFisheryProductDeparture + "kg"}
            isActionEnabled={true}
            actionURL={`/create-storage-document/${documentNumber}/departure-product-summary?nextUri=${route(
              "/create-storage-document/:documentNumber/check-your-information",
              { documentNumber }
            )}`}
            t={t}
          />
        )}
        {!ctch.netWeightProductDeparture && !ctch.netWeightFisheryProductDeparture && (
          <CheckYourInformationRow
            label={t("sdCheckYourInformationExportWeightLabel", { ns: "sdCheckYourInformation" })}
            value={ctch.productWeight + "kg"}
            t={t}
          />
        )}
        {ctch.dateOfUnloading && (
          <CheckYourInformationRow
            label={t("sdCheckYourInformationUkentryDate", { ns: "sdCheckYourInformation" })}
            value={moment(ctch.dateOfUnloading, "DD/MM/YYYY").format("D MMMM YYYY")}
            t={t}
          />
        )}
        {ctch.placeOfUnloading && (
          <CheckYourInformationRow
            label={t("sdCheckYourInformationUkentryPlace", { ns: "sdCheckYourInformation" })}
            value={ctch.placeOfUnloading}
            t={t}
          />
        )}
        {ctch.transportUnloadedFrom && (
          <CheckYourInformationRow
            label={t("sdCheckYourInformationUkentryTransportDetails", { ns: "sdCheckYourInformation" })}
            value={ctch.transportUnloadedFrom}
            t={t}
          />
        )}
        <CheckYourInformationRow
          label={t("sdCheckYourInformationUkentryWeightOnDocument", { ns: "sdCheckYourInformation" })}
          value={ctch.weightOnCC + "kg"}
          t={t}
        />
      </dl>
    </div>
  );
};
