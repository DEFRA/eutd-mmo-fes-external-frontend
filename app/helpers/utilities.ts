import isEmpty from "lodash/isEmpty";
import moment from "moment";
import { route } from "routes-gen";
import type { SearchState, Species } from "~/types";
import { Page } from "./pages";

export const isTestEnv = () => process.env.NODE_ENV === "test";

export const isProdEnv = () => process.env.NODE_ENV === "production";

export const isValidDate = (date = "", format: string | string[] = "YYYY-M-D") => {
  const m = moment(date, format, true);
  // moment.js in strict mode accepts year 0000 as valid; reject any year < 1000
  // (a 4-digit non-zero year) so that entries like 0000 surface as invalid.
  return m.isValid() && m.year() >= 1000;
};

export const shouldRenderGA = (isCookieAccepted = false) => isProdEnv() && isCookieAccepted;

type PageMatcher = { test: (path: string) => boolean; page: Page };

const PAGE_MATCHERS: PageMatcher[] = [
  { test: (p) => p === route("/"), page: Page.HomePage },
  { test: (p) => /^\/create-catch-certificate\/catch-certificates/i.test(p), page: Page.CreateCatchCertificate },
  {
    test: (p) => /^\/create-catch-certificate\/privacy-notice/i.test(p),
    page: Page.CreateCatchCertificatePrivacyNotice,
  },
  {
    test: (p) => /^\/create-processing-statement\/processing-statements/i.test(p),
    page: Page.CreateProcessingStatement,
  },
  {
    test: (p) => /\/create-non-manipulation-document\/non-manipulation-documents/i.test(p),
    page: Page.CreateStorageDocument,
  },
  {
    test: (p) => /^\/create-processing-statement\/privacy-notice/i.test(p),
    page: Page.CreateProcessingStatementPrivacyNotice,
  },
  {
    test: (p) => /\/create-non-manipulation-document\/privacy-notice/i.test(p),
    page: Page.CreateStorageDocumentPrivacyNotice,
  },
  { test: (p) => p.includes(route("/manage-favourites")), page: Page.ManageFavourites },
  { test: (p) => p === route("/accessibility"), page: Page.Accessibility },
  { test: (p) => p === route("/cookies"), page: Page.Cookies },
  { test: (p) => p === route("/privacy-notice"), page: Page.Privacy },
  { test: (p) => p === route("/service-improvement-plan"), page: Page.ServiceImprovement },
  { test: (p) => p === "/forbidden", page: Page.Forbidden },
  { test: (p) => p === route("/sign-out"), page: Page.SignOut },
  { test: (p) => /forbidden\/\d{20}\//i.test(p), page: Page.Support },
  { test: (p) => /^\/create-catch-certificate\/.*\/progress$/i.test(p), page: Page.Progress },
  { test: (p) => /^\/create-processing-statement\/.*\/progress$/i.test(p), page: Page.ProgressProcessingStatement },
  { test: (p) => /^\/create-non-manipulation-document\/.*\/progress$/i.test(p), page: Page.ProgressStorageDocument },
  { test: (p) => p.includes("/delete-this-draft-catch-certificate"), page: Page.DeleteCatchCertificate },
  { test: (p) => p.includes("/delete-this-draft-processing-statement"), page: Page.DeleteProcessingStatement },
  { test: (p) => p.includes("/delete-this-draft-non-manipulation-document"), page: Page.DeleteStorageDocument },
  { test: (p) => p.includes("/what-exporters-address"), page: Page.WhatExporterPageAddress },
  { test: (p) => /^\/create-catch-certificate\/.*\/landings-entry$/i.test(p), page: Page.LandingsEntry },
  { test: (p) => p.includes("/landings-type-confirmation"), page: Page.LandingsTypeConfirmation },
  { test: (p) => p.includes("/do-you-have-additional-transport-types"), page: Page.AdditionalTransportTypes },
  { test: (p) => p.includes("/what-export-journey"), page: Page.WhatExportJourney },
  { test: (p) => p.includes("/whose-waters-were-they-caught-in"), page: Page.WhoseWaters },
  { test: (p) => /^\/create-catch-certificate\/.*\/add-exporter-details$/i.test(p), page: Page.AddExporterDetails },
  {
    test: (p) => /^\/create-processing-statement\/.*\/add-exporter-details$/i.test(p),
    page: Page.ProcessingStatementAddExporterDetails,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-exporter-details$/i.test(p),
    page: Page.StorageDocumentAddExporterDetails,
  },
  { test: (p) => /^\/create-catch-certificate\/.*\/add-your-reference$/i.test(p), page: Page.AddYourReference },
  {
    test: (p) => /^\/create-processing-statement\/.*\/add-your-reference$/i.test(p),
    page: Page.ProcessingStatementAddYourReference,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-your-reference$/i.test(p),
    page: Page.StorageDocumentAddYourReference,
  },
  { test: (p) => p.includes("/add-consignment-details"), page: Page.ProcessingStatementAddConsignmentDetails },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/how-does-the-export-leave-the-uk$/i.test(p),
    page: Page.HowDoesTheExportLeaveTheUk,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/how-does-the-consignment-leave-the-uk$/i.test(p),
    page: Page.StorageDocumentHowDoesTheExportLeaveTheUk,
  },
  { test: (p) => /^\/create-catch-certificate\/.*\/copy-void-confirmation$/i.test(p), page: Page.CopyVoidConfirmation },
  {
    test: (p) => /^\/create-processing-statement\/.*\/copy-void-confirmation$/i.test(p),
    page: Page.PsCopyVoidConfirmation,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/copy-void-confirmation$/i.test(p),
    page: Page.SdCopyVoidConfirmation,
  },
  { test: (p) => p.includes("/copy-this-catch-certificate"), page: Page.CopyThisCatchCertificate },
  { test: (p) => p.includes("/what-are-you-exporting"), page: Page.WhatAreYouExporting },
  { test: (p) => p.includes("void-this-catch-certificate"), page: Page.VoidThisCatchCertificate },
  { test: (p) => p.includes("/void-this-processing-statement"), page: Page.VoidThisProcessingStatement },
  { test: (p) => p.includes("/void-this-non-manipulation-document"), page: Page.VoidThisStorageDocument },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-transportation-details-truck$/i.test(p),
    page: Page.AddTransportationDetailsTruck,
  },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-transportation-details-container-vessel$/i.test(p),
    page: Page.AddTransportationDetailsContainerVessel,
  },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-transportation-details-train$/i.test(p),
    page: Page.AddTransportationDetailsContainerTrain,
  },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-transportation-details-plane$/i.test(p),
    page: Page.AddTransportationDetailsPlane,
  },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-additional-transport-documents-truck$/i.test(p),
    page: Page.AddAdditionalTransportationDocumentsTruck,
  },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-additional-transport-documents-container-vessel$/i.test(p),
    page: Page.AddAdditionalTransportationDocumentsContainerVessel,
  },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-additional-transport-documents-train$/i.test(p),
    page: Page.AddAdditionalTransportationDocumentsContainerTrain,
  },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/add-additional-transport-documents-plane$/i.test(p),
    page: Page.AddAdditionalTransportationDocumentsPlane,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-arrival-transportation-details-truck$/i.test(p),
    page: Page.AddArrivalTransportationDetailsTruck,
  },
  {
    test: (p) =>
      /^\/create-non-manipulation-document\/.*\/add-arrival-transportation-details-container-vessel$/i.test(p),
    page: Page.AddArrivalTransportationDetailsContainerVessel,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-arrival-transportation-details-train$/i.test(p),
    page: Page.AddArrivalTransportationDetailsTrain,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-arrival-transportation-details-plane$/i.test(p),
    page: Page.AddArrivalTransportationDetailsPlane,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-transportation-details-truck$/i.test(p),
    page: Page.StorageDocumentAddTransportationDetailsTruck,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-transportation-details-container-vessel$/i.test(p),
    page: Page.StorageDocumentAddTransportationDetailsContainerVessel,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-transportation-details-train$/i.test(p),
    page: Page.StorageDocumentAddTransportationDetailsContainerTrain,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/add-transportation-details-plane$/i.test(p),
    page: Page.StorageDocumentAddTransportationDetailsPlane,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/departure-product-summary$/i.test(p),
    page: Page.StorageDocumentDepartureProductSummary,
  },
  { test: (p) => p.includes("/upload-file"), page: Page.UploadFile },
  { test: (p) => p.includes("/check-your-information"), page: Page.CheckYourInformation },
  { test: (p) => p.includes("/catch-certificate-created"), page: Page.CatchCertificateCreated },
  { test: (p) => p.includes("/direct-landing"), page: Page.DirectLandings },
  { test: (p) => p.includes("/add-landings"), page: Page.AddLandings },
  { test: (p) => p.includes("/upload-guidance"), page: Page.UploadGuidance },
  { test: (p) => p.includes("/add-catch-details"), page: Page.AddCatchDetails },
  { test: (p) => p.includes("/copy-this-processing-statement"), page: Page.CopyThisProcessingStatement },
  { test: (p) => p.includes("/copy-this-non-manipulation-document"), page: Page.CopyThisStorageDocument },
  { test: (p) => p.includes("/add-processing-plant-details"), page: Page.AddProcessingPlantDetails },
  { test: (p) => p.includes("/add-health-certificate"), page: Page.AddProcessingHealthCertificate },
  { test: (p) => p.includes("/processing-statement-created"), page: Page.ProcessingStatementCreated },
  {
    test: (p) => /^\/create-processing-statement\/.*\/eu-data-integration-successful$/i.test(p),
    page: Page.ProcessingStatementEUSuccessful,
  },
  {
    test: (p) => /^\/create-processing-statement\/.*\/eu-data-integration-pending$/i.test(p),
    page: Page.ProcessingStatementEUPending,
  },
  {
    test: (p) => /^\/create-processing-statement\/.*\/eu-data-integration-failed$/i.test(p),
    page: Page.ProcessingStatementEUFailure,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/eu-data-integration-successful$/i.test(p),
    page: Page.StorageDocumentEUSuccessful,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/eu-data-integration-pending$/i.test(p),
    page: Page.StorageDocumentEUPending,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/eu-data-integration-failed$/i.test(p),
    page: Page.StorageDocumentEUFailure,
  },
  { test: (p) => p.includes("/non-manipulation-document-created"), page: Page.StorageDocumentCreated },
  { test: (p) => p.includes("/add-processing-plant-address"), page: Page.AddProcessingPlantAddress },
  {
    test: (p) => /^\/create-catch-certificate\/.*\/what-exporters-address$/i.test(p),
    page: Page.WhatExporterPageAddress,
  },
  {
    test: (p) => /^\/create-processing-statement\/.*\/what-exporters-address$/i.test(p),
    page: Page.ProcessingStatementWhatExporterPageAddress,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/what-exporters-address$/i.test(p),
    page: Page.StorageDocumentWhatExporterPageAddress,
  },
  {
    test: (p) => /^\/create-processing-statement\/.*\/check-your-information$/i.test(p),
    page: Page.ProcessingStatementCheckYourInformation,
  },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/check-your-information$/i.test(p),
    page: Page.StorageDocumentCheckYourInformation,
  },
  {
    test: (p) => /^\/create-processing-statement\/.*\/what-export-destination$/i.test(p),
    page: Page.ExportDestination,
  },
  { test: (p) => p.includes("/add-product-to-this-consignment"), page: Page.AddProductToThisConsignment },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/you-have-added-a-product$/i.test(p),
    page: Page.StorageDocumentYouHaveAddedAProduct,
  },
  { test: (p) => p.includes("/catch-added"), page: Page.CatchAdded },
  { test: (p) => p.includes("/what-processing-plant-address"), page: Page.WhatprocessingPlantAddress },
  { test: (p) => p.includes("/add-storage-facility-details"), page: Page.AddStorageFacility },
  { test: (p) => p.includes("/add-storage-facility-approval"), page: Page.StorageDocumentStorageFacilityApproval },
  { test: (p) => p.includes("/what-storage-facility-address"), page: Page.WhatStorageFacility },
  {
    test: (p) => /^\/create-non-manipulation-document\/.*\/how-does-the-consignment-arrive-to-the-uk$/i.test(p),
    page: Page.HowDoesTheConsignmentArriveAToTheUk,
  },
  {
    test: (p) => /^\/create-processing-statement\/.*\/remove-product\/.*$/i.test(p),
    page: Page.ProcessingStatementRemoveProduct,
  },
];

