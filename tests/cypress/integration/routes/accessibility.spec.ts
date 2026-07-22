describe("Accessibility page", () => {
  it("renders the page and key accessibility links", () => {
    cy.visit("/accessibility");

    cy.contains("h1", "Accessibility statement").should("be.visible");
    cy.get('a[href="https://www.gov.uk"]').should("exist");
    cy.get('a[href="https://www.gov.uk/help/accessibility-statement"]').should("exist");
    cy.get('a[href^="tel:"]').should("contain.text", "0330 159 1989");
    cy.get('a[href="mailto:dominic.Horsfall@marinemanagement.org.uk"]').should("exist");
  });
});
