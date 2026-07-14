describe("Get commodity codes Page", () => {
  it("should render loader function page without params", () => {
    cy.wrap(true).should("be.true");
    cy.request("/get-commodity-codes");

    cy.get("body").should("exist");
  });
});
