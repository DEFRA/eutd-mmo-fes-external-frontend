import type {
  IProcessingStatementProgressSteps,
  IProgressDataSection,
  IErrorsTransformed,
  ProcessingStatementProduct,
} from "~/types";

export const psProgressTableDataBuilder = (
  progress: IProcessingStatementProgressSteps,
  errors?: IErrorsTransformed,
  products?: ProcessingStatementProduct[]
): Array<IProgressDataSection> => {
  const ccContext = "/create-processing-statement/:documentNumber";

  const hasProducts = Array.isArray(products) && products.length > 0;

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
          url: `${ccContext}/add-your-reference`,
        },
        {
          title: "commonProgressPageExporterDetails",
          status: progress?.exporter,
          testId: "exporter",
          url: `${ccContext}/add-exporter-details`,
          error: errors?.exporter,
        },
      ],
    },
    {
      title: "commonProgressSectionProducts",
      testId: "products",
      rows: [
        {
          title: "psProgressSectionProcessedProductDetails",
          status: progress?.processedProductDetails,
          testId: "processedProductDetails",
          url: `${ccContext}/${hasProducts ? "catch-added" : "add-consignment-details"}`,
          error: errors?.processedProductDetails,
        },
      ],
    },
    {
      title: "psProgressSectionProcessingPlant",
      testId: "processing",
      rows: [
        {
          title: "psProgressProcessingPlantId",
          status: progress?.processingPlant,
          testId: "processingPlant",
          url: `${ccContext}/add-processing-plant-details`,
          error: errors?.processingPlant,
        },
        {
          title: "psProgressProcessingPlantAddress",
          status: progress?.processingPlantAddress,
          testId: "processingPlantAddress",
          url: `${ccContext}/add-processing-plant-address`,
          error: errors?.processingPlantAddress,
        },
      ],
    },
    {
      title: "psProgressSectionTransportation",
      testId: "transportation",
      rows: [
        {
          title: "psProgressTransportationExportHealthCertificate",
          status: progress?.exportHealthCertificate,
          testId: "exportHealthCertificate",
          url: `${ccContext}/add-health-certificate`,
          error: errors?.exportHealthCertificate,
        },
        {
          title: "commonProgressTransportationExportDestination",
          status: progress?.exportDestination,
          testId: "exportDestination",
          url: `${ccContext}/what-export-destination`,
          error: errors?.exportDestination,
        },
      ],
    },
  ];
};
