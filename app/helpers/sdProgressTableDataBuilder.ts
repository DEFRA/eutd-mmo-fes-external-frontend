import type {
  IStorageDocumentProgressSteps,
  IProgressDataSection,
  IErrorsTransformed,
  StorageDocumentCatch,
} from "~/types";
import { ProgressStatus } from "~/types/progress";

export const sdProgressTableDataBuilder = (
  progress: IStorageDocumentProgressSteps,
  errors?: IErrorsTransformed,
  catches?: StorageDocumentCatch[]
): Array<IProgressDataSection> => {
  const sdContext = "/create-non-manipulation-document/:documentNumber";

  // Route to you-have-added-a-product when: INCOMPLETE with more than 1 catch (user
  // previously saved-and-continued at least once) OR the section is fully COMPLETED.
  // A single catch in draft state (saved-as-draft) stays on add-product so the user
  // can complete the missing fields (FIO-10614).
  const productDetailsUrl =
    (progress?.catches === ProgressStatus.INCOMPLETE && Array.isArray(catches) && catches.length > 1) ||
    progress.catches === ProgressStatus.COMPLETED
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
