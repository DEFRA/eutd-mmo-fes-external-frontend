const privacyNoticeUrl = "/privacy-notice";

describe("Privacy Page", () => {
  it("should render Privacy Page content in English", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);
    cy.contains("h1", /^Privacy Notice$/).should("be.visible");
    cy.contains("Date Published: [INSERT DATE]").should("be.visible");
    cy.contains(
      "The Marine Management Organisation (MMO) and the other UK Fisheries Administrations are joint controllers"
    ).should("be.visible");
    cy.contains("h2", /^FISH EXPORT SERVICE - PRIVACY NOTICE$/).should("be.visible");
    cy.contains("h2", "Purpose for processing – why we are collecting your personal data").should("be.visible");
  });

  it("should render the approved notice copy for the Welsh locale route", () => {
    cy.visit(`${privacyNoticeUrl}?lng=cy`);
    cy.contains("h1", /^Hysbysiad Preifatrwydd$/).should("be.visible");
    cy.contains("h2", /^GWASANAETH ALLFORIO PYSGOD - HYSBYSIAD PREIFATRWYDD$/).should("be.visible");
    cy.contains("dogfen dim triniaeth").should("be.visible");
  });

  it("should render performance sub-section headings as h3 elements", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);
    cy.contains("h3", "Performance Statistics:").should("be.visible");
    cy.contains("h3", "Performance information:").should("be.visible");
    cy.contains("h3", "Company Insights").should("be.visible");
  });

  it("should render the contact and controller sections from the approved notice", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);
    cy.contains("h2", "How to contact us or make a complaint").should("be.visible");
    cy.contains("The contact details of the other data controllers").should("be.visible");
    cy.contains("Defra Group DPO Office, 4th Floor").should("be.visible");
  });

  it("should render the correct address for the Data Protection Team in the contact section", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);

    cy.contains("h2", "How to contact us or make a complaint").should("be.visible");

    cy.contains("h2", "How to contact us or make a complaint")
      .parent()
      .within(() => {
        cy.contains("p", "Tyneside House").should("be.visible");
        cy.contains("Skinnerburn Road").should("be.visible");
        cy.contains("Newcastle upon Tyne").should("be.visible");
        cy.contains("NE4 7AR").should("be.visible");
      });
  });

  it("should open the external privacy links in new tabs", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);

    cy.contains("a", "Microsoft Privacy Statement")
      .should("have.attr", "href", "https://privacy.microsoft.com/privacystatement")
      .and("have.attr", "target", "_blank");

    cy.contains("a", "Personal Information Charter")
      .first()
      .should(
        "have.attr",
        "href",
        "https://www.gov.uk/government/organisations/marine-management-organisation/about/personal-information-charter"
      )
      .and("have.attr", "target", "_blank");

    cy.contains("a", "Adequacy | ICO")
      .should(
        "have.attr",
        "href",
        "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/adequacy-regulations/"
      )
      .and("have.attr", "target", "_blank");
  });
});
