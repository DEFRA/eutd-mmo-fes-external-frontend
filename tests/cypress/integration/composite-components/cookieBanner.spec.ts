describe("Cookie Banner", () => {
  beforeEach(() => {
    // Clear cookies before each test
    cy.clearCookies();
  });

  describe("Initial Display", () => {
    it("should display the cookie banner on first visit when no cookie preference is set", () => {
      cy.visit("/");

      // Banner should be visible
      cy.get(".govuk-cookie-banner").should("be.visible");

      // Check heading
      cy.get(".govuk-cookie-banner__heading").should("contain", "Cookies on Fish Export Service");

      // Check message text
      cy.get(".govuk-cookie-banner__content").should(
        "contain",
        "We use some essential cookies to make this service work"
      );

      // Check buttons are present
      cy.contains("button", "Accept analytics cookies").should("be.visible");
      cy.contains("button", "Reject analytics cookies").should("be.visible");

      // Check link to cookies page
      cy.get(".govuk-cookie-banner a.govuk-link").should("have.attr", "href", "/cookies");
    });

    it("should not display the cookie banner when cookie preference is already set", () => {
      // Set cookie preference
      cy.setCookie("analytics_cookies_accepted", JSON.stringify({ analyticsAccepted: true }));

      cy.visit("/");

      // Banner should not be visible
      cy.get(".govuk-cookie-banner").should("not.exist");
    });

    it("should display cookie banner above 'Skip to main content' link", () => {
      cy.visit("/");

      // Get positions of both elements
      cy.get(".govuk-cookie-banner").then(($banner) => {
        cy.get(".govuk-skip-link").then(($skipLink) => {
          const bannerTop = $banner.offset()?.top ?? 0;
          const skipLinkTop = $skipLink.offset()?.top ?? 0;

          // Banner should appear before (above) the skip link
          expect(bannerTop).to.be.lessThan(skipLinkTop);
        });
      });
    });
  });

  describe("Accept Analytics Cookies", () => {
    it("should set cookie and show confirmation message when accepting cookies", () => {
      cy.visit("/");

      // Click accept button
      cy.contains("button", "Accept analytics cookies").click();

      // Confirmation message should be visible
      cy.get(".govuk-cookie-banner__content").should(
        "contain",
        "You've accepted analytics cookies. You can change your cookie settings at any time."
      );

      // Hide button should be visible
      cy.contains("button", "Hide cookie message").should("be.visible");

      // Check that cookie was set
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });

    it("should allow user to hide confirmation message", () => {
      cy.visit("/");

      // Accept cookies
      cy.contains("button", "Accept analytics cookies").click();

      // Hide the confirmation message
      cy.contains("button", "Hide cookie message").click();

      // Banner should be hidden
      cy.get(".govuk-cookie-banner").should("not.exist");
    });

    it("should provide link to change cookie settings in confirmation", () => {
      cy.visit("/");

      // Accept cookies
      cy.contains("button", "Accept analytics cookies").click();

      // Check link to cookies page
      cy.get(".govuk-cookie-banner a.govuk-link")
        .should("contain", "change your cookie settings")
        .should("have.attr", "href", "/cookies");
    });
  });

  describe("Reject Analytics Cookies", () => {
    it("should set cookie and show confirmation message when rejecting cookies", () => {
      cy.visit("/");

      // Click reject button
      cy.contains("button", "Reject analytics cookies").click();

      // Confirmation message should be visible
      cy.get(".govuk-cookie-banner__content").should(
        "contain",
        "You've rejected analytics cookies. You can change your cookie settings at any time."
      );

      // Hide button should be visible
      cy.contains("button", "Hide cookie message").should("be.visible");

      // Check that cookie was set
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });

    it("should allow user to hide confirmation message after rejecting", () => {
      cy.visit("/");

      // Reject cookies
      cy.contains("button", "Reject analytics cookies").click();

      // Hide the confirmation message
      cy.contains("button", "Hide cookie message").click();

      // Banner should be hidden
      cy.get(".govuk-cookie-banner").should("not.exist");
    });

    it("should provide link to change cookie settings in rejection confirmation", () => {
      cy.visit("/");

      // Reject cookies
      cy.contains("button", "Reject analytics cookies").click();

      // Check link to cookies page
      cy.get(".govuk-cookie-banner a.govuk-link")
        .should("contain", "change your cookie settings")
        .should("have.attr", "href", "/cookies");
    });
  });

  describe("Navigation to Cookies Page", () => {
    it("should allow navigation to cookies page via 'View cookies' link", () => {
      cy.visit("/");

      // Click on "View cookies" link
      cy.get(".govuk-cookie-banner").contains("a.govuk-link", "View cookies").click();

      // Should navigate to cookies page
      cy.url().should("include", "/cookies");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label on the banner", () => {
      cy.visit("/");

      cy.get(".govuk-cookie-banner").should("have.attr", "aria-label", "Cookies on Fish Export Service");
    });

    it("should use semantic HTML with section element", () => {
      cy.visit("/");

      cy.get("section.govuk-cookie-banner").should("exist");
    });

    it("should have data-nosnippet attribute to prevent indexing", () => {
      cy.visit("/");

      cy.get(".govuk-cookie-banner").should("have.attr", "data-nosnippet");
    });
  });

  describe("Cookie Persistence", () => {
    it("should remember user choice after page reload", () => {
      cy.visit("/");

      // Accept cookies
      cy.contains("button", "Accept analytics cookies").click();

      // Hide banner
      cy.contains("button", "Hide cookie message").click();

      // Reload page
      cy.reload();

      // Banner should not appear
      cy.get(".govuk-cookie-banner").should("not.exist");

      // Cookie should still be set
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });

    it("should maintain rejection choice after page reload", () => {
      cy.visit("/");

      // Reject cookies
      cy.contains("button", "Reject analytics cookies").click();

      // Hide banner
      cy.contains("button", "Hide cookie message").click();

      // Reload page
      cy.reload();

      // Banner should not appear
      cy.get(".govuk-cookie-banner").should("not.exist");

      // Cookie should still be set
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });
  });

  describe("Multiple Pages", () => {
    it("should not show banner on subsequent page navigation if preference is set", () => {
      cy.visit("/");

      // Accept cookies and hide banner
      cy.contains("button", "Accept analytics cookies").click();
      cy.contains("button", "Hide cookie message").click();

      // Navigate to cookies page
      cy.visit("/cookies");

      // Banner should not appear
      cy.get(".govuk-cookie-banner").should("not.exist");
    });
  });

  describe("GOV.UK Design System Compliance", () => {
    it("should use correct GOV.UK CSS classes", () => {
      cy.visit("/");

      // Check main banner classes
      cy.get(".govuk-cookie-banner").should("exist");
      cy.get(".govuk-cookie-banner__message").should("exist");
      cy.get(".govuk-cookie-banner__heading").should("exist");
      cy.get(".govuk-cookie-banner__content").should("exist");

      // Check grid classes
      cy.get(".govuk-width-container").should("exist");
      cy.get(".govuk-grid-row").should("exist");
      cy.get(".govuk-grid-column-two-thirds").should("exist");

      // Check button group
      cy.get(".govuk-button-group").should("exist");

      // Check button classes
      cy.get("button.govuk-button").should("exist");
    });

    it("should have proper button modules", () => {
      cy.visit("/");

      cy.get("button.govuk-button").should("have.attr", "data-module", "govuk-button");
    });
  });
});
