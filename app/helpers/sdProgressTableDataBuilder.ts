import type {
  IStorageDocumentProgressSteps,
  IProgressDataSection,
  IErrorsTransformed,
  StorageDocumentCatch,
} from "~/types";

export const sdProgressTableDataBuilder = (
  progress: IStorageDocumentProgressSteps,
  errors?: IErrorsTransformed,
  catches?: StorageDocumentCatch[]
): Array<IProgressDataSection> => {
  const sdContext = "/create-non-manipulation-document/:documentNumber";

  // Check if at least one product has been added (saved and continued)
  const hasAddedProducts = Array.isArray(catches) && catches.some((c) => c.product);
  const productDetailsUrl = hasAddedProducts
    ? `${sdContext}/you-have-added-a-product`
    : `${sdContext}/add-product-to-this-consignment`;

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
          url: productDetailsUrl,
          error: errors?.catches,
        },
      ],
    },
    {
      title: "sdProgressArrivalFacility",
      testId: "storageArrivalTransportTitle",
      rows: [
        {
          title: "sdProgressArrivalTransportDetails",
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
          url: `${sdContext}/add-storage-facility-details`,
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
          url: `${sdContext}/how-does-the-consignment-leave-the-uk`,
          error: errors?.transportDetails,
        },
      ],
    },
  ];
};
