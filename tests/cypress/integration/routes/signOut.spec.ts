describe("Sign Out Page", () => {
  const signOutUrl = "/sign-out?warningTimeoutMs=5000";
  const signOutMinuteUrl = "/sign-out?warningTimeoutMs=65000";
  const signOutInvalidOverrideUrl = "/sign-out?warningTimeoutMs=invalid";

  it("should render the sign out page with a continue button", () => {
    cy.visit(signOutUrl);

    cy.get("main").within(() => {
      cy.contains("h1", "Your application will time out soon");
      cy.contains("p", "We will reset your application if you do not respond in");
    });

    cy.get("button#continue").should("be.visible");
  });

  it("should render warning text for configured timeout", () => {
    cy.visit(signOutUrl);

    cy.get("main").within(() => {
      cy.contains("p", "We will reset your application if you do not respond in").should("be.visible");
    });
  });

  it("should fall back to configured timeout when warningTimeoutMs is invalid", () => {
    cy.clock();
    cy.visit("/sign-out");
    cy.get("main p")
      .first()
      .invoke("text")
      .then((configuredWarningText) => {
        cy.visit(signOutInvalidOverrideUrl);
        cy.get("main p")
          .first()
          .invoke("text")
          .then((invalidOverrideText) => {
            expect(invalidOverrideText).to.equal(configuredWarningText);
          });
      });
  });

  it("should show countdown text while waiting", () => {
    cy.clock();
    cy.visit(signOutUrl);

    cy.get("main").within(() => {
      cy.get("p")
        .eq(0)
        .invoke("text")
        .should("match", /(seconds|minutes)/i);
    });
    cy.tick(1000);
    cy.get("main").within(() => {
      cy.get("p")
        .eq(0)
        .invoke("text")
        .should("match", /(seconds|minutes)/i);
    });
  });

  it("should display warning in minutes when timeout is greater than one minute", () => {
    cy.visit(signOutMinuteUrl);

    cy.get("main p")
      .first()
      .invoke("text")
      .should("match", /minutes/i);
  });

  it("should leave sign-out page when timeout elapses", () => {
    cy.visit(signOutUrl);

    cy.location("pathname").should("eq", "/sign-out");
    cy.location("pathname", { timeout: 12000 }).should("eq", "/server-logout");
  });

  it("should submit continue action via form and leave sign-out page", () => {
    cy.visit(signOutUrl);

    cy.get("button#continue").click();
    cy.location("pathname", { timeout: 10000 }).should("not.eq", "/sign-out");
  });

  it("should redirect to forbidden when csrf token is invalid", () => {
    cy.visit(signOutUrl);

    cy.get("form input[type=hidden][name=csrf]").should("exist").invoke("val", "invalid-csrf");
    cy.get("button#continue").click();

    cy.location("pathname", { timeout: 10000 }).should("eq", "/forbidden");
  });
});
