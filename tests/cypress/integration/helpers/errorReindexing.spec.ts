import { reindexContainerErrors, reindexDocumentErrors } from "~/helpers/errorReindexing";
import type { IErrorsTransformed } from "~/types/errors";

describe("errorReindexing helpers", () => {
  describe("reindexContainerErrors", () => {
    it("should remove a deleted container error and shift higher indices down", () => {
      const currentErrors: IErrorsTransformed = {
        "containerNumbers.0": {
          key: "containerNumbers.0",
          message: "containerNumberRequired",
          fieldId: "containerNumbers.0-error",
        },
        "containerNumbers.1": {
          key: "containerNumbers.1",
          message: "containerNumberInvalid",
          fieldId: "containerNumbers.1-error",
        },
        "containerNumbers.2": {
          key: "containerNumbers.2",
          message: "containerNumberTooLong",
          fieldId: "containerNumbers.2-error",
        },
        someOtherKey: {
          key: "someOtherKey",
          message: "unrelatedError",
          fieldId: "someOtherKey-error",
        },
      };

      const result = reindexContainerErrors(currentErrors, 1);

      expect(result).to.deep.equal({
        "containerNumbers.0": currentErrors["containerNumbers.0"],
        "containerNumbers.1": currentErrors["containerNumbers.2"],
        someOtherKey: currentErrors["someOtherKey"],
      });

      // Ensure the removed index is not present
      expect(result).not.to.have.property("containerNumbers.2");
    });

    it("should preserve non-container error keys unchanged", () => {
      const currentErrors: IErrorsTransformed = {
        "containerNumbers.0": {
          key: "containerNumbers.0",
          message: "containerNumberRequired",
          fieldId: "containerNumbers.0-error",
        },
        vesselName: {
          key: "vesselName",
          message: "vesselNameRequired",
          fieldId: "vesselName-error",
        },
      };

      const result = reindexContainerErrors(currentErrors, 0);

      expect(result).to.deep.equal({
        vesselName: currentErrors["vesselName"],
      });
    });
  });

  describe("reindexDocumentErrors", () => {
    it("should remove a deleted document error and shift remaining indices", () => {
      const currentErrors: IErrorsTransformed = {
        "supportingDocuments-0": {
          key: "supportingDocuments-0",
          message: "documentTitleRequired",
          fieldId: "supportingDocuments-0-error",
        },
        "supportingDocuments-1": {
          key: "supportingDocuments-1",
          message: "documentFileRequired",
          fieldId: "supportingDocuments-1-error",
        },
      };

      const result = reindexDocumentErrors(currentErrors, 0, "supportingDocuments");

      expect(result).to.deep.equal({
        "supportingDocuments-0": currentErrors["supportingDocuments-1"],
      });

      // Ensure removed index is dropped and no leftover index remains
      expect(result).not.to.have.property("supportingDocuments-1");
    });

    it("should preserve unrelated error keys for document reindexing", () => {
      const currentErrors: IErrorsTransformed = {
        "supportingDocuments-0": {
          key: "supportingDocuments-0",
          message: "documentTitleRequired",
          fieldId: "supportingDocuments-0-error",
        },
        someOtherError: {
          key: "someOtherError",
          message: "someError",
          fieldId: "someOtherError-error",
        },
      };

      const result = reindexDocumentErrors(currentErrors, 0, "supportingDocuments");

      expect(result).to.deep.equal({
        someOtherError: currentErrors["someOtherError"],
      });
    });
  });
});
