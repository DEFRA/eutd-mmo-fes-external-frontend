import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate";
const documentNumber = "GBR-2022-CC-6BC952BA3";
const directLandingUrl = `${documentUrl}/${documentNumber}/direct-landing`;

const waitForHydration = () => {
  cy.get("button.date-picker").should("be.visible");
};

/**
 * Separate spec targeting the uncovered branches in
 * create-catch-certificate.$documentNumber.direct-landing.tsx.
 *
 * Covered lines
 * ─────────────
 * Line 150  – `selctedEEZCountries.push(" ")` (non-JS add-zone server round-trip)
 * Lines 182-184 – `logger.info("[DIRECT-LANDING][GET-VESSEL-JS][LOADER][ERROR]")` +
 *                  `if (e instanceof Error) { logger.error(e) }` (vessel fetch error)
 * Line 187  – `setVessels([])` (vessel error recovery)
 * Lines 253-257 – gear-types fetch error logger block + `setGearTypes([])`
 *
 * Note on line 223 (`Number.parseFloat(String(weight.exportWeight)) ?? 0`)
 * ─────────────────────────────────────────────────────────────────────────
 * This is the `else` branch of `typeof weight.exportWeight === "number" ? ...`.
 * In practice it is dead code: state initialisation always converts weights to
 * JS numbers (including NaN for unparseable strings), and `typeof NaN === "number"`
 * is true in JavaScript, so the else branch is never taken at runtime.
 * The surrounding weight-calculation code is exercised in test 4.
 */

