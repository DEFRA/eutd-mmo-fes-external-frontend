import { type ITestParams, TestCaseId } from "~/types";
import { getData } from "../../helpers";

describe("Header", () => {
  const assertFooterPages = () => {
    cy.get("[data-testid=navigation]").should(($ul) => {
      const links = $ul.find("a");

      expect(links).to.have.lengthOf(3);

      const linksData = getData(links);
      expect(linksData[0].text).to.equal("Manage account");
      expect(linksData[1].text).to.equal("Change organisation");
      expect(linksData[2].text).to.equal("Sign out");

      expect(linksData[0].href).to.equal("https://idm-dev-public.azure.defra.cloud/account-management/me");
      expect(linksData[1].href).to.equal("/redirectTo");
      expect(linksData[2].href).to.equal("/logout");
    });
  };

  it("Home: should display the expected title and links", () => {
    cy.visit("/");

    cy.contains("a", /^Create a UK catch certificate$/).should("be.visible");

    cy.contains("a", /^GOV.UK$/)
      .should("be.visible")
      .should("have.attr", "href", "https://www.gov.uk/");

    cy.get("[data-testid=navigation]").should(($ul) => {
      const links = $ul.find("a");

      expect(links).to.have.lengthOf(3);

      const linksData = getData(links);
      expect(linksData[0].text).to.equal("Manage account");
      expect(linksData[1].text).to.equal("Change organisation");
      expect(linksData[2].text).to.equal("Sign out");

      expect(linksData[0].href).to.equal("https://idm-dev-public.azure.defra.cloud/account-management/me");
      expect(linksData[1].href).to.equal("/redirectTo");
      expect(linksData[2].href).to.equal("/logout");
    });
  });

  it("CC: should display the expected title and links", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourney,
      args: ["catchCertificate"],
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createCatchCertificate").check("catchCertificate");
    cy.get("form").submit();

    const homeLink = "/create-catch-certificate/catch-certificates";

    cy.contains("a", /^Create a UK catch certificate$/)
      .should("be.visible")
      .should("have.attr", "href", homeLink);

    cy.get("[data-testid=navigation]").should(($ul) => {
      const links = $ul.find("a");

      expect(links).to.have.lengthOf(5);

      const linksData = getData(links);
      expect(linksData[0].text).to.equal("Home");
      expect(linksData[1].text).to.equal("Favourites");
      expect(linksData[2].text).to.equal("Manage account");
      expect(linksData[3].text).to.equal("Change organisation");
      expect(linksData[4].text).to.equal("Sign out");

      expect(linksData[0].href).to.equal("/");
      expect(linksData[1].href).to.equal("/manage-favourites");
      expect(linksData[2].href).to.equal("https://idm-dev-public.azure.defra.cloud/account-management/me");
      expect(linksData[3].href).to.equal("/redirectTo");
      expect(linksData[4].href).to.equal("/logout");
    });
  });

  it("PS: should display the expected title and links", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourney,
      args: ["processingStatement"],
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createProcessingStatement").check("processingStatement");
    cy.get("form").submit();

    const homeLink = "/create-processing-statement/processing-statements";

    cy.contains("a", /^Create a UK processing statement$/)
      .should("be.visible")
      .should("have.attr", "href", homeLink);

    cy.get("[data-testid=navigation]").should(($ul) => {
      const links = $ul.find("a");

      expect(links).to.have.lengthOf(4);

      const linksData = getData(links);
      expect(linksData[0].text).to.equal("Home");
      expect(linksData[1].text).to.equal("Manage account");
      expect(linksData[2].text).to.equal("Change organisation");
      expect(linksData[3].text).to.equal("Sign out");

      expect(linksData[0].href).to.equal("/");
      expect(linksData[1].href).to.equal("https://idm-dev-public.azure.defra.cloud/account-management/me");
      expect(linksData[2].href).to.equal("/redirectTo");
      expect(linksData[3].href).to.equal("/logout");
    });
  });

  it("SD: should display the expected title and links", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.StartJourney,
      args: ["storageNotes"],
    };

    cy.visit("/", { qs: { ...testParams } });

    cy.get("#createStorageDocument").check("storageNotes");
    cy.get("form").submit();

    const homeLink = "/create-storage-document/storage-documents";

    cy.contains("a", /^Create a UK storage document$/)
      .should("be.visible")
      .should("have.attr", "href", homeLink);

    cy.get("[data-testid=navigation]").should(($ul) => {
      const links = $ul.find("a");

      expect(links).to.have.lengthOf(4);

      const linksData = getData(links);
      expect(linksData[0].text).to.equal("Home");
      expect(linksData[1].text).to.equal("Manage account");
      expect(linksData[2].text).to.equal("Change organisation");
      expect(linksData[3].text).to.equal("Sign out");

      expect(linksData[0].href).to.equal("/");
      expect(linksData[1].href).to.equal("https://idm-dev-public.azure.defra.cloud/account-management/me");
      expect(linksData[2].href).to.equal("/redirectTo");
      expect(linksData[3].href).to.equal("/logout");
    });
  });

  it("Footer Pages: should hide the home link and favourites link on pages linked from the footer (e.g accessibility)", () => {
    cy.visit("/accessibility");
    assertFooterPages();

    cy.visit("/cookies");
    assertFooterPages();

    cy.visit("/privacy-notice");
    assertFooterPages();

    cy.visit("/service-improvement-plan");
    assertFooterPages();
  });
});
