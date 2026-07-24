describe("Health Page", () => {
  it("should render health page content", () => {
    cy.visit("/health");

    cy.get("h1").should("be.visible").contains("This is a devOps page to test frontDoor");
  });
});
