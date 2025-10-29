import { type ITestParams, TestCaseId } from "~/types";
import { getData } from "../../helpers";

describe("Banner", () => {
  it("Banner: should display the expected title in the banner", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.UserAttributes,
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.contains("strong", /^Beta$/).should("be.visible");
    cy.get("[data-testid=banner-text]").should(
      "have.attr",
      "data-href",
      "https://defragroup.eu.qualtrics.com/jfe/form/SV_3q6Yrf53I3bdoCa"
    );

    cy.get("span.govuk-phase-banner__text > a")
      .should("be.visible")
      .should("have.attr", "href", "https://defragroup.eu.qualtrics.com/jfe/form/SV_3q6Yrf53I3bdoCa");

    cy.get("[data-testid=banner-text]").should(($container) => {
      const listOfSpans = $container.find("span");

      expect(listOfSpans).to.have.lengthOf(3);

      const spans = getData(listOfSpans);
      expect(spans[0].text).to.equal("This is a new service – your ");
      expect(spans[1].text).to.equal("(opens in a new tab)");
      expect(spans[2].text).to.equal(" will help us to improve it.");
    });
  });
});
