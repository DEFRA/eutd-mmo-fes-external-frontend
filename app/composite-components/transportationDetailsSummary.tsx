import type { IExportLocation, ITransport } from "~/types";
import { useTranslation } from "react-i18next";
import lowerCase from "lodash/lowerCase";
import { route } from "routes-gen";
import SummaryListRow from "../components/summaryListRow";
import { TransportationDocumentsSummary } from "./transportationDocumentsSummary";

type TransportationDetailsSummaryProps = {
  documentNumber: string;
  exportLocation: IExportLocation;
  transportation: ITransport;
  transportations?: ITransport[];
  isLocked: boolean;
};

export const generateActions = (isLocked: boolean, href: string, hiddenText: string, namespace: string, t: any) =>
  !isLocked && (
    <a aria-label={t("commonWhatExportersAddressChangeLink", { ns: "common" })} className="govuk-link" href={href}>
      {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
      <span className="govuk-visually-hidden"> {lowerCase(t(hiddenText, { ns: namespace }))}</span>
    </a>
  );

const getTransportationDetailsSummary = (documentNumber: string, isLocked: boolean, transport: ITransport, t: any) => {
  if (transport.vehicle === "directLanding") {
    return (
      <SummaryListRow
        keyText={t("commonTransportSummaryLeaveUKText", { ns: "checkYourInformation" })}
        value={t("commonTransportSummaryFishingVessel", { ns: "checkYourInformation" })}
      />
    );
  }

  return (
    <>
      <SummaryListRow
        keyText={t("commonTransportSummaryLeaveUKText", { ns: "checkYourInformation" })}
        value={t(transport.vehicle, { ns: "transportation" })}
        actions={generateActions(
          isLocked,
          `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${transport.id}?nextUri=${route(
            "/create-catch-certificate/:documentNumber/check-your-information",
            {
              documentNumber,
            }
          )}`,
          "commonTransportSummaryLeaveUKText",
          "checkYourInformation",
          t
        )}
      />
      {transport.vehicle === "truck" && (
        <>
          {transport.cmr && transport.cmr === "true" ? (
            <SummaryListRow
              keyText={t("doYouHaveaRoadTransportDocumentHeader", { ns: "transportation" })}
              value={t("commonYesLabel", { ns: "common" })}
              actions={generateActions(
                isLocked,
                `/create-catch-certificate/${documentNumber}/do-you-have-a-road-transport-document/${transport.id}?nextUri=${route(
                  "/create-catch-certificate/:documentNumber/check-your-information",
                  {
                    documentNumber,
                  }
                )}#cmr`,
                "ccSummaryPageTransportationDetails",
                "checkYourInformation",
                t
              )}
            />
          ) : (
            <>
              <SummaryListRow
                keyText={t("addTransportationDetailsTruckNationality", { ns: "transportation" })}
                value={transport.nationalityOfVehicle}
                actions={generateActions(
                  isLocked,
                  `/create-catch-certificate/${documentNumber}/add-transportation-details-truck/${transport.id}?nextUri=${route(
                    "/create-catch-certificate/:documentNumber/check-your-information",
                    {
                      documentNumber,
                    }
                  )}#nationalityOfVehicle`,
                  "ccSummaryPageTransportationDetails",
                  "checkYourInformation",
                  t
                )}
              />
              <SummaryListRow
                keyText={t("addTransportationDetailsRegistrationNumber", { ns: "transportation" })}
                value={transport.registrationNumber}
                actions={generateActions(
                  isLocked,
                  `/create-catch-certificate/${documentNumber}/add-transportation-details-truck/${transport.id}?nextUri=${route(
                    "/create-catch-certificate/:documentNumber/check-your-information",
                    {
                      documentNumber,
                    }
                  )}#registrationNumber`,
                  "ccSummaryPageTransportationDetails",
                  "checkYourInformation",
                  t
                )}
              />
              <SummaryListRow
                keyText={t("addTransportationDetailsPlaceExportLeavesUK", { ns: "transportation" })}
                value={transport.departurePlace}
                actions={generateActions(
                  isLocked,
                  `/create-catch-certificate/${documentNumber}/add-transportation-details-truck/${transport.id}?nextUri=${route(
                    "/create-catch-certificate/:documentNumber/check-your-information",
                    {
                      documentNumber,
                    }
                  )}#departurePlace`,
                  "ccSummaryPageTransportationDetails",
                  "checkYourInformation",
                  t
                )}
              />
            </>
          )}
          {transport.freightBillNumber && (
            <SummaryListRow
              keyText={t("addTransportationDetailsFreightBillNumber", { ns: "transportation" })}
              value={transport.freightBillNumber}
              actions={generateActions(
                isLocked,
                `/create-catch-certificate/${documentNumber}/add-transportation-details-truck/${transport.id}?nextUri=${route(
                  "/create-catch-certificate/:documentNumber/check-your-information",
                  {
                    documentNumber,
                  }
                )}#freightBillNumber`,
                "ccSummaryPageTransportationDetails",
                "checkYourInformation",
                t
              )}
            />
          )}
        </>
      )}
      {transport.vehicle === "plane" && (
        <>
          <SummaryListRow
            keyText={t("addTransportationDetailsFlightnumber", { ns: "transportation" })}
            value={transport.flightNumber}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-plane/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#flightNumber`,
              "addTransportationDetailsFlightnumber",
              "transportation",
              t
            )}
          />
          <SummaryListRow
            keyText={t("addTransportationDetailsContainerIdentificationText", { ns: "transportation" })}
            value={transport.containerNumber}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-plane/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#containerNumber`,
              "addTransportationDetailsFlightnumber",
              "transportation",
              t
            )}
          />
          <SummaryListRow
            keyText={t("addTransportationDetailsPlaceExportLeavesUK", { ns: "transportation" })}
            value={transport.departurePlace}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-plane/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#departurePlace`,
              "addTransportationDetailsFlightnumber",
              "transportation",
              t
            )}
          />
          {transport.freightBillNumber && (
            <SummaryListRow
              keyText={t("addTransportationDetailsFreightBillNumber", { ns: "transportation" })}
              value={transport.freightBillNumber}
              actions={generateActions(
                isLocked,
                `/create-catch-certificate/${documentNumber}/add-transportation-details-plane/${transport.id}?nextUri=${route(
                  "/create-catch-certificate/:documentNumber/check-your-information",
                  {
                    documentNumber,
                  }
                )}#freightBillNumber`,
                "addTransportationDetailsFlightnumber",
                "transportation",
                t
              )}
            />
          )}
        </>
      )}
      {transport.vehicle === "train" && (
        <>
          <SummaryListRow
            keyText={t("addTransportationDetailsRailwayBillNumber", { ns: "transportation" })}
            value={transport.railwayBillNumber}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-train/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#railwayBillNumber`,
              "addTransportationDetailsRailwayBillNumber",
              "transportation",
              t
            )}
          />
          <SummaryListRow
            keyText={t("addTransportationDetailsPlaceExportLeavesUK", { ns: "transportation" })}
            value={transport.departurePlace}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-train/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#departurePlace`,
              "addTransportationDetailsRailwayBillNumber",
              "transportation",
              t
            )}
          />
          {transport.freightBillNumber && (
            <SummaryListRow
              keyText={t("addTransportationDetailsFreightBillNumber", { ns: "transportation" })}
              value={transport.freightBillNumber}
              actions={generateActions(
                isLocked,
                `/create-catch-certificate/${documentNumber}/add-transportation-details-train/${transport.id}?nextUri=${route(
                  "/create-catch-certificate/:documentNumber/check-your-information",
                  {
                    documentNumber,
                  }
                )}#freightBillNumber`,
                "addTransportationDetailsRailwayBillNumber",
                "transportation",
                t
              )}
            />
          )}
        </>
      )}
      {transport.vehicle === "containerVessel" && (
        <>
          <SummaryListRow
            keyText={t("addTransportationDetailsVesselNameText", { ns: "transportation" })}
            value={transport.vesselName}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-container-vessel/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#vesselName`,
              "addTransportationDetailsVesselNameText",
              "transportation",
              t
            )}
          />
          <SummaryListRow
            keyText={t("addTransportationDetailsFlagStateText", { ns: "transportation" })}
            value={transport.flagState}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-container-vessel/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#flagState`,
              "addTransportationDetailsVesselNameText",
              "transportation",
              t
            )}
          />
          <SummaryListRow
            keyText={t("addTransportationDetailsContainerIdentificationText", { ns: "transportation" })}
            value={transport.containerNumber}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-container-vessel/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#containerNumber`,
              "addTransportationDetailsVesselNameText",
              "transportation",
              t
            )}
          />
          <SummaryListRow
            keyText={t("addTransportationDetailsPlaceExportLeavesUK", { ns: "transportation" })}
            value={transport.departurePlace}
            actions={generateActions(
              isLocked,
              `/create-catch-certificate/${documentNumber}/add-transportation-details-container-vessel/${transport.id}?nextUri=${route(
                "/create-catch-certificate/:documentNumber/check-your-information",
                {
                  documentNumber,
                }
              )}#departurePlace`,
              "addTransportationDetailsVesselNameText",
              "transportation",
              t
            )}
          />
          {transport.freightBillNumber && (
            <SummaryListRow
              keyText={t("addTransportationDetailsFreightBillNumber", { ns: "transportation" })}
              value={transport.freightBillNumber}
              actions={generateActions(
                isLocked,
                `/create-catch-certificate/${documentNumber}/add-transportation-details-container-vessel/${transport.id}?nextUri=${route(
                  "/create-catch-certificate/:documentNumber/check-your-information",
                  {
                    documentNumber,
                  }
                )}#freightBillNumber`,
                "addTransportationDetailsVesselNameText",
                "transportation",
                t
              )}
            />
          )}
        </>
      )}
      <TransportationDocumentsSummary documentNumber={documentNumber} transport={transport} isLocked={isLocked} t={t} />
      <br />
    </>
  );
};

