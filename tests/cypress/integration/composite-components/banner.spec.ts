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

  it("Banner: should apply AAA-compliant feedback link colours across states", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.UserAttributes,
    };

    const expectedStateColors: Record<string, string> = {
      ".govuk-link:link": "rgb(0, 48, 120)",
      ".govuk-link:visited": "rgb(76, 44, 146)",
      ".govuk-link:hover": "rgb(0, 34, 79)",
      ".govuk-link:focus": "rgb(11, 12, 12)",
      ".govuk-link:active": "rgb(11, 12, 12)",
    };

    const parseRgb = (value: string): [number, number, number] => {
      const match = value.match(/\d+/g);
      if (!match || match.length < 3) {
        throw new Error(`Unable to parse rgb value: ${value}`);
      }

      return [Number(match[0]), Number(match[1]), Number(match[2])];
    };

    const toLinear = (channel: number): number => {
      const normalized = channel / 255;
      return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4);
    };

    const contrastRatio = (foreground: [number, number, number], background: [number, number, number]): number => {
      const luminance = ([r, g, b]: [number, number, number]): number =>
        0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

      const fg = luminance(foreground);
      const bg = luminance(background);
      const lighter = Math.max(fg, bg);
      const darker = Math.min(fg, bg);
      return (lighter + 0.05) / (darker + 0.05);
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.window().then((win) => {
      const discoveredRules: Record<string, string> = {};
      const selectors = Object.keys(expectedStateColors);

      for (const stylesheet of Array.from(win.document.styleSheets)) {
        let rules: CSSRuleList | undefined;
        try {
          rules = stylesheet.cssRules;
        } catch {
          continue;
        }

        for (const rule of Array.from(rules)) {
          if (!(rule instanceof win.CSSStyleRule) || !rule.selectorText || !rule.style.color) {
            continue;
          }

          for (const selector of selectors) {
            if (rule.selectorText.includes(selector)) {
              discoveredRules[selector] = rule.style.color;
            }
          }
        }
      }

      for (const selector of selectors) {
        expect(discoveredRules[selector], `missing color rule for ${selector}`).to.equal(expectedStateColors[selector]);
      }
    });

    cy.get("span.govuk-phase-banner__text > a").as("feedbackLink").should("have.css", "color", "rgb(0, 48, 120)");

    cy.get("@feedbackLink")
      .focus()
      .should("have.css", "color", "rgb(11, 12, 12)")
      .trigger("mousedown")
      .should("have.css", "color", "rgb(11, 12, 12)")
      .trigger("mouseup");

    const white: [number, number, number] = [255, 255, 255];
    for (const color of Object.values(expectedStateColors)) {
      expect(contrastRatio(parseRgb(color), white), `contrast ratio for ${color} should be AAA-compliant`).to.be.gte(7);
    }
  });
});
