import type { ICatchCertificateProgressSteps, IErrorsTransformed, IProgressDataSection, ITransport } from "~/types";
import { forwardUri } from "./vehicleRouteLookup";

export const progressTableDataBuilder = (
  dataUpload: boolean,
  directLanding: boolean,
  progress: ICatchCertificateProgressSteps,
  transport: ITransport,
  errors?: IErrorsTransformed
): Array<IProgressDataSection> => {
  const landingDetailsUrl = directLanding ? "direct-landing" : "add-landings";
  const ccContext = "/create-catch-certificate/:documentNumber";
  const transportDetailsStatus: string = progress.transportDetails;

  return [
    {
      title: "commonProgressPageExporter",
      testId: "Exporter",
      rows: [
        {
          title: "commonProgressPageExporterYourReference",
          status: progress.reference,
          optional: true,
          testId: "yourReference",
          url: `${ccContext}/add-your-reference`,
        },
        {
          title: "commonProgressPageExporterDetails",
          status: progress.exporter,
          testId: "exporter",
          url: `${ccContext}/add-exporter-details`,
          error: errors?.exporter,
        },
      ],
    },
    {
      title: "ccProgressPageProductsOrLandings",
      testId: "ProductsAndLandings",
      rows: [
        ...(dataUpload
          ? [
              {
                title: "ccProgressPageProductsOrLandingsDataUpload",
                testId: "dataUpload",
                url: `${ccContext}/upload-file`,
              },
            ]
          : []),
        {
          title: "ccProgressPageProductsDetails",
          status: progress.products,
          testId: "products",
          url: `${ccContext}/what-are-you-exporting`,
          error: errors?.products,
        },
        {
          title: "ccProgressPageLandingsDetails",
          status: progress.landings,
          testId: "landings",
          url: `${ccContext}/${landingDetailsUrl}`,
          error: errors?.landings,
        },
        {
          title: "ccProgressPageProductsOrLandingsCatchWaters",
          status: progress.conservation,
          testId: "conservation",
          url: `${ccContext}/whose-waters-were-they-caught-in`,
          error: errors?.conservation,
        },
      ],
    },
    {
      title: "commonProgressPageTransportation",
      testId: "Transportation",
      rows: [
        {
          title: "ccProgressPageTransportationExportJourney",
          status: progress.exportJourney,
          testId: "exportJourney",
          url: `${ccContext}/what-export-journey`,
          error: errors?.exportJourney,
        },
        ...(directLanding
          ? []
          : [
              ...(transportDetailsStatus === "CANNOT START"
                ? [
                    {
                      title: "commonProgressPageTransportationTransportType",
                      status: progress.transportType,
                      testId: "transportType",
                      url: `${ccContext}/do-you-have-additional-transport-types`,
                      error: errors?.transportType,
                    },
                  ]
                : []),
              {
                title: "commonProgressPageTransportationTransportDetails",
                status: progress.transportDetails,
                testId: "transportDetails",
                url:
                  transportDetailsStatus === "INCOMPLETE"
                    ? `${ccContext}/${forwardUri(transport.vehicle, "catchCertificate")}/${transport.id}`
                    : `${ccContext}/do-you-have-additional-transport-types`,
                error: errors?.transportDetails,
              },
            ]),
      ],
    },
  ];
};
