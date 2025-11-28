import { type ITestParams, TestCaseId } from "~/types";

const documentNumber = "GBR-2022-PS-F0285BD8A";
const productId = "product-123";
const removeProductUrl = `/create-processing-statement/${documentNumber}/remove-product/${productId}`;

describe("Remove Product Page - FI0-10296", () => {
  describe("Scenario 1 - Page Structure", () => {
    it("should display correct page title and question with product description", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductPageLoads,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.contains("h1", "Remove a product").should("be.visible");
      cy.contains("Do you want to remove 'Frozen Atlantic Salmon Fillets' and all its associated species?").should(
        "be.visible"
      );
    });

    it("should have Yes and No radio buttons displayed inline", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductPageLoads,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });
      cy.get(".govuk-radios--inline").should("exist");
    });

    it("should display Back link at top", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductPageLoads,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.get("a.govuk-back-link").should("be.visible");
    });

    it("should display Save as draft and Save and continue buttons", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductPageLoads,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.get('[data-testid="save-draft-button"]').should("be.visible").should("contain", "Save as draft");
      cy.get('[data-testid="save-and-continue"]').should("be.visible").should("contain", "Save and continue");
    });

    it("should display Back to your progress link", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductPageLoads,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.contains("a", "Back to your progress").should("be.visible");
    });
  });

  describe("Scenario 2 - Yes + Save and continue + other products remaining", () => {
    it("should remove product and navigate to catch-added", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductYesSaveAndContinueWithProducts,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });
      cy.wait(50); // Wait for MSW to set up

      cy.get("#removeProductYes").check();
      cy.get("form").submit();

      cy.url().should("include", `/create-processing-statement/${documentNumber}/catch-added`);
    });
  });

  describe("Scenario 3 - Yes + Save and continue + no other products remaining", () => {
    it("should remove product and navigate to add-consignment-details", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductYesSaveAndContinueNoProducts,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });
      cy.wait(50); // Wait for MSW to set up

      cy.get("#removeProductYes").check();
      cy.get("form").submit();

      cy.url().should("include", `/create-processing-statement/${documentNumber}/add-consignment-details`);
    });
  });

  describe("Scenario 4 - Yes + Save as draft", () => {
    it("should not remove product and navigate to progress", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductYesSaveAsDraft,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });
      cy.wait(50); // Wait for MSW to set up

      cy.get("#removeProductYes").check();
      cy.get('[data-testid="save-draft-button"]').click();

      cy.url().should("include", `/create-processing-statement/${documentNumber}/progress`);
    });
  });

  describe("Scenario 5 - No + Save and continue", () => {
    it("should not remove product and navigate to catch-added", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductNoSaveAndContinue,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });
      cy.wait(50); // Wait for MSW to set up

      cy.get("#removeProductNo").check();
      cy.get("form").submit();

      cy.url().should("include", `/create-processing-statement/${documentNumber}/catch-added`);
    });
  });

  describe("Scenario 6 - No + Save as draft", () => {
    it("should not remove product and navigate to progress", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductNoSaveAsDraft,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });
      cy.wait(50); // Wait for MSW to set up

      cy.get("#removeProductNo").check();
      cy.get('[data-testid="save-draft-button"]').click();

      cy.url().should("include", `/create-processing-statement/${documentNumber}/progress`);
    });
  });

  describe("Scenario 7 - Welsh translations", () => {
    it("should display all text in Welsh", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductWelsh,
        lng: "cy",
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.contains("h1", "Tynnwch gynnyrch").should("be.visible");
      cy.contains("Hoffech chi dynnu 'Frozen Atlantic Salmon Fillets' a'r holl rywogaethau cysylltiedig?").should(
        "be.visible"
      );
      cy.get("#removeProductYes").parent().should("contain", "Ydw");
      cy.get("#removeProductNo").parent().should("contain", "Nac ydw");
    });
  });

  describe("Scenario 8 - Admin app access", () => {
    it("should work when accessed from Admin app", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductFromAdmin,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.contains("h1", "Remove a product").should("be.visible");
    });
  });

  describe("Scenario 9 - Non-JS functionality", () => {
    it("should work without JavaScript", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductNonJS,
        disableScripts: true,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.get("#removeProductYes").check();
      cy.get("form").submit();

      cy.url().should("include", `/create-processing-statement/${documentNumber}/catch-added`);
    });
  });

  describe("Scenario 10 - Accessibility", () => {
    it("should be accessible and comply with GDS guidelines", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductAccessibility,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      // Check ARIA attributes
      cy.get("fieldset").should("exist");
      cy.get("legend").should("exist");
      cy.get(".govuk-radios__input").should("have.attr", "type", "radio");

      // Check labels are properly associated
      cy.get("#removeProductYes").should("have.attr", "id", "removeProductYes");
      cy.get('label[for="removeProductYes"]').should("exist");
    });
  });

  describe("Error Handling - No selection", () => {
    it("should display error when no radio button selected", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.RemoveProductNoSelection,
      };
      cy.visit(removeProductUrl, { qs: { ...testParams } });

      cy.get("form").submit();
      cy.get("#removeProduct-error").should("be.visible");
      cy.get("#removeProduct-error").should("contain", "Select yes if you want to remove this product");
      cy.contains("h2", /^There is a problem$/).should("be.visible");
      cy.contains("a", /^Select yes if you want to remove this product and all its associated species$/).should(
        "be.visible"
      );

      cy.get(".govuk-form-group").should("have.class", "govuk-form-group--error");
      cy.get("fieldset.govuk-fieldset").should("have.attr", "aria-describedby", "removeProduct-error");
    });
  });
});
