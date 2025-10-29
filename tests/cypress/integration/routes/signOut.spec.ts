describe("Sign Out Page", () => {
  it("should render the sign out page with a continue link", () => {
    cy.visit("/sign-out");

    cy.contains("h1", "Your application will time out soon");
    cy.contains(
      "p",
      "We will reset your application if you do not respond in 5 seconds. We do keep your information secure."
    );

    cy.get("button#continue").should("be.visible");
    cy.get("button#continue").click({ force: true });
    cy.url().should("eq", "http://localhost:3000/");
  });
  it("should redirect to logout page after 5s", () => {
    cy.visit("/sign-out");
    // setting timeout to 5.5s to wait until page redirects
    cy.url({ timeout: 5500 }).should("eq", "http://localhost:3000/server-logout");
  });
});
