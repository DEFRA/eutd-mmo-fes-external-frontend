import { getData } from "../../helpers";

describe("Footer", () => {
  it("should display the expected links", () => {
    cy.visit("/");

    cy.get("[data-testid=footer]").should(($ul) => {
      const links = $ul.find("a");

      expect(links).to.have.lengthOf(4);

      const linksData = getData(links);
      expect(linksData[0].text).to.equal("Accessibility");
      expect(linksData[1].text).to.equal("Cookies");
      expect(linksData[2].text).to.equal("Privacy");
      expect(linksData[3].text).to.equal("Service Improvement");

      expect(linksData[0].href).to.equal("/accessibility");
      expect(linksData[1].href).to.equal("/cookies");
      expect(linksData[2].href).to.equal("/privacy-notice");
      expect(linksData[3].href).to.equal("/service-improvement-plan");
    });

    cy.contains("a", "Crown copyright")
      .should("be.visible")
      .and(
        "have.attr",
        "href",
        "https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/"
      );
  });
});
