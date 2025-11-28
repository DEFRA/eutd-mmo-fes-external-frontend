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
  const psContext = "/create-processing-statement/:documentNumber";

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
          url: `${psContext}/add-your-reference`,
        },
        {
          title: "commonProgressPageExporterDetails",
          status: progress?.exporter,
          testId: "exporter",
          url: `${psContext}/add-exporter-details`,
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
          url: `${psContext}/${hasProducts ? "catch-added" : "add-consignment-details"}`,
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
          url: `${psContext}/add-processing-plant-details`,
          error: errors?.processingPlant,
        },
        {
          title: "psProgressProcessingPlantAddress",
          status: progress?.processingPlantAddress,
          testId: "processingPlantAddress",
          url: `${psContext}/add-processing-plant-address`,
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
          url: `${psContext}/add-health-certificate`,
          error: errors?.exportHealthCertificate,
        },
        {
          title: "commonProgressTransportationExportDestination",
          status: progress?.exportDestination,
          testId: "exportDestination",
          url: `${psContext}/what-export-destination`,
          error: errors?.exportDestination,
        },
      ],
    },
  ];
};