export const TransportationDetailsSummary = ({
  documentNumber,
  exportLocation,
  transportation,
  transportations,
  isLocked,
}: TransportationDetailsSummaryProps) => {
  const { t } = useTranslation(["checkYourInformation", "common", "transportation"]);

  return (
    <>
      <h2 className="govuk-heading-l">{t("ccSummaryPageTransportationDetails", { ns: "checkYourInformation" })}</h2>
      <dl className="govuk-summary-list govuk-!-margin-bottom-5">
        <SummaryListRow
          keyText={t("commonTransportSummaryDepartureCountry", { ns: "checkYourInformation" })}
          value={exportLocation.exportedFrom}
          actions={generateActions(
            isLocked,
            `${route("/create-catch-certificate/:documentNumber/what-export-journey", {
              documentNumber,
            })}?nextUri=${route("/create-catch-certificate/:documentNumber/check-your-information", {
              documentNumber,
            })}#${encodeURIComponent(exportLocation.exportedFrom as string)}`,
            "ccSummaryPageTransportationDetails",
            "checkYourInformation",
            t
          )}
        />
        <SummaryListRow
          keyText={t("TransportSummarySummaryCellKeyCCVersion", { ns: "checkYourInformation" })}
          value={exportLocation.exportedTo?.officialCountryName}
          actions={generateActions(
            isLocked,
            `${route("/create-catch-certificate/:documentNumber/what-export-journey", {
              documentNumber,
            })}?nextUri=${route("/create-catch-certificate/:documentNumber/check-your-information", {
              documentNumber,
            })}#${encodeURIComponent(exportLocation.exportedTo?.officialCountryName as string)}`,
            "TransportSummarySummaryCellKeyCCVersion",
            "checkYourInformation",
            t
          )}
        />
        <br />
        {Array.isArray(transportations) && transportations.length > 0
          ? transportations.map((transport: ITransport) =>
              getTransportationDetailsSummary(documentNumber, isLocked, transport, t)
            )
          : getTransportationDetailsSummary(documentNumber, isLocked, transportation, t)}
      </dl>
    </>
  );
};