export const getPageNameFromUrl = (url: string): string => {
  const pagePath = new URL(url).pathname;
  return PAGE_MATCHERS.reduce((pageName, { test, page }) => (test(pagePath) ? page : pageName), Page.Unknown as Page);
};

/**
 *
 * @param label - a string in the form of a species name and code, e.g. Thornback ray (RJC)
 * @returns {string} the species code from the given label or an empty string, e.g. RJC
 */
export const getCodeFromLabel = (label: string): string => {
  const regex = /(.*) \((.*)\)/g;
  const matches = regex.exec(label);
  if (matches && matches.length >= 3) {
    return matches[2];
  }

  return "";
};

export const querySpecies = (query: string, options: Species[]) => {
  if (isEmpty(query)) {
    return [];
  }

  const optionName = (option: Species) => `${option.faoName} (${option.faoCode})`;

  const queryStr = query.toLowerCase();
  return options
    .filter((option: Species) => optionName(option).toLowerCase().includes(queryStr))
    .map((option: Species) => {
      const commonRank = option.commonRank ?? 0;
      let rank;
      if (option.faoCode?.toLowerCase().indexOf(queryStr) !== -1) rank = 1;
      else if (option.faoName?.toLowerCase().indexOf(queryStr) !== -1) rank = 10 + commonRank;
      else if (option.scientificName?.toLowerCase().indexOf(queryStr) !== -1) rank = 20 + commonRank;
      else if ((option.commonNames ?? []).join("").toLowerCase().includes(queryStr)) rank = 20 + commonRank;
      option.rank = rank ?? 100;
      return option;
    })
    .sort((a: Species, b: Species) => {
      const rankA = a.rank ?? 0;
      const rankB = b.rank ?? 0;
      const faoCodeA = a.faoCode ?? "";
      const faoCodeB = b.faoCode ?? "";

      if (rankA < rankB) {
        return -1;
      }

      if (rankA > rankB) {
        return 1;
      }

      if (faoCodeA < faoCodeB) {
        return -1;
      }

      if (faoCodeA > faoCodeB) {
        return 1;
      }

      return 0;
    })
    .map((option: Species) => optionName(option));
};

