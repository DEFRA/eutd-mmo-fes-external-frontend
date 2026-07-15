describe("service improvement plan page", () => {
  it("should render service improvement plan page", () => {
    cy.visit("/service-improvement-plan");

    cy.contains("a", "Digital Service Standard (opens in new tab)")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/service-manual/service-standard");

    cy.contains("a", "feedback (opens in new tab)")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_3q6Yrf53I3bdoCa");
  });
});
