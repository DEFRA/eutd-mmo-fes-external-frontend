import type { ICompletedDocumentData, IProgressDocumentData, Journey } from "~/types";

export function getDashboardUserReference(document: ICompletedDocumentData | IProgressDocumentData) {
  return document.userReference ? document.userReference : "";
}

export function getJourneyHeader(journey: string, t: any) {
  if (journey === "catchCertificate") {
    return t("ccFavouritesDetailsExemptFromCatchCertificate", { ns: "dashboard" }).toLowerCase();
  } else if (journey === "processingStatement") {
    return t("psAddCatchDetailsExemptFromProcessingStatements", { ns: "dashboard" }).toLowerCase();
  } else {
    return t("sdAddProductToConsignmenStorageDocument", { ns: "dashboard" }).toLowerCase();
  }
}

export function getStatusClassName(status: any, isFailed: any) {
  if (isFailed) return "red";

  if (status === "SUCCESS") return "green";

  if (status === "PENDING") return "blue";

  if (status === "LOCKED") return "yellow";

  return "grey";
}

export function getStatusName(status: any, isFailed: any, t: any) {
  if (isFailed) return t("ccStatusFailed", { ns: "dashboard" });

  if (status === "SUCCESS") return t("ccStatusCompleted", { ns: "dashboard" });

  if (status === "PENDING") return t("ccStatusPending", { ns: "dashboard" });

  if (status === "LOCKED") return t("ccStatusLocked", { ns: "dashboard" });

  return t("ccStatusDraft", { ns: "dashboard" });
}

export function getDashboardName(journey: string | undefined): string {
  const names: { [key: string]: string } = {
    "create-catch-certificate": "catch-certificates",
    "create-processing-statement": "processing-statements",
    "create-storage-document": "storage-documents",
  };

  return journey === undefined ? "catch-certificates" : names[journey];
}

export function getPrivacyNoticeJourney(journey: Journey): string {
  switch (journey) {
    case "catchCertificate":
      return "create-catch-certificate";
    case "processingStatement":
      return "create-processing-statement";
    case "storageNotes":
      return "create-storage-document";
    default:
      return "create-catch-certificate";
  }
}

export function getJourneyFromPath(path: string): Journey {
  if (path.includes("create-catch-certificate")) {
    return "catchCertificate";
  } else if (path.includes("create-processing-statement")) {
    return "processingStatement";
  } else if (path.includes("create-storage-document")) {
    return "storageNotes";
  }
  return "catchCertificate";
}

export function getDashboardUrlForJourney(journey: Journey): string {
  const privacyJourney = getPrivacyNoticeJourney(journey);
  const dashboardName = getDashboardName(privacyJourney);
  return `/${privacyJourney}/${dashboardName}`;
}
