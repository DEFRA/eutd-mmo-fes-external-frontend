const dashboardLink = "/create-catch-certificate/catch-certificates";

describe("PageNotFound", () => {
  it("should render as expected for an unknown main route", () => {
    cy.visit("/qwekjhzxc");

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK catch certificate$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });

  it("CC: should render as expected for an unknown route that begins with a known route", () => {
    const dashboardLink = "/create-catch-certificate/catch-certificates";

    cy.visit(`${dashboardLink}qwekjhzxc`);

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK catch certificate$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });

  it("PS: should render as expected for an unknown route that begins with a known route", () => {
    const dashboardLink = "/create-processing-statement/processing-statements";

    cy.visit(`${dashboardLink}qwekjhzxc`);

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK processing statement$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });

  it("SD: should render as expected for an unknown route that begins with a known route", () => {
    const dashboardLink = "/create-non-manipulation-document/non-manipulation-documents";

    cy.visit(`${dashboardLink}qwekjhzxc`);

    cy.contains("h1", /^Page not found$/).should("be.visible");

    cy.contains("a", /^check the document is in progress$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);

    cy.contains("a", /^Create a UK non-manipulation document$/)
      .should("be.visible")
      .should("have.attr", "href", dashboardLink);
  });
});
