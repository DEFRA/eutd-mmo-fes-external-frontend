const privacyNoticeUrl = "/privacy-notice";

describe("Privacy Page", () => {
  it("should render Privacy Page content in English", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);
    cy.contains("h1", /^Privacy notice$/).should("be.visible");
  });
  it("should render Privacy Page content in Welsh", () => {
    cy.visit(`${privacyNoticeUrl}?lng=cy`);
    cy.contains("h1", /^Hysbysiad preifatrwydd$/).should("be.visible");
  });

  it("should render the correct address for the Data Protection Team in 'Who collects your personal information' section", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);

    cy.contains("h2", "Who Collects Your Personal Information").should("be.visible");

    cy.contains("h2", "Who Collects Your Personal Information")
      .parent()
      .within(() => {
        cy.contains("p", "Tyneside House").should("be.visible");
        cy.contains("Skinnerburn Rd").should("be.visible");
        cy.contains("Newcastle upon Tyne").should("be.visible");
        cy.contains("NE4 7AR").should("be.visible");
      });
  });

  it("should render the correct address for the Data Protection Team in 'How do I contact' section", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);

    cy.contains("h2", /How do I contact?/i).should("be.visible");

    cy.contains("h2", /How do I contact?/i)
      .parent()
      .within(() => {
        cy.contains("p", "Tyneside House").should("be.visible");
        cy.contains("Skinnerburn Rd").should("be.visible");
        cy.contains("Newcastle upon Tyne").should("be.visible");
        cy.contains("NE4 7AR").should("be.visible");
      });
  });
});
