describe("Logout", () => {
  it("should attempt to log user out", () => {
    cy.visit("/logout");

    cy.get("h1").should("be.visible").contains("Page not found");
  });
});
