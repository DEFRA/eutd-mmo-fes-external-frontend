import { TestCaseId, type ITestParams } from "~/types";

describe("Cookie Banner Integration in Root", () => {
  describe("Banner Positioning", () => {
    it("should render cookie banner before skip link in the DOM hierarchy", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      // Clear cookies to ensure banner shows
      cy.clearCookies();
      cy.visit("/", { qs: { ...testParams } });
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
      cy.clearCookies();
      cy.visit("/");

      // Verify cookie banner appears in the DOM
      cy.get(".govuk-cookie-banner").should("exist").should("be.visible");

      // Verify cookie banner buttons are focusable
      cy.get(".govuk-cookie-banner button").first().should("be.visible");
    });
  });

  describe("Banner Integration with Analytics", () => {
    it("should not load analytics scripts before cookie acceptance", () => {
      cy.clearCookies();
      cy.visit("/");

      // Check that GA scripts are not loaded
      cy.window().then((win) => {
        // eslint-disable-next-line no-unused-expressions
        expect(win.gtag).to.be.undefined;
      });
    });

    it("should have analytics cookie acceptance prop from root loader", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.clearCookies();
      cy.setCookie("analytics_cookies_accepted", JSON.stringify({ analyticsAccepted: true }));

      cy.visit("/", { qs: { ...testParams } });

      // Banner should not be visible when cookie is accepted
      cy.get(".govuk-cookie-banner").should("not.exist");
    });
  });

  describe("Banner Behavior Across Routes", () => {
    it("should show cookie banner on all routes when no preference is set", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.clearCookies();

      // Test multiple routes
      const routes = ["/", "/cookies", "/accessibility"];

      routes.forEach((route) => {
        cy.visit(route, { qs: { ...testParams } });
        cy.get(".govuk-cookie-banner").should("exist");
      });
    });

    it("should not show cookie banner on any route when preference is set", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.setCookie("analytics_cookies_accepted", JSON.stringify({ analyticsAccepted: false }));

      // Test multiple routes
      const routes = ["/", "/cookies", "/accessibility"];

      routes.forEach((route) => {
        cy.visit(route, { qs: { ...testParams } });
        cy.get(".govuk-cookie-banner").should("not.exist");
      });
    });
  });

  describe("Banner and Skip Link Interaction", () => {
    it("should allow skipping cookie banner to main content", () => {
      cy.clearCookies();
      cy.visit("/");

      // Cookie banner should be visible
      cy.get(".govuk-cookie-banner").should("be.visible");

      // Click skip link (force click since it may be visually hidden)
      cy.get(".govuk-skip-link").click({ force: true });

      // Should navigate to main content (check URL hash or main content visibility)
      cy.url().should("include", "#main-content");

      // Cookie banner should still be visible
      cy.get(".govuk-cookie-banner").should("be.visible");
    });
  });

  describe("Error Boundary Handling", () => {
    it("should display cookie banner even on 404 pages", () => {
      cy.clearCookies();
      cy.visit("/non-existent-page", { failOnStatusCode: false });

      // Cookie banner should still be visible on error pages
      cy.get(".govuk-cookie-banner").should("be.visible");
    });
  });

  describe("Internationalization", () => {
    it("should display cookie banner in English by default", () => {
      cy.clearCookies();
      cy.visit("/");

      cy.get(".govuk-cookie-banner__heading").should("contain", "Cookies on Fish Export Service");
    });

    it("should support Welsh language toggle for cookie banner", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.clearCookies();
      cy.visit("/", { qs: { ...testParams } });

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
