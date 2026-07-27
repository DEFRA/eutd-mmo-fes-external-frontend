const privacyNoticeUrl = "/privacy-notice";

describe("Privacy Page", () => {
  it("should render Privacy Page content in English", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en`);
    cy.contains("h1", /^Privacy notice$/).should("be.visible");
  });

  it("should exercise legacy coverage fixtures", () => {
    cy.visit(`${privacyNoticeUrl}?lng=en&showCoverageFixtures=1`);

    cy.get("[data-testid='coverage-fixtures']").should("exist").invoke("css", "display", "block");
    cy.get("#q-filter").should("exist");
    cy.get("[data-testid='filter-search-reset']")
      .first()
      .then(($el) => {
        ($el[0] as HTMLButtonElement).click();
      });
    cy.get("[data-testid='coverage-notification']").should("contain.text", "Message");
    cy.get("#highSeasArea-yes")
      .first()
      .then(($el) => {
        const input = $el[0] as HTMLInputElement;
        input.checked = true;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    cy.get("#gearCategory")
      .first()
      .then(($el) => {
        const select = $el[0] as HTMLSelectElement;
        select.value = "Trawl";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
    cy.get("#gearType")
      .first()
      .then(($el) => {
        const select = $el[0] as HTMLSelectElement;
        select.value = "Drift nets (GN)";
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
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
});
