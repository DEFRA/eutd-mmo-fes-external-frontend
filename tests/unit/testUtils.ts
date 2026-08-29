/**
 * Shared pure-function utilities extracted from E2E spec files.
 * These are unit-testable helpers that do not depend on any Cypress APIs.
 */

/** Zero-pads a single-digit number or string to two characters. */
export const pad2 = (n: number | string): string => (n.toString().length === 1 ? "0" + n : n.toString());

// ---------------------------------------------------------------------------
// checkYourInformation field-order validation helpers
// ---------------------------------------------------------------------------

export const PRODUCT_HEADER_FIELDS = ["species", "state", "presentation", "commodity code"];

export const LANDING_FIELD_ORDER = [
  "start date",
  "date landed",
  "catch area",
  "high seas area",
  "exclusive economic zone",
  "rfmo",
  "vessel name",
  "gear category",
  "gear type",
  "export weight",
];

/** Returns the index of `field` inside `section`, or -1 if absent. */
export function findFieldIndex(section: string[], field: string): number {
  for (let i = 0; i < section.length; i++) {
    if (section[i].includes(field)) return i;
  }
  return -1;
}

/**
 * Splits a flat array of landing-row labels into groups, where each group ends
 * with the row that contains "export weight".
 */
export function splitIntoLandingGroups(landingRows: string[]): string[][] {
  const groups: string[][] = [];
  let currentGroup: string[] = [];
  for (const label of landingRows) {
    currentGroup.push(label);
    if (label.includes("export weight")) {
      groups.push(currentGroup);
      currentGroup = [];
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);
  return groups;
}

/**
 * Returns the end index for a product section within the full texts array,
 * based on the next species index, the total-weight row, or the array length.
 */
export function getProductSectionEndIndex(
  speciesIndices: number[],
  totalIndex: number,
  textsLength: number,
  prodIdx: number
): number {
  if (prodIdx + 1 < speciesIndices.length) return speciesIndices[prodIdx + 1];
  if (totalIndex > -1) return totalIndex;
  return textsLength;
}