export const mapStates = (stateLookup: SearchState[]) => {
  const states = stateLookup?.map((_: SearchState) => ({ label: _.state.label, value: _.state.value })) ?? [];
  return states;
};

export const mapPresentations = (stateLookup: SearchState[], stateCode: string) => {
  const presentations = stateLookup?.find((_: SearchState) => _.state.value === stateCode)?.presentations ?? [];
  return presentations;
};

/**
 * Group values by partial key matching.
 * @param target Object containing values to be grouped
 * @param keyMatchers Object of matchers where the key represents the group name and the value represents the string to partial match on.
 * @param valueTransformer Optional function for transforming the value to be grouped
 *
 * @return Hash map of grouped results
 */
export const getGroupedValues = <T>(
  target: { [key: string]: any },
  keyMatchers: { [key: string]: string },
  valueTransformer?: (key: string, value: any) => T
): Record<string, T[]> => {
  const groupKeys = Object.keys(keyMatchers);
  if (!groupKeys.length) throw new Error("must provide at least one key matcher");

  const result = groupKeys.reduce((result: Record<string, T[]>, groupName: string) => {
    result[groupName] = [];
    return result;
  }, {});
  const targetKeys = Object.keys(target);
  // exit early if there are no keys to match
  if (!targetKeys.length) return result;

  targetKeys.forEach((targetKey) => {
    const groupKey = groupKeys.find((k) => targetKey.startsWith(keyMatchers[k]));
    if (groupKey) {
      result[groupKey].push(valueTransformer?.(targetKey, target[targetKey]) ?? target[targetKey]);
    }
  });
  return result;
};
