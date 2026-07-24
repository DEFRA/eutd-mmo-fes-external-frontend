describe("Sign Out Page", () => {
  it("should render the sign out page with a continue link", () => {
    cy.visit("/sign-out");

    cy.contains("h1", "Your application will time out soon");
    cy.contains(
      "p",
      "We will reset your application if you do not respond in 5 seconds. We do keep your information secure."
    );

    cy.get("button#continue").should("be.visible");
    cy.get("button#continue").click();
    cy.url().should("eq", "http://localhost:3000/");
  });
  it("should redirect to logout page after 5s", () => {
    cy.visit("/sign-out");
    // allow extra time for the client-side redirect to happen
    cy.url({ timeout: 10000 }).should("include", "/server-logout");
  });

  it("should update the countdown text while waiting", () => {
    cy.visit("/sign-out");

    cy.contains("p", "5 seconds").should("be.visible");
    cy.contains("p", "4 seconds", { timeout: 2500 }).should("be.visible");
  });

  it("should submit continue action and redirect", () => {
    cy.visit("/sign-out");

    cy.request({
      method: "POST",
      url: "/sign-out",
      form: true,
      body: {
        csrf: "invalid-token",
        _action: "continue",
      },
      failOnStatusCode: false,
      followRedirect: false,
    }).then((response) => {
      expect(response.status).to.equal(302);
      expect(response.redirectedToUrl).to.equal("http://localhost:3000/");
    });
  });
});
