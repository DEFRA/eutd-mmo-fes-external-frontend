import { displayErrorMessagesInOrder, getTransformedError } from "~/helpers/lookupErrorText";
import type { IError, IErrorsTransformed } from "~/types/errors";

describe("lookupErrorText helpers", () => {
  describe("getTransformedError", () => {
    it("should transform an array of errors into an object with error keys", () => {
      const errors: IError[] = [
        {
          key: "product",
          message: "ccAddLandingForProductError",
        },
        {
          key: "vessel.vesselName",
          message: "ccAddVesselFormVesselNameError",
        },
      ];

      const result = getTransformedError(errors);

      expect(result).to.deep.equal({
        product: {
          key: "product",
          message: "ccAddLandingForProductError",
          value: undefined,
          fieldId: "product-error",
        },
        "vessel.vesselName": {
          key: "vessel.vesselName",
          message: "ccAddVesselFormVesselNameError",
          value: undefined,
          fieldId: "vessel.vesselName-error",
        },
      });
    });

    it("should include error values when provided", () => {
      const errors: IError[] = [
        {
          key: "product_123",
          message: "ccAddLandingForProductError",
          value: {
            species: "Atlantic cod (COD)",
            state: "Frozen",
            presentation: "Filleted",
            commodityCode: "03047190",
          },
        },
      ];

      const result = getTransformedError(errors);

      expect(result.product_123.value).to.deep.equal({
        species: "Atlantic cod (COD)",
        state: "Frozen",
        presentation: "Filleted",
        commodityCode: "03047190",
      });
    });
  });

  describe("displayErrorMessagesInOrder", () => {
    it("should return errors in the specified order", () => {
      const errors: IErrorsTransformed = {
        "vessel.vesselName": {
          key: "vessel.vesselName",
          message: "ccAddVesselFormVesselNameError",
          fieldId: "vessel.vesselName-error",
        },
        product: {
          key: "product",
          message: "ccAddLandingForProductError",
          fieldId: "product-error",
        },
        dateLanded: {
          key: "dateLanded",
          message: "ccAddLandingDateLandedError",
          fieldId: "dateLanded-error",
        },
      };

      const errorKeysInOrder = ["product", "dateLanded", "vessel.vesselName"];

      const result = displayErrorMessagesInOrder(errors, errorKeysInOrder);

      expect(result).to.have.length(3);
      expect(result[0].key).to.equal("product");
      expect(result[1].key).to.equal("dateLanded");
      expect(result[2].key).to.equal("vessel.vesselName");
    });

    it("should handle errors with the same prefix (e.g., multiple products)", () => {
      const errors: IErrorsTransformed = {
        "product_GBR-2026-CC-123-abc": {
          key: "product_GBR-2026-CC-123-abc",
          message: "ccAddLandingForProductError",
          value: {
            species: "European lobster (LBE)",
            state: "Alive",
            presentation: "Whole",
            commodityCode: "03063210",
          },
          fieldId: "product_GBR-2026-CC-123-abc-error",
        },
        "product_GBR-2026-CC-123-def": {
          key: "product_GBR-2026-CC-123-def",
          message: "ccAddLandingForProductError",
          value: {
            species: "Atlantic cod (COD)",
            state: "Frozen",
            presentation: "Filleted",
            commodityCode: "03047190",
          },
          fieldId: "product_GBR-2026-CC-123-def-error",
        },
        "product_GBR-2026-CC-123-ghi": {
          key: "product_GBR-2026-CC-123-ghi",
          message: "ccAddLandingForProductError",
          value: {
            species: "Patagonian toothfish (TOP)",
            state: "Fresh",
            presentation: "Filleted and skinned",
            commodityCode: "03044600",
          },
          fieldId: "product_GBR-2026-CC-123-ghi-error",
        },
        dateLanded: {
          key: "dateLanded",
          message: "ccAddLandingDateLandedError",
          fieldId: "dateLanded-error",
        },
      };

      const errorKeysInOrder = ["product", "dateLanded"];

      const result = displayErrorMessagesInOrder(errors, errorKeysInOrder);

      // Should return ALL 3 product errors plus the dateLanded error
      expect(result).to.have.length(4);

      // First 3 should be product errors
      expect(result[0].key).to.include("product_");
      expect(result[1].key).to.include("product_");
      expect(result[2].key).to.include("product_");

      // Last should be dateLanded
      expect(result[3].key).to.equal("dateLanded");

      // Verify all three product errors are present
      const productErrorKeys = result.slice(0, 3).map((err) => err.key);
      expect(productErrorKeys).to.include("product_GBR-2026-CC-123-abc");
      expect(productErrorKeys).to.include("product_GBR-2026-CC-123-def");
      expect(productErrorKeys).to.include("product_GBR-2026-CC-123-ghi");
    });

    it("should return empty array when no errors match the order keys", () => {
      const errors: IErrorsTransformed = {
        someOtherError: {
          key: "someOtherError",
          message: "someError",
          fieldId: "someOtherError-error",
        },
      };

      const errorKeysInOrder = ["product", "dateLanded"];

      const result = displayErrorMessagesInOrder(errors, errorKeysInOrder);

      expect(result).to.have.length(0);
    });

    it("should handle partial prefix matches correctly", () => {
      const errors: IErrorsTransformed = {
        "eez.0": {
          key: "eez.0",
          message: "eezError",
          fieldId: "eez.0-error",
        },
        "eez.1": {
          key: "eez.1",
          message: "eezError",
          fieldId: "eez.1-error",
        },
        "eez.2": {
          key: "eez.2",
          message: "eezError",
          fieldId: "eez.2-error",
        },
      };

      const errorKeysInOrder = ["eez.0", "eez.1", "eez.2"];

      const result = displayErrorMessagesInOrder(errors, errorKeysInOrder);

      expect(result).to.have.length(3);
      expect(result[0].key).to.equal("eez.0");
      expect(result[1].key).to.equal("eez.1");
      expect(result[2].key).to.equal("eez.2");
    });

    it("should handle defect 501 scenario: multiple products without landings", () => {
      // This is the exact scenario from Defect 501
      const errors: IErrorsTransformed = {
        "product_GBR-2026-CC-6F4280A99-a5c08064-09b8-4b0a-9c0c-73d7f191ba16": {
          key: "product_GBR-2026-CC-6F4280A99-a5c08064-09b8-4b0a-9c0c-73d7f191ba16",
          message: "ccAddLandingForProductError",
          value: {
            species: "European lobster (LBE)",
            state: "Alive",
            presentation: "Whole",
            commodityCode: "03063210",
          },
          fieldId: "product_GBR-2026-CC-6F4280A99-a5c08064-09b8-4b0a-9c0c-73d7f191ba16-error",
        },
        "product_GBR-2026-CC-6F4280A99-95c03e98-0131-4cc0-9933-8701a135e2ea": {
          key: "product_GBR-2026-CC-6F4280A99-95c03e98-0131-4cc0-9933-8701a135e2ea",
          message: "ccAddLandingForProductError",
          value: {
            species: "Atlantic cod (COD)",
            state: "Frozen",
            presentation: "Filleted",
            commodityCode: "03047190",
          },
          fieldId: "product_GBR-2026-CC-6F4280A99-95c03e98-0131-4cc0-9933-8701a135e2ea-error",
        },
        "product_GBR-2026-CC-6F4280A99-7f36ad60-6312-4ffc-9bc9-1bdbebf9af1d": {
          key: "product_GBR-2026-CC-6F4280A99-7f36ad60-6312-4ffc-9bc9-1bdbebf9af1d",
          message: "ccAddLandingForProductError",
          value: {
            species: "Patagonian toothfish (TOP)",
            state: "Fresh",
            presentation: "Filleted and skinned",
            commodityCode: "03044600",
          },
          fieldId: "product_GBR-2026-CC-6F4280A99-7f36ad60-6312-4ffc-9bc9-1bdbebf9af1d-error",
        },
      };

      const errorKeysInOrder = [
        "yourproducts",
        "product",
        "startDate",
        "dateLanded",
        "highSeasArea",
        "eez.0",
        "eez.1",
        "eez.2",
        "eez.3",
        "eez.4",
        "vessel.vesselName",
        "exportWeight",
        "gearCategory",
        "gearType",
      ];

      const result = displayErrorMessagesInOrder(errors, errorKeysInOrder);

      // CRITICAL: Should return ALL 3 errors, not just the first one
      expect(result).to.have.length(3);

      // Verify each product error is included
      const errorKeys = result.map((err) => err.key);
      expect(errorKeys).to.include("product_GBR-2026-CC-6F4280A99-a5c08064-09b8-4b0a-9c0c-73d7f191ba16");
      expect(errorKeys).to.include("product_GBR-2026-CC-6F4280A99-95c03e98-0131-4cc0-9933-8701a135e2ea");
      expect(errorKeys).to.include("product_GBR-2026-CC-6F4280A99-7f36ad60-6312-4ffc-9bc9-1bdbebf9af1d");

      // Verify all errors have the correct message
      result.forEach((error) => {
        expect(error.message).to.equal("ccAddLandingForProductError");
        expect(error.value).to.have.property("species");
        expect(error.value).to.have.property("commodityCode");
      });
    });
  });
});
