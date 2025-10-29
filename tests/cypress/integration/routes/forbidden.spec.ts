describe("Forbidden Page", () => {
  it("should render forbidden page content", () => {
    cy.visit("/forbidden");

    cy.get("h1").should("be.visible").contains("Forbidden");
    cy.get("[data-testid=no-permission]")
      .should("be.visible")
      .contains("You do not have permission to carry out this action.");
    cy.get("[data-testid=navigate-back]").should("be.visible").contains("Navigate back in your browser to return.");
  });
});
