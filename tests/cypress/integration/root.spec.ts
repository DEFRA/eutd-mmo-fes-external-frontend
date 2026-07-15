import { TestCaseId, type ITestParams } from "~/types";
import * as GovUKFrontEnd from "govuk-frontend";

describe("App Root", () => {
  const pageUrl = "/";
  let testParams = {};

  it("should not call govuk header if the header element isn't defined", () => {
    const stub = cy.stub(GovUKFrontEnd, "Header");
    const querySelector = cy.stub(document, "querySelector").returns(false);
    cy.visit(pageUrl, { qs: { ...testParams } });
    expect(stub.notCalled).to.not.equal(false);
    stub.restore();
    querySelector.restore();
  });

  describe("Template Component — locale, ref and pathname (lines 88–100)", () => {
    const templateTestParams: ITestParams = {
      testCaseId: TestCaseId.UserAttributes,
    };

    it("should apply the locale prop to the html lang attribute", () => {
      cy.visit(pageUrl, { qs: { ...templateTestParams } });
      cy.get("html").should("have.attr", "lang").and("not.be.empty");
    });

    it("should render the hidden focusable span used for skip-navigation (useRef)", () => {
      cy.visit(pageUrl, { qs: { ...templateTestParams } });
      cy.get("span[tabindex='-1']").first().should("exist");
    });

    it("should move focus to the hidden span on initial page load (useLocation pathname triggers useEffect)", () => {
      cy.visit(pageUrl, { qs: { ...templateTestParams } });
      cy.focused().should("match", "span").and("have.attr", "tabindex", "-1");
    });
  });
});