describe("Direct landing coverage branches", () => {
  /**
   * Line 150 – non-JS server round-trip sets `isAddAnotherEEZButtonClicked=true`
   * in the session; on redirect the component calls `selctedEEZCountries.push(" ")`
   * to reserve a second EEZ slot.
   */
  it("covers line 150: non-JS add-zone branch appends EEZ placeholder", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.DirectLandingCoverageBranches,
      disableScripts: true,
    };

    cy.visit(directLandingUrl, { qs: { ...testParams } });
    cy.get("form").should("exist");

    // Click the add-zone submit button; the server sets the session flag and
    // redirects back.  On the reload the component renders a second EEZ slot.
    cy.get("#add-zone-button").click({ force: true });

    // After the redirect the second EEZ field is present – confirming line 150 ran
    cy.get("#eez-1").should("exist");
  });

  /**
   * Lines 182-184 + 187 – the client-side fetch to /get-vessels returns a
   * network error (forced by cy.intercept), causing the catch block to fire:
   *   logger.info("[DIRECT-LANDING][GET-VESSEL-JS][LOADER][ERROR]");
   *   if (e instanceof Error) { logger.error(e); }
   *   setVessels([]);
   *
   * logger writes to console.info / console.error in non-prod – spied here.
   */
  it("covers lines 182-184, 187: vessel fetch error branch with log assertions", () => {
    // Set up the network intercept before visiting so it is active from page load
    cy.intercept("/get-vessels*", { forceNetworkError: true }).as("vesselsFetch");

    cy.visit(directLandingUrl, {
      qs: { testCaseId: TestCaseId.DirectLandingCoverageBranches },
      onBeforeLoad: (win) => {
        cy.stub(win.console, "info").as("consoleInfo");
        cy.stub(win.console, "error").as("consoleError");
      },
    });

    waitForHydration();

    // Typing 2+ chars triggers the useEffect vessel fetch, which hits the
    // intercepted route and throws a TypeError (network error)
    cy.get("#vessel\\.vesselName").clear({ force: true }).type("aa", { force: true });

    // Allow the async catch block to complete
    cy.wait(400);

    // Assert the logger.info call on line 182 was made
    cy.get("@consoleInfo").then((spy: any) => {
      const flatArgs: unknown[] = spy.args.flat();
      expect(
        flatArgs.some(
          (arg) => typeof arg === "string" && arg.includes("[DIRECT-LANDING][GET-VESSEL-JS][LOADER][ERROR]")
        ),
        "logger.info must be called with the vessel error tag (line 182)"
      ).to.eq(true);
    });

    // Assert logger.error (line 183-184) was also called
    cy.get("@consoleError").should("have.been.called");
  });

  /**
   * Lines 253-257 – the client-side fetch to /get-gear-types returns a network
   * error (forced by cy.intercept), causing the catch block to fire:
   *   logger.info("[DIRECT-LANDING][GET-GEAR-TYPES-JS][LOADER][ERROR]");
   *   if (e instanceof Error) { logger.error(e); }
   *   setGearTypes([]);
   */
  it("covers lines 253-257: gear-types fetch error branch with log assertions", () => {
    cy.intercept("/get-gear-types*", { forceNetworkError: true }).as("gearTypesFetch");

    cy.visit(directLandingUrl, {
      qs: { testCaseId: TestCaseId.DirectLandingCoverageBranches },
      onBeforeLoad: (win) => {
        cy.stub(win.console, "info").as("consoleInfo");
        cy.stub(win.console, "error").as("consoleError");
      },
    });

    waitForHydration();

    // Selecting a different gear category triggers handleGearCategoryChange
    // which fetches /get-gear-types – intercepted to force a network error
    cy.get("#gearCategory").then(($select) => {
      const currentVal = String($select.val() ?? "");
      cy.get("#gearCategory option").then(($opts) => {
        const alternatives = $opts
          .toArray()
          .map((o) => (o as HTMLOptionElement).value)
          .filter((v) => v.length > 0 && v !== currentVal);

        expect(alternatives.length, "Need at least one alternative gear category").to.be.greaterThan(0);
        cy.get("#gearCategory").select(alternatives[0], { force: true });
      });
    });

    cy.wait(400);

    // Assert the logger.info call on line 253 was made
    cy.get("@consoleInfo").then((spy: any) => {
      const flatArgs: unknown[] = spy.args.flat();
      expect(
        flatArgs.some(
          (arg) => typeof arg === "string" && arg.includes("[DIRECT-LANDING][GET-GEAR-TYPES-JS][LOADER][ERROR]")
        ),
        "logger.info must be called with the gear-types error tag (line 253)"
      ).to.eq(true);
    });

    cy.get("@consoleError").should("have.been.called");
  });

  /**
   * Line 223 context – the fixture has exportWeight: "3.5" (string) for the second
   * species.  The server-side loader uses lodash `isNumber` which returns false for
   * strings, so that species is excluded from the SSR `totalWeight` (= 2).
   * The `useState` initialiser does parse the string to the JS number 3.5, so when
   * the user changes the first weight the `getTotalWeight` re-evaluation uses the
   * already-numeric 3.5 from state, taking the truthy branch of the `typeof` guard.
   *
   * The else-branch on line 223 itself is dead code at runtime because
   * `typeof NaN === "number"` is true in JavaScript, so the initialiser always
   * produces a JS number.
   */
  it("exercises the weight calculation path with string-sourced weight value", () => {
    cy.visit(directLandingUrl, {
      qs: { testCaseId: TestCaseId.DirectLandingCoverageBranches },
    });

    waitForHydration();

    // The server-side `totalWeight` in the loader uses lodash `isNumber`, which
    // returns false for the string "3.5", so the second species is excluded and
    // the initial displayed total is "2.00kg" (only the numeric weight=2 counts).
    cy.contains(".govuk-table__cell", "Total export weight").next(".govuk-table__cell").should("have.text", "2.00kg");

    // After the user edits a weight, getTotalWeight re-evaluates all entries from
    // the exportWeights state.  The useState initialiser already parsed "3.5" to
    // the JS number 3.5 (typeof 3.5 === "number" → true), so the type-guard on
    // line 223 takes the truthy branch; from the caller's perspective both weights
    // are now proper numbers and the total is correctly computed.
    cy.get('input[id="weights.0.exportWeight"]').clear({ force: true }).type("20", { force: true }).blur();

    cy.contains(".govuk-table__cell", "Total export weight").next(".govuk-table__cell").should("have.text", "23.50kg");
  });
});
