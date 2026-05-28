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

  it("should render performance sub-section headings as h3 elements", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);
    cy.contains("h3", "Performance Statistics:").should("be.visible");
    cy.contains("h3", "Performance information:").should("be.visible");
    cy.contains("h3", "Company Insights").should("be.visible");
  });

  it("should render 'DEFRA Data Protection Officer' as an h3 element", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);
    cy.contains("h3", "DEFRA Data Protection Officer").should("be.visible");
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

  it("should render the MMO link with correct text and attributes in the 'Legal Basis' section", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);

    cy.contains("h2", "Legal Basis for Processing Your Personal Information").should("be.visible");

    cy.contains("a", "Find out more about the Marine Management Organisation (MMO)")
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/government/organisations/marine-management-organisation")
      .should("have.attr", "target", "_blank")
      .invoke("attr", "rel")
      .should("match", /noreferrer/)
      .and("match", /noopener/);

    cy.contains("More information about the MMO can be found at").should("not.exist");
  });
});
