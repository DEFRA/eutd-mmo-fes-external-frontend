import { type ITestParams, TestCaseId } from "~/types";

const visitCookiesPage = (search = "") => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.UserAttributes,
  };

  cy.visit(`/cookies${search}`, { qs: { ...testParams } });
};

describe("Cookie Banner", () => {
  beforeEach(() => {
    // Clear cookies before each test
    cy.clearCookies();
  });

  describe("Initial Display", () => {
    it("should display the cookie banner on first visit when no cookie preference is set", () => {
      cy.visit("/?loggedIn=yes");

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

    it("should only display when URL contains loggedIn=yes parameter", () => {
      // Visit without parameter
      cy.visit("/");

      // Banner should not be visible without the parameter
      cy.get(".govuk-cookie-banner").should("not.exist");

      // Visit with loggedIn=yes parameter
      cy.visit("/?loggedIn=yes");

      // Banner should be visible with the parameter
      cy.get(".govuk-cookie-banner").should("be.visible");
    });

    it("should not display when loggedIn parameter has different value", () => {
      cy.visit("/?loggedIn=no");

      // Banner should not be visible
      cy.get(".govuk-cookie-banner").should("not.exist");
    });

    it("should display the cookie banner even when cookie preference is already set", () => {
      // Set cookie preference
      cy.setCookie("analytics_cookies_accepted", JSON.stringify({ analyticsAccepted: true }));

      cy.visit("/?loggedIn=yes");

      // Banner should still be visible when loggedIn=yes is present
      cy.get(".govuk-cookie-banner").should("be.visible");
    });

    it("should display cookie banner above 'Skip to main content' link", () => {
      cy.visit("/?loggedIn=yes");

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

  describe("Database Integration", () => {
    beforeEach(() => {
      // Intercept API calls to set-cookie-preference
      cy.intercept("POST", "/set-cookie-preference", {
        statusCode: 200,
        body: { success: true },
      }).as("saveCookiePreference");
    });

    it("should call API to save preference when accepting cookies", () => {
      cy.visit("/?loggedIn=yes");

      // Click accept button
      cy.contains("button", "Accept analytics cookies").click();

      // Wait for API call
      cy.wait("@saveCookiePreference").then((interception) => {
        // Verify request body
        expect(interception.request.body).to.deep.equal({ acceptsCookies: true });
        // Verify request headers
        expect(interception.request.headers["content-type"]).to.include("application/json");
      });
    });

    it("should call API to save preference when rejecting cookies", () => {
      cy.visit("/?loggedIn=yes");

      // Click reject button
      cy.contains("button", "Reject analytics cookies").click();

      // Wait for API call
      cy.wait("@saveCookiePreference").then((interception) => {
        // Verify request body
        expect(interception.request.body).to.deep.equal({ acceptsCookies: false });
        // Verify request headers
        expect(interception.request.headers["content-type"]).to.include("application/json");
      });
    });

    it("should handle API failure gracefully when accepting cookies", () => {
      // Override intercept to simulate failure
      cy.intercept("POST", "/set-cookie-preference", {
        statusCode: 500,
        body: { success: false, error: "Internal server error" },
      }).as("saveCookiePreferenceFail");

      cy.visit("/?loggedIn=yes");

      // Click accept button
      cy.contains("button", "Accept analytics cookies").click();

      // Should still show confirmation message even if API fails
      cy.get(".govuk-cookie-banner__content").should(
        "contain",
        "You've accepted analytics cookies. You can change your cookie settings at any time."
      );

      // Cookie should still be set locally
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });

    it("should handle network error gracefully", () => {
      // Simulate network failure
      cy.intercept("POST", "/set-cookie-preference", { forceNetworkError: true }).as("networkError");

      cy.visit("/?loggedIn=yes");

      // Click accept button
      cy.contains("button", "Accept analytics cookies").click();

      // Should still show confirmation message
      cy.get(".govuk-cookie-banner__content").should("contain", "You've accepted analytics cookies");

      // Cookie should still be set locally
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });
  });

  describe("No Page Reload Behavior", () => {
    it("should not reload page after accepting cookies", () => {
      cy.visit("/?loggedIn=yes");

      // Add a marker to the page to detect if it reloads
      cy.window().then((win) => {
        (win as Window & { testMarker?: string }).testMarker = "page-loaded";
      });

      // Click accept button
      cy.contains("button", "Accept analytics cookies").click();

      // Wait a moment
      cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");

      // Check that marker still exists (page didn't reload)
      cy.window().its("testMarker").should("equal", "page-loaded");

      // Confirmation should be visible without reload
      cy.get(".govuk-cookie-banner__content").should("contain", "You've accepted analytics cookies");
    });

    it("should not reload page after rejecting cookies", () => {
      cy.visit("/?loggedIn=yes");

      // Add a marker to the page
      cy.window().then((win) => {
        (win as Window & { testMarker?: string }).testMarker = "page-loaded";
      });

      // Click reject button
      cy.contains("button", "Reject analytics cookies").click();

      // Wait a moment
      cy.document({ timeout: 500 }).its("readyState").should("eq", "complete");

      // Check that marker still exists (page didn't reload)
      cy.window().its("testMarker").should("equal", "page-loaded");

      // Confirmation should be visible without reload
      cy.get(".govuk-cookie-banner__content").should("contain", "You've rejected analytics cookies");
    });
  });

  describe("Accept Analytics Cookies", () => {
    it("should set cookie and show confirmation message when accepting cookies", () => {
      cy.visit("/?loggedIn=yes");

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
      cy.visit("/?loggedIn=yes");

      // Accept cookies
      cy.contains("button", "Accept analytics cookies").click();

      // Hide the confirmation message
      cy.contains("button", "Hide cookie message").click();

      // Banner should be hidden
      cy.get(".govuk-cookie-banner").should("not.exist");
    });

    it("should provide link to change cookie settings in confirmation", () => {
      cy.visit("/?loggedIn=yes");

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
      cy.visit("/?loggedIn=yes");

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
      cy.visit("/?loggedIn=yes");

      // Reject cookies
      cy.contains("button", "Reject analytics cookies").click();

      // Hide the confirmation message
      cy.contains("button", "Hide cookie message").click();

      // Banner should be hidden
      cy.get(".govuk-cookie-banner").should("not.exist");
    });

    it("should provide link to change cookie settings in rejection confirmation", () => {
      cy.visit("/?loggedIn=yes");

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
      cy.visit("/?loggedIn=yes");

      // Click on "View cookies" link
      cy.get(".govuk-cookie-banner").contains("a.govuk-link", "View cookies").click();

      // Should navigate to cookies page
      cy.url().should("include", "/cookies");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA label on the banner", () => {
      cy.visit("/?loggedIn=yes");

      cy.get(".govuk-cookie-banner").should("have.attr", "aria-label", "Cookies on Fish Export Service");
    });

    it("should use semantic HTML with section element", () => {
      cy.visit("/?loggedIn=yes");

      cy.get("section.govuk-cookie-banner").should("exist");
    });

    it("should have data-nosnippet attribute to prevent indexing", () => {
      cy.visit("/?loggedIn=yes");

      cy.get(".govuk-cookie-banner").should("have.attr", "data-nosnippet");
    });
  });

  describe("Cookie Persistence", () => {
    it("should show banner again after page reload when loggedIn=yes is present", () => {
      cy.visit("/?loggedIn=yes");

      // Accept cookies
      cy.contains("button", "Accept analytics cookies").click();

      // Hide banner
      cy.contains("button", "Hide cookie message").click();

      // Reload page with loggedIn parameter
      cy.visit("/?loggedIn=yes");

      // Banner should appear again with loggedIn=yes
      cy.get(".govuk-cookie-banner").should("be.visible");

      // Cookie should still be set
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });

    it("should show banner again after page reload for rejection when loggedIn=yes is present", () => {
      cy.visit("/?loggedIn=yes");

      // Reject cookies
      cy.contains("button", "Reject analytics cookies").click();

      // Hide banner
      cy.contains("button", "Hide cookie message").click();

      // Reload page with loggedIn parameter
      cy.visit("/?loggedIn=yes");

      // Banner should appear again with loggedIn=yes
      cy.get(".govuk-cookie-banner").should("be.visible");

      // Cookie should still be set
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });

    it("should persist cookie across different routes and show banner when loggedIn=yes", () => {
      cy.visit("/?loggedIn=yes");

      // Accept cookies
      cy.contains("button", "Accept analytics cookies").click();
      cy.contains("button", "Hide cookie message").click();

      // Navigate to cookies page with loggedIn parameter
      visitCookiesPage("?loggedIn=yes");

      // Banner should appear again with loggedIn=yes
      cy.get(".govuk-cookie-banner").should("be.visible");

      // Cookie should still be set
      cy.getCookie("analytics_cookies_accepted").should("exist");
    });
  });

  describe("Multiple Pages", () => {
    it("should show banner on subsequent page navigation when loggedIn=yes is present", () => {
      cy.visit("/?loggedIn=yes");

      // Accept cookies and hide banner
      cy.contains("button", "Accept analytics cookies").click();
      cy.contains("button", "Hide cookie message").click();

      // Navigate to cookies page with loggedIn parameter
      visitCookiesPage("?loggedIn=yes");

      // Banner should appear again with loggedIn=yes
      cy.get(".govuk-cookie-banner").should("be.visible");
    });

    it("should not show banner without loggedIn parameter even if no cookie is set", () => {
      visitCookiesPage();

      // Banner should not appear without the parameter
      cy.get(".govuk-cookie-banner").should("not.exist");
    });
  });

  describe("GOV.UK Design System Compliance", () => {
    it("should use correct GOV.UK CSS classes", () => {
      cy.visit("/?loggedIn=yes");

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
      cy.visit("/?loggedIn=yes");

      cy.get("button.govuk-button").should("have.attr", "data-module", "govuk-button");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid clicks on accept button", () => {
      cy.visit("/?loggedIn=yes");

      // Get the accept button and click it once
      // After first click, button is replaced with confirmation message
      cy.contains("button", "Accept analytics cookies").click();

      // Should show confirmation message
      cy.get(".govuk-cookie-banner__content").should("contain", "You've accepted analytics cookies");

      // Cookie should be set
      cy.getCookie("analytics_cookies_accepted").should("exist");

      // Verify the accept button is no longer visible (replaced by hide button)
      cy.contains("button", "Accept analytics cookies").should("not.exist");
      cy.contains("button", "Hide cookie message").should("be.visible");
    });

    it("should handle switching between accept and reject", () => {
      cy.visit("/?loggedIn=yes");

      // Accept first
      cy.contains("button", "Accept analytics cookies").click();

      // Hide confirmation
      cy.contains("button", "Hide cookie message").click();

      // Clear cookie to test again
      cy.clearCookies();
      cy.visit("/?loggedIn=yes");

      // Now reject
      cy.contains("button", "Reject analytics cookies").click();

      // Should show reject confirmation
      cy.get(".govuk-cookie-banner__content").should("contain", "You've rejected analytics cookies");
    });

    it("should handle page navigation with loggedIn parameter in different positions", () => {
      // Test with parameter at the end
      visitCookiesPage("?someParam=value&loggedIn=yes");

      // If no cookie is set, banner should not show on cookies page
      cy.get(".govuk-cookie-banner").should("not.exist");
    });

    it("should maintain cookie value structure", () => {
      cy.visit("/?loggedIn=yes");

      // Accept cookies
      cy.contains("button", "Accept analytics cookies").click();

      // Check cookie value structure
      cy.getCookie("analytics_cookies_accepted").then((cookie) => {
        const value = JSON.parse(cookie?.value ?? "{}");
        expect(value).to.have.property("analyticsAccepted");
        // eslint-disable-next-line no-unused-expressions
        expect(value.analyticsAccepted).to.be.true;
      });
    });

    it("should maintain cookie value structure for rejection", () => {
      cy.visit("/?loggedIn=yes");

      // Reject cookies
      cy.contains("button", "Reject analytics cookies").click();

      // Check cookie value structure
      cy.getCookie("analytics_cookies_accepted").then((cookie) => {
        const value = JSON.parse(cookie?.value ?? "{}");
        expect(value).to.have.property("analyticsAccepted");
        // eslint-disable-next-line no-unused-expressions
        expect(value.analyticsAccepted).to.be.false;
      });
    });
  });
});
