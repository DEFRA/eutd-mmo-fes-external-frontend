import {
  pad2,
  findFieldIndex,
  splitIntoLandingGroups,
  getProductSectionEndIndex,
  PRODUCT_HEADER_FIELDS,
  LANDING_FIELD_ORDER,
} from "./testUtils";

describe("pad2", () => {
  it("pads a single-digit number with a leading zero", () => {
    expect(pad2(3)).toBe("03");
    expect(pad2("5")).toBe("05");
  });

  it("leaves two-digit values unchanged", () => {
    expect(pad2(12)).toBe("12");
    expect(pad2("31")).toBe("31");
  });

  it("leaves values longer than two characters unchanged", () => {
    expect(pad2(100)).toBe("100");
  });
});

describe("findFieldIndex", () => {
  it("returns the index of a matching field", () => {
    expect(findFieldIndex(["species", "state", "export weight"], "state")).toBe(1);
  });

  it("returns -1 when the field is not present", () => {
    expect(findFieldIndex(["species", "state"], "rfmo")).toBe(-1);
  });

  it("matches a substring within a section entry", () => {
    expect(findFieldIndex(["export weight (kg)"], "export weight")).toBe(0);
  });
});

describe("splitIntoLandingGroups", () => {
  it("splits rows into groups terminated by export weight", () => {
    const rows = ["vessel name", "gear type", "export weight", "vessel name", "export weight"];
    const groups = splitIntoLandingGroups(rows);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toEqual(["vessel name", "gear type", "export weight"]);
  });

  it("keeps a trailing group with no export weight row", () => {
    const rows = ["vessel name", "gear type", "export weight", "catch area"];
    const groups = splitIntoLandingGroups(rows);
    expect(groups).toHaveLength(2);
    expect(groups[1]).toEqual(["catch area"]);
  });

  it("returns a single group when no export weight row exists", () => {
    const rows = ["vessel name", "gear type"];
    expect(splitIntoLandingGroups(rows)).toHaveLength(1);
  });
});

describe("getProductSectionEndIndex", () => {
  const speciesIndices = [0, 10, 20];

  it("returns the next species index when it exists", () => {
    expect(getProductSectionEndIndex(speciesIndices, -1, 30, 0)).toBe(10);
  });

  it("returns totalIndex when there is no next species", () => {
    expect(getProductSectionEndIndex(speciesIndices, 25, 30, 2)).toBe(25);
  });

  it("returns textsLength as fallback when totalIndex is -1", () => {
    expect(getProductSectionEndIndex(speciesIndices, -1, 30, 2)).toBe(30);
  });
});

describe("PRODUCT_HEADER_FIELDS", () => {
  it("contains the four expected product header field names", () => {
    expect(PRODUCT_HEADER_FIELDS).toEqual(["species", "state", "presentation", "commodity code"]);
  });
});

describe("LANDING_FIELD_ORDER", () => {
  it("lists all 10 expected landing fields", () => {
    expect(LANDING_FIELD_ORDER).toHaveLength(10);
    expect(LANDING_FIELD_ORDER[0]).toBe("start date");
    expect(LANDING_FIELD_ORDER[LANDING_FIELD_ORDER.length - 1]).toBe("export weight");
  });
});
