const documentNumber = "GBR-2021-CC-8EEB7E123";
const pageUrl = `/create-catch-certificate/${documentNumber}/catch-certificate-pending`;
const dashboardUrl = "/create-catch-certificate/catch-certificates";

describe("catch certificate pending page rendering", () => {
  beforeEach(() => {
    cy.visit(pageUrl);
  });

  it("back link check", () => {
    cy.contains("a", /^Back$/).should("be.visible");
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardUrl);
  });

  it("should render document number", () => {
    cy.get(".govuk-panel__body > strong").contains(documentNumber);
  });

  it("should render link", () => {
    cy.contains("a", "Return to your exporter dashboard")
      .should("be.visible")
      .should("have.attr", "href", dashboardUrl);
  });
});
