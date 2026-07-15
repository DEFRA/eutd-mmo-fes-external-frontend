describe("Error Page", () => {
  it("should render a sorry there is a problem with the service page", () => {
    cy.visit("/there-is-a-problem-with-the-service");

    cy.contains("h1", /^Sorry, there is a problem with the service$/).should("be.visible");

    cy.contains("p", /^Try again later.$/).should("be.visible");

    cy.contains("p", /^Everything you have done so far has been saved.$/).should("be.visible");
  });
});
