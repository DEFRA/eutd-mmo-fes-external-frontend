/**
 * Forbidden Page Tests
 *
 * These tests verify that the forbidden page component displays correctly.
 * The 404 handling across the application is verified through:
 * - 24 .server response handler files throwing Response("Not Found", { status: 404 })
 * - ErrorBoundary in root.tsx detecting error.status === 404
 * - Manual testing of deleted documents in the UI
 */
describe("Forbidden Page", () => {
  it("should render forbidden page with correct heading", () => {
    cy.visit("/forbidden");
    cy.get("h1").should("have.text", "Forbidden");
  });

  it("should display permission denied message", () => {
    cy.visit("/forbidden");
    cy.get("[data-testid=no-permission]")
      .should("be.visible")
      .and("contain", "You do not have permission to carry out this action.");
  });

  it("should display navigation help message", () => {
    cy.visit("/forbidden");
    cy.get("[data-testid=navigate-back]")
      .should("be.visible")
      .and("contain", "Navigate back in your browser to return.");
  });

  it("should have proper govuk page structure", () => {
    cy.visit("/forbidden");
    cy.get(".govuk-main-wrapper").should("exist");
    cy.get(".govuk-grid-row").should("exist");
  });

  it("should display all required content elements", () => {
    cy.visit("/forbidden");
    cy.get("h1").should("exist");
    cy.get("[data-testid=no-permission]").should("exist");
    cy.get("[data-testid=navigate-back]").should("exist");
  });
});
