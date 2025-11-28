import { type ITestParams, TestCaseId } from "~/types";

describe("HowDoesTheConsignmentArriveToUk", () => {
  const certificateUrl = "/create-storage-document/GBR-2021-SD-8EEB7E123";
  const howDoesTheConsignmentArriveToUkUrl = `${certificateUrl}/how-does-the-consignment-arrive-to-the-uk`;

  it("storage document - should render page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoTransportDetails,
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/you-have-added-a-product`);

    cy.get(".govuk-fieldset__heading").contains("How does your consignment arrive to the UK?");

    cy.get(".govuk-hint").contains("Select a type of transport").should("be.visible");
    cy.get("#transport-consignment-item-hint")
      .contains("Select truck if your vehicle travels by ferry or through the Eurotunnel.")
      .should("be.visible");

    cy.get("form").should(($form) => {
      expect($form.find("input[type='radio']")).to.have.lengthOf(4);

      const labelObjects = $form.find("label").map((i, el) => Cypress.$(el).text());
      const radioObjects = $form.find("input[type='radio']").map((i, el) => Cypress.$(el).val());
      const labels = labelObjects.get();
      const radios = radioObjects.get();

      expect(radios).to.have.length(4);
      expect(labels).to.have.length(4);
      expect(labels).to.deep.eq(["Truck", "Plane", "Train", "Container vessel"]);
    });

    cy.get("#backToProgress")
      .should("have.attr", "href")
      .and("include", "/create-storage-document/GBR-2021-SD-8EEB7E123/progress");
  });

  it("should navigate to truck transport details page when user selects and submits truck transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTruck, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });

    cy.get("#truck").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-arrival-transportation-details-truck");
  });

  it("should navigate to plane transport details page when user selects and submits plane transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeavePlane, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });

    cy.get("#plane").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-arrival-transportation-details-plane");
  });

  it("should navigate to train transport details page when user selects and submits train transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTrain, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });

    cy.get("#train").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-arrival-transportation-details-train");
  });

  it("should navigate to container vessel transport details page when user selects and submits container vessel transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveContainerVessel, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });

    cy.get("#containerVessel").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-arrival-transportation-details-container-vessel");
  });

  it("should redirect user to dashboard page when user clicks Save as Draft button after selecting an option", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTrain,
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });
    cy.get("#train").click({ force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should redirect user to add product page when user clicks on Save as Draft button without selecting any options", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoTransportDetails,
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-storage-document/storage-documents");
  });

  it("should show validation error when user clicks on Save and Continue button without selecting any options", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveTransportFailsWithErrorsArrival,
    };

    cy.visit(howDoesTheConsignmentArriveToUkUrl, { qs: { ...testParams } });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select how the consignment arrives to the UK$/).should("be.visible");
    cy.get("#vehicle-error").should("be.visible");
    cy.get("#vehicle-error").should("contain", "Select how the consignment arrives to the UK");
    cy.url().should("include", "/how-does-the-consignment-arrive-to-the-uk");
  });
});
