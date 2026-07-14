describe("Logout", () => {
  it("should attempt to log user out", () => {
    cy.wrap(true).should("be.true");
    cy.visit("/logout");

    cy.get("h1").should("be.visible").contains("Page not found");
  });
});
