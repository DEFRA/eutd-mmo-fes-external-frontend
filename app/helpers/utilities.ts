import isEmpty from "lodash/isEmpty";
import moment from "moment";
import { route } from "routes-gen";
import type { SearchState, Species } from "~/types";
import { Page } from ".";

export const isTestEnv = () => process.env.NODE_ENV === "test";

export const isProdEnv = () => process.env.NODE_ENV === "production";

export const isValidDate = (date = "", format: string | string[] = "YYYY-M-D") => moment(date, format, true).isValid();

export const shouldRenderGA = (isCookieAccepted = false) => isProdEnv() && isCookieAccepted;

export const getPageNameFromUrl = (url: string): string => {
  const parsedUrl = new URL(url);
  const pagePath = parsedUrl?.pathname ?? "";

  let pageName: Page = Page.Unknown;

  if (pagePath === route("/")) {
    pageName = Page.HomePage;
  }

  if (pagePath.match(/^\/create-catch-certificate\/catch-certificates/i)) {
    pageName = Page.CreateCatchCertificate;
  }

  if (pagePath.match(/^\/create-catch-certificate\/privacy-notice/i)) {
    pageName = Page.CreateCatchCertificatePrivacyNotice;
  }

  if (pagePath.match(/^\/create-processing-statement\/processing-statements/i)) {
    pageName = Page.CreateProcessingStatement;
  }

  if (pagePath.match(/\/create-storage-document\/storage-documents/i)) {
    pageName = Page.CreateStorageDocument;
  }

  if (pagePath.match(/^\/create-processing-statement\/privacy-notice/i)) {
    pageName = Page.CreateProcessingStatementPrivacyNotice;
  }

  if (pagePath.match(/\/create-storage-document\/privacy-notice/i)) {
    pageName = Page.CreateStorageDocumentPrivacyNotice;
  }

  if (pagePath.includes(route("/manage-favourites"))) {
    pageName = Page.ManageFavourites;
  }

  if (pagePath === route("/accessibility")) {
    pageName = Page.Accessibility;
  }

  if (pagePath === route("/cookies")) {
    pageName = Page.Cookies;
  }

  if (pagePath === route("/privacy-notice")) {
    pageName = Page.Privacy;
  }

  if (pagePath === route("/service-improvement-plan")) {
    pageName = Page.ServiceImprovement;
  }

  if (pagePath === "/forbidden") {
    pageName = Page.Forbidden;
  }

  if (pagePath === route("/sign-out")) {
    pageName = Page.SignOut;
  }

  if (pagePath.match(/forbidden\/[0-9]{20}\//i)) {
    pageName = Page.Support;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/progress$/i)) {
    pageName = Page.Progress;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/progress$/i)) {
    pageName = Page.ProgressProcessingStatement;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/progress$/i)) {
    pageName = Page.ProgressStorageDocument;
  }

  if (pagePath.includes("/delete-this-draft-catch-certificate")) {
    pageName = Page.DeleteCatchCertificate;
  }

  if (pagePath.includes("/delete-this-draft-processing-statement")) {
    pageName = Page.DeleteProcessingStatement;
  }

  if (pagePath.includes("/delete-this-draft-storage-document")) {
    pageName = Page.DeleteStorageDocument;
  }

  if (pagePath.includes("/what-exporters-address")) {
    pageName = Page.WhatExporterPageAddress;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/landings-entry$/i)) {
    pageName = Page.LandingsEntry;
  }

  if (pagePath.includes("/landings-type-confirmation")) {
    pageName = Page.LandingsTypeConfirmation;
  }

  if (pagePath.includes("/do-you-have-additional-transport-types")) {
    pageName = Page.AdditionalTransportTypes;
  }

  if (pagePath.includes("/what-export-journey")) {
    pageName = Page.WhatExportJourney;
  }

  if (pagePath.includes("/whose-waters-were-they-caught-in")) {
    pageName = Page.WhoseWaters;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-exporter-details$/i)) {
    pageName = Page.AddExporterDetails;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/add-exporter-details$/i)) {
    pageName = Page.ProcessingStatementAddExporterDetails;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-exporter-details$/i)) {
    pageName = Page.StorageDocumentAddExporterDetails;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-your-reference$/i)) {
    pageName = Page.AddYourReference;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/add-your-reference$/i)) {
    pageName = Page.ProcessingStatementAddYourReference;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-your-reference$/i)) {
    pageName = Page.StorageDocumentAddYourReference;
  }

  if (pagePath.includes("/add-consignment-details")) {
    pageName = Page.ProcessingStatementAddConsignmentDetails;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/how-does-the-export-leave-the-uk$/i)) {
    pageName = Page.HowDoesTheExportLeaveTheUk;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/how-does-the-export-leave-the-uk$/i)) {
    pageName = Page.StorageDocumentHowDoesTheExportLeaveTheUk;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/copy-void-confirmation$/i)) {
    pageName = Page.CopyVoidConfirmation;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/copy-void-confirmation$/i)) {
    pageName = Page.PsCopyVoidConfirmation;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/copy-void-confirmation$/i)) {
    pageName = Page.SdCopyVoidConfirmation;
  }

  if (pagePath.includes("/copy-this-catch-certificate")) {
    pageName = Page.CopyThisCatchCertificate;
  }

  if (pagePath.includes("/what-are-you-exporting")) {
    pageName = Page.WhatAreYouExporting;
  }

  if (pagePath.includes("void-this-catch-certificate")) {
    pageName = Page.VoidThisCatchCertificate;
  }

  if (pagePath.includes("/void-this-processing-statement")) {
    pageName = Page.VoidThisProcessingStatement;
  }

  if (pagePath.includes("/void-this-storage-document")) {
    pageName = Page.VoidThisStorageDocument;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-transportation-details-truck$/i)) {
    pageName = Page.AddTransportationDetailsTruck;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-transportation-details-container-vessel$/i)) {
    pageName = Page.AddTransportationDetailsContainerVessel;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-transportation-details-train$/i)) {
    pageName = Page.AddTransportationDetailsContainerTrain;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-transportation-details-plane$/i)) {
    pageName = Page.AddTransportationDetailsPlane;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-additional-transport-documents-truck$/i)) {
    pageName = Page.AddAdditionalTransportationDocumentsTruck;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-additional-transport-documents-container-vessel$/i)) {
    pageName = Page.AddAdditionalTransportationDocumentsContainerVessel;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-additional-transport-documents-train$/i)) {
    pageName = Page.AddAdditionalTransportationDocumentsContainerTrain;
  }

  if (pagePath.match(/^\/create-catch-certificate\/.*\/add-additional-transport-documents-plane$/i)) {
    pageName = Page.AddAdditionalTransportationDocumentsPlane;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-arrival-transportation-details-truck$/i)) {
    pageName = Page.AddArrivalTransportationDetailsTruck;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-arrival-transportation-details-container-vessel$/i)) {
    pageName = Page.AddArrivalTransportationDetailsContainerVessel;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-arrival-transportation-details-train$/i)) {
    pageName = Page.AddArrivalTransportationDetailsTrain;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-arrival-transportation-details-plane$/i)) {
    pageName = Page.AddArrivalTransportationDetailsPlane;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-transportation-details-truck$/i)) {
    pageName = Page.StorageDocumentAddTransportationDetailsTruck;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-transportation-details-container-vessel$/i)) {
    pageName = Page.StorageDocumentAddTransportationDetailsContainerVessel;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-transportation-details-train$/i)) {
    pageName = Page.StorageDocumentAddTransportationDetailsContainerTrain;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/add-transportation-details-plane$/i)) {
    pageName = Page.StorageDocumentAddTransportationDetailsPlane;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/departure-product-summary$/i)) {
    pageName = Page.StorageDocumentDepartureProductSummary;
  }

  if (pagePath.includes("/upload-file")) {
    pageName = Page.UploadFile;
  }

  if (pagePath.includes("/check-your-information")) {
    pageName = Page.CheckYourInformation;
  }

  if (pagePath.includes("/catch-certificate-created")) {
    pageName = Page.CatchCertificateCreated;
  }

  if (pagePath.includes("/catch-certificate-created")) {
    pageName = Page.CatchCertificateCreated;
  }

  if (pagePath.includes("/direct-landing")) {
    pageName = Page.DirectLandings;
  }

  if (pagePath.includes("/add-landings")) {
    pageName = Page.AddLandings;
  }

  if (pagePath.includes("/upload-guidance")) {
    pageName = Page.UploadGuidance;
  }

  if (pagePath.includes("/add-catch-details")) {
    pageName = Page.AddCatchDetails;
  }

  if (pagePath.includes("/copy-this-processing-statement")) {
    pageName = Page.CopyThisProcessingStatement;
  }

  if (pagePath.includes("/copy-this-storage-document")) {
    pageName = Page.CopyThisStorageDocument;
  }

  if (pagePath.includes("/add-processing-plant-details")) {
    pageName = Page.AddProcessingPlantDetails;
  }

  if (pagePath.includes("/add-health-certificate")) {
    pageName = Page.AddProcessingHealthCertificate;
  }

  if (pagePath.includes("/processing-statement-created")) {
    pageName = Page.ProcessingStatementCreated;
  }

  if (pagePath.includes("/storage-document-created")) {
    pageName = Page.StorageDocumentCreated;
  }

  if (pagePath.includes("/add-processing-plant-address")) {
    pageName = Page.AddProcessingPlantAddress;
  }
  if (pagePath.match(/^\/create-catch-certificate\/.*\/what-exporters-address$/i)) {
    pageName = Page.WhatExporterPageAddress;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/what-exporters-address$/i)) {
    pageName = Page.ProcessingStatementWhatExporterPageAddress;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/what-exporters-address$/i)) {
    pageName = Page.StorageDocumentWhatExporterPageAddress;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/check-your-information$/i)) {
    pageName = Page.ProcessingStatementCheckYourInformation;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/check-your-information$/i)) {
    pageName = Page.StorageDocumentCheckYourInformation;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/what-export-destination$/i)) {
    pageName = Page.ExportDestination;
  }

  if (pagePath.includes("/add-product-to-this-consignment")) {
    pageName = Page.AddProductToThisConsignment;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/you-have-added-a-product$/i)) {
    pageName = Page.StorageDocumentYouHaveAddedAProduct;
  }

  if (pagePath.includes("/catch-added")) {
    pageName = Page.CatchAdded;
  }

  if (pagePath.includes("/what-processing-plant-address")) {
    pageName = Page.WhatprocessingPlantAddress;
  }

  if (pagePath.includes("/add-storage-facility-details")) {
    pageName = Page.AddStorageFacility;
  }

  if (pagePath.includes("/add-storage-facility-approval")) {
    pageName = Page.StorageDocumentStorageFacilityApproval;
  }

  if (pagePath.includes("/what-storage-facility-address")) {
    pageName = Page.WhatStorageFacility;
  }

  if (pagePath.match(/^\/create-storage-document\/.*\/how-does-the-consignment-arrive-to-the-uk$/i)) {
    pageName = Page.HowDoesTheConsignmentArriveAToTheUk;
  }

  if (pagePath.match(/^\/create-processing-statement\/.*\/remove-product\/.*$/i)) {
    pageName = Page.ProcessingStatementRemoveProduct;
  }

  return pageName;
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
    .filter((option: Species) => optionName(option).toLowerCase().indexOf(queryStr) !== -1)
    .map((option: Species) => {
      const commonRank = option.commonRank ?? 0;
      let rank;
      if (option.faoCode?.toLowerCase().indexOf(queryStr) !== -1) rank = 1;
      else if (option.faoName?.toLowerCase().indexOf(queryStr) !== -1) rank = 10 + commonRank;
      else if (option.scientificName?.toLowerCase().indexOf(queryStr) !== -1) rank = 20 + commonRank;
      else if ((option.commonNames ?? []).join("").toLowerCase().indexOf(queryStr) !== -1) rank = 20 + commonRank;
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
