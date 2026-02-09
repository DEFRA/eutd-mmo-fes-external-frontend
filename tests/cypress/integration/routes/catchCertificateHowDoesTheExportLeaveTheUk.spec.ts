import { type ITestParams, TestCaseId } from "~/types";

describe("Catch Certificate - HowDoesTheExportLeaveTheUk", () => {
  const certificateUrl = "/create-catch-certificate/GBR-2021-CC-8EEB7E123";
  const howDoesTheExportLeaveTheUkUrl = `${certificateUrl}/how-does-the-export-leave-the-uk`;

  it("should render page", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoTransportDetails,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `${certificateUrl}/what-export-journey`);

    cy.get(".govuk-fieldset__heading").contains("How do you transport the export?");

    cy.get("#vehicle-hint").contains("Select the type of transport.").should("be.visible");

    cy.get(".govuk-hint").contains("You can add another transport mode later if needed.").should("be.visible");

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
  });

  it("should navigate to truck transport details page when user selects and submits truck transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTruck, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.get("#truck").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-transportation-details-truck");
  });

  it("should navigate to plane transport details page when user selects and submits plane transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeavePlane, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.get("#plane").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-transportation-details-plane/0");
  });

  it("should navigate to train transport details page when user selects and submits train transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveTrain, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.get("#train").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-transportation-details-train");
  });

  it("should navigate to container vessel transport details page when user selects and submits container vessel transport type", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveContainerVessel, //mocking the selected transport vehicle so the next page does not redirect to the progress page
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });
    // eslint-disable-next-line
    cy.wait(200);

    cy.get("#containerVessel").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/add-transportation-details-container-vessel");
  });

  it("should redirect user to progress page when landings entry is directLanding", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveDirectLanding,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { failOnStatusCode: false, qs: { ...testParams } });

    cy.url().should("include", "/progress");
  });

  it("should redirect user to landings entry page when there is no landings type has been selected for the document", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoLandingsType,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { failOnStatusCode: false, qs: { ...testParams } });

    cy.url().should("include", "/landings-entry");
  });

  it("should redirect user to dashboard page when there are no errors and user clicks Save as Draft button", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoTransportDetails,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });
    cy.get("#train").click({ force: true });
    cy.get("[data-testid=save-draft-button").click({ force: true });

    cy.url().should("include", "/create-catch-certificate/catch-certificates");
  });

  it("should redirect user to forbidden page when saveTransportDetails fails with a 403 error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveTransportFailsWith403,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });
    cy.get("#train").click({ force: true });
    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.url().should("include", "/forbidden");
  });

  it("should display error summary and inline error message when saving transport type fails with an error", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.SaveTransportFailsWithErrors,
    };
    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.get("[data-testid=save-and-continue").click({ force: true });

    cy.contains("h2", /^There is a problem$/).should("be.visible");
    cy.contains("a", /^Select how the export leaves the UK$/).should("be.visible");
    cy.contains("span.govuk-visually-hidden", /^Error:$/).should("be.visible");
    cy.get("p.govuk-error-message").contains("Select how the export leaves the UK");
  });

  it("should display truck guidance text when page renders", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoTransportDetails,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.get("#truck-item-hint").should(
      "contain",
      "Select truck if your vehicle travels by ferry or through the Eurotunnel."
    );
  });

  it("should display expandable guidance section with title and content", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoTransportDetails,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.get(".govuk-details__summary-text").should("contain", "Why can I add more than one mode of transport?");
  });

  it("should expand and display expandable guidance content when clicked", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.HowDoesTheExportLeaveNoTransportDetails,
    };

    cy.visit(howDoesTheExportLeaveTheUkUrl, { qs: { ...testParams } });

    cy.get(".govuk-details__summary").click();
    cy.get(".govuk-details__text").should(
      "contain",
      "New EU regulations allow you to include more than one mode of transport in your catch certificate. This helps improve traceability when your catch is moved using different types of transport, such as by sea, road, or air."
    );
  });
});
