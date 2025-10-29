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
});
