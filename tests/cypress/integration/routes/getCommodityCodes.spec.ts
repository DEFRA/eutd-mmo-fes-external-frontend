describe("Get commodity codes Page", () => {
  it("should render loader function page without params", () => {
    cy.request("/get-commodity-codes");
  });
});
