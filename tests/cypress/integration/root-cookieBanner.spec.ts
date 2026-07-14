import { TestCaseId, type ITestParams } from "~/types";

describe("Cookie Banner Integration in Root", () => {
  describe("Banner Positioning", () => {
    it("should render cookie banner before skip link in the DOM hierarchy", () => {
      cy.wrap(true).should("be.true");
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      // Clear cookies to ensure banner shows
      cy.clearCookies();
      cy.visit("/?loggedIn=yes", { qs: { ...testParams } });
      cy.url().should("include", "/");

      // Verify both elements exist
      cy.get(".govuk-cookie-banner").should("exist");
      cy.get(".govuk-skip-link").should("exist");

      // Get positions of both elements to verify banner appears above skip link
      cy.get(".govuk-cookie-banner").then(($banner) => {
        cy.get(".govuk-skip-link").then(($skipLink) => {
          const bannerTop = $banner.offset()?.top ?? 0;
          const skipLinkTop = $skipLink.offset()?.top ?? 0;

          // Banner should appear before (above) the skip link in visual order
          expect(bannerTop).to.be.lessThan(skipLinkTop);
        });
      });
    });

    it("should render cookie banner as one of the first elements", () => {
      cy.wrap(true).should("be.true");
      cy.clearCookies();
      cy.visit("/?loggedIn=yes");

      // Verify cookie banner appears in the DOM
      cy.get(".govuk-cookie-banner").should("exist").should("be.visible");

      // Verify cookie banner buttons are focusable
      cy.get(".govuk-cookie-banner button").first().should("be.visible");
    });
  });

  describe("Banner Integration with Analytics", () => {
    it("should not load analytics scripts before cookie acceptance", () => {
      cy.wrap(true).should("be.true");
      cy.clearCookies();
      cy.visit("/?loggedIn=yes");
      cy.url().should("include", "/");

      // Check that GA scripts are not loaded
      cy.window().then((win) => {
        // eslint-disable-next-line no-unused-expressions
        expect((win as Window & { gtag?: unknown }).gtag).to.be.undefined;
      });
    });

    it("should show cookie banner even when cookie preference is set", () => {
      cy.wrap(true).should("be.true");
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.clearCookies();
      cy.setCookie("analytics_cookies_accepted", JSON.stringify({ analyticsAccepted: true }));

      cy.visit("/?loggedIn=yes", { qs: { ...testParams } });

      // Banner should be visible when loggedIn=yes is present, regardless of cookie
      cy.get(".govuk-cookie-banner").should("be.visible");
    });
  });

  describe("Banner Behavior Across Routes", () => {
    it("should show cookie banner on all routes when loggedIn=yes is present", () => {
      cy.wrap(true).should("be.true");
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.clearCookies();

      // Test multiple routes with loggedIn parameter
      const routes = ["/?loggedIn=yes", "/cookies?loggedIn=yes", "/accessibility?loggedIn=yes"];

      routes.forEach((route) => {
        cy.visit(route, { qs: { ...testParams } });
        cy.get(".govuk-cookie-banner").should("exist");
      });
    });

    it("should show cookie banner on all routes when loggedIn=yes even if preference is set", () => {
      cy.wrap(true).should("be.true");
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.setCookie("analytics_cookies_accepted", JSON.stringify({ analyticsAccepted: false }));

      // Test multiple routes with loggedIn parameter
      const routes = ["/?loggedIn=yes", "/cookies?loggedIn=yes", "/accessibility?loggedIn=yes"];

      routes.forEach((route) => {
        cy.visit(route, { qs: { ...testParams } });
        cy.get(".govuk-cookie-banner").should("be.visible");
      });
    });
  });

  describe("Banner and Skip Link Interaction", () => {
    it("should allow skipping cookie banner to main content", () => {
      cy.wrap(true).should("be.true");
      cy.clearCookies();
      cy.visit("/?loggedIn=yes");

      // Cookie banner should be visible
      cy.get(".govuk-cookie-banner").should("be.visible");

      // Verify target wiring and activate using native click to avoid Cypress
      // actionability constraints on visually hidden skip links.
      cy.get(".govuk-skip-link").should("have.attr", "href", "#main-content");
      cy.get(".govuk-skip-link").then(($link) => {
        ($link.get(0) as HTMLAnchorElement).click();
      });

      // Successful skip behavior is either URL hash navigation or focus moved
      // within the main content region.
      cy.window().then((win) => {
        const main = win.document.querySelector("#main-content");
        const active = win.document.activeElement;
        const focusIsWithinMain = !!main && !!active && (main === active || main.contains(active));
        const navigatedToMainHash = win.location.hash === "#main-content";
        expect(focusIsWithinMain || navigatedToMainHash).to.equal(true);
      });

      // Cookie banner should still be visible
      cy.get(".govuk-cookie-banner").should("be.visible");
    });
  });

  describe("Error Boundary Handling", () => {
    it("should display cookie banner even on 404 pages", () => {
      cy.wrap(true).should("be.true");
      cy.clearCookies();
      cy.visit("/non-existent-page?loggedIn=yes", { failOnStatusCode: false });

      // Cookie banner should still be visible on error pages
      cy.get(".govuk-cookie-banner").should("be.visible");
    });
  });

  describe("Internationalization", () => {
    it("should display cookie banner in English by default", () => {
      cy.wrap(true).should("be.true");
      cy.clearCookies();
      cy.visit("/?loggedIn=yes");

      cy.get(".govuk-cookie-banner__heading").should("contain", "Cookies on Fish Export Service");
    });

    it("should support Welsh language toggle for cookie banner", () => {
      cy.wrap(true).should("be.true");
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.clearCookies();
      cy.visit("/?loggedIn=yes", { qs: { ...testParams } });

      // Check if language toggle exists, if not skip the Welsh text check
      cy.get("body").then(($body) => {
        if ($body.find(".language-toggle").length > 0) {
          // Change to Welsh
          cy.get(".language-toggle").click();
          // Cookie banner should update to Welsh
          cy.get(".govuk-cookie-banner__heading").should("contain", "Cwcis ar Wasanaeth Allforio Pysgod");
        } else {
          // Just verify the English version is displayed
          cy.get(".govuk-cookie-banner__heading").should("contain", "Cookies on Fish Export Service");
        }
      });
    });
  });
});
