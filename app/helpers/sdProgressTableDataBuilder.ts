import type { IStorageDocumentProgressSteps, IProgressDataSection, IErrorsTransformed } from "~/types";

export const sdProgressTableDataBuilder = (
  progress: IStorageDocumentProgressSteps,
  errors?: IErrorsTransformed,
  displayOptionalSuffix?: boolean
): Array<IProgressDataSection> => {
  const sdContext = "/create-storage-document/:documentNumber";

  return [
    {
      title: "commonProgressPageExporter",
      testId: "Exporter",
      rows: [
        {
          title: "commonProgressPageExporterYourReference",
          status: progress?.reference,
          optional: true,
          testId: "yourReference",
          url: `${sdContext}/add-your-reference`,
        },
        {
          title: "commonProgressPageExporterDetails",
          status: progress?.exporter,
          testId: "exporter",
          url: `${sdContext}/add-exporter-details`,
          error: errors?.exporter,
        },
      ],
    },
    {
      title: "commonProgressSectionProducts",
      testId: "products",
      rows: [
        {
          title: "sdProgressProductDetails",
          status: progress?.catches,
          testId: "productsDescription",
          url: `${sdContext}/add-product-to-this-consignment`,
          error: errors?.catches,
        },
      ],
    },
    {
      title: "sdProgressArrivalFacility",
      testId: "storageArrivalTransportTitle",
      rows: [
        {
          title: displayOptionalSuffix
            ? "sdProgressArrivalTransportDetailsOptional"
            : "sdProgressArrivalTransportDetails",
          status: progress?.arrivalTransportationDetails,
          testId: "arrivalTransportationDetails",
          url: `${sdContext}/how-does-the-consignment-arrive-to-the-uk`,
          error: errors?.arrivalTransportationDetails,
        },
      ],
    },
    {
      title: "sdProgressStoragefacilities",
      testId: "storageFacilitiesTitle",
      rows: [
        {
          title: "sdProgressStoragefacilities",
          status: progress?.storageFacilities,
          testId: "storageFacilities",
          url: `${sdContext}/you-have-added-a-storage-facility`,
          error: errors?.storageFacilities,
        },
      ],
    },
    {
      title: "sdProgressDepartureFromStorageFacilty",
      testId: "transportation",
      rows: [
        {
          title: "sdProgressDepartureFromStorageFaciltyDetails",
          status: progress.transportDetails,
          testId: "transportDetails",
          url: `${sdContext}/how-does-the-export-leave-the-uk`,
          error: errors?.transportDetails,
        },
      ],
    },
  ];
};
