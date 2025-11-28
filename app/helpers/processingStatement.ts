import type { Catch, CatchIndex } from "~/types";

export const getCatchAddedHeaders = (
  productDescription: string,
  speciesNameFAO: string,
  catchCertificateNumber: string,
  catchCertificateWeight: string,
  exportWeightBeforeProcessing: string,
  exportWeightAfterProcessing: string
) => [
  { id: "productDescription", text: productDescription },
  { id: "speciesNameFAO", text: speciesNameFAO },
  { id: "catchCertificateNumber", text: catchCertificateNumber },
  { id: "catchCertificateWeight", text: catchCertificateWeight },
  {
    id: "exportWeightBeforeProcessing",
    text: exportWeightBeforeProcessing,
  },
  {
    id: "exportWeightAfterProcessing",
    text: exportWeightAfterProcessing,
  },
];

export const getCatchDetailsHeaders = (
  speciesNameFAO: string,
  catchCertificateWeight: string,
  exportWeightBeforeProcessing: string,
  exportWeightAfterProcessing: string,
  action: string
) => [
  { id: "speciesNameFAO", text: speciesNameFAO },
  { id: "catchCertificateWeight", text: catchCertificateWeight },
  {
    id: "exportWeightBeforeProcessing",
    text: exportWeightBeforeProcessing,
  },
  {
    id: "exportWeightAfterProcessing",
    text: exportWeightAfterProcessing,
  },
  { id: "action", text: action },
];

const getProductDescriptionClass = (productDescription: string, uniqueDescriptions: string[]) => {
  const tagClasses = [
    "govuk-tag--grey",
    "govuk-tag--green",
    "govuk-tag--turquoise",
    "govuk-tag--blue",
    "govuk-tag--light-blue",
    "govuk-tag--purple",
    "govuk-tag--pink",
    "govuk-tag--red",
    "govuk-tag--orange",
    "govuk-tag--yellow",
  ];

  const index = uniqueDescriptions.indexOf(productDescription);
  return tagClasses[index % tagClasses.length] || "govuk-tag--grey";
};

export const getCatchesWithTags = (catches?: Catch[]): (Catch & CatchIndex & { tagClass?: string })[] | Catch[] => {
  if (Array.isArray(catches)) {
    const uniqueDescriptions: string[] = [];
    catches.forEach((c: Catch) => {
      const desc = (c.productDescription ?? "").toString();
      if (!uniqueDescriptions.includes(desc)) uniqueDescriptions.push(desc);
    });

    return catches.map((ctch: Catch) => ({
      ...ctch,
      tagClass: getProductDescriptionClass((ctch.productDescription ?? "").toString(), uniqueDescriptions),
    }));
  }

  return [];
};

export function countUniqueSpeciesByCode(catches?: Catch[] | null): number {
  if (!catches || catches.length === 0) return 0;
  const seen = new Set<string>();
  for (const c of catches) {
    if (c && typeof c.speciesCode === "string") {
      const code = c.speciesCode.trim();
      if (code) seen.add(code);
    }
  }
  return seen.size;
}

export function countUniqueDocumentByCatchCertificateNumber(catches?: Catch[] | null): number {
  if (!catches || catches.length === 0) return 0;
  const seen = new Set<string>();
  for (const c of catches) {
    if (c && typeof c.catchCertificateNumber === "string") {
      const code = c.catchCertificateNumber.trim();
      if (code) seen.add(code);
    }
  }
  return seen.size;
}

export const getTitleKey = (ctches: Catch[] | undefined) =>
  Array.isArray(ctches) && ctches.length === 1 ? "psCatchAddedSingleCatchTitle" : "psCatchAddedMultiCatchTitle";
