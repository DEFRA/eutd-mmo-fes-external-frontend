describe("upload guidance page", () => {
  const docummentNumber = "GBR-2022-CC-012345678";
  const uploadGuidanceUrl = `/create-catch-certificate/${docummentNumber}/upload-guidance`;

  beforeEach(() => {
    cy.visit(uploadGuidanceUrl);
  });

  it("should render upload guidance page", () => {
    cy.contains("a", /^Back$/)
      .should("be.visible")
      .should("have.attr", "href", `/create-catch-certificate/${docummentNumber}/upload-file`);
  });

  it("should render optional fields warning message", () => {
    cy.get("div.govuk-warning-text")
      .find("strong")
      .should(
        "contain",
        "From 10 January 2026, start date, high seas area, EEZ, RFMO and gear type fields will be mandatory under new EU regulations."
      );
  });

  it("should render a data structure with only mandatory fields and an example", () => {
    cy.get("div.govuk-inset-text")
      .find("b")
      .should("contain", "Product ID,Date landed,Catch area,Vessel PLN,Export weight");
    cy.get("div.govuk-inset-text")
      .find("span.example-data-structure-short")
      .eq(0)
      .should("have.text", "For example: PRD123,01/01/2021,FAO27,PH1100,50.95");
  });

  it("should render a data structure with mandatory and optional fields and an example", () => {
    cy.get("div.govuk-inset-text")
      .find("b")
      .should(
        "contain",
        "Product ID, Start date, Date landed, Catch area, High Seas area, EEZ, RFMO, Vessel PLN, Gear type, Export weight"
      );
    cy.get("div.govuk-inset-text")
      .find("span.example-data-structure-full")
      .should("have.text", "For example: PRD123,01/01/2021,01/01/2021,FAO27,Yes,GBR,IOTC,PH1100,PS,50.95");
  });

  it("should render a data structure with mandatory and optional fields as blank and an example", () => {
    cy.get("div.govuk-inset-text")
      .find("b")
      .should(
        "contain",
        "Product ID, Start date, Date landed, Catch area, High Seas area, EEZ, RFMO, Vessel PLN, Gear type, Export weight"
      );
    cy.get("div.govuk-inset-text")
      .find("span.example-data-structure-short")
      .eq(1)
      .should("have.text", "For example: PRD123,,01/01/2021,FAO27,,,,PH1100,,50.95");
  });

  it("should render a Product ID requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Product ID").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("The product ID must refer to a product saved in your product favourites")
      .should("exist");
  });

  it("should render a Start Date (Optional) field data requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Start date (optional)").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Field can be left blank until 10th Jan 2026")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Start dates must be real dates in the format 'dd/mm/yyyy'")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Dates cannot be more than 7 days in the future.")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Start dates must not be after the landed dates.")
      .should("exist");
  });

  it("should render a Date landed requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Date landed").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Landing dates must be real dates in the format 'dd/mm/yyyy'.")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Dates cannot be more than 7 days in the future.")
      .should("exist");
  });

  it("should render a Catch Area requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Catch Area").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("The catch area must be a FAO major fishing area.")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("A list of the major fishing areas is available from: www.fao.org (opens in new tab")
      .should("exist");
  });

  it("should render a High Seas Area (Optional) requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("High Seas Area (optional)").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Field can be left blank until 10th Jan 2026")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("To indicate if a catch was made in high seas.")
      .should("exist");
  });

  it("should render a EEZ (Optional) requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Exclusive economic zone (optional)").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Field can be left blank until 10th Jan 2026")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("EEZ must be entered as a 2 or 3 character country ISO codes.")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("If providing multiple EEZ, these must be separated by a semi-colon.")
      .should("exist");
  });

  it("should render a RFMO (Optional) requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header")
      .contains("Regional fisheries management organisation (optional)")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Field can be left blank until 10th Jan 2026")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li").contains("RFMO acronym to be entered.").should("exist");
  });

  it("should render a Vessel PLN requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Vessel PLN").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("The PLN must be a valid Vessel PLN.")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Vessels must be licensed on the date the catch was landed.")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Vessel PLNs are available from: fishhub.cefas.co.uk/vessel-register/ (opens in new tab)")
      .should("exist");
  });

  it("should render a Gear Type (optional) requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Gear Type (optional)").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Field can be left blank until 10th Jan 2026")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("The gear type must be entered as a 2 or 3 character code.")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("The gear type must be a valid gear type code.")
      .should("exist");
  });

  it("should render a Export weight requirement row", () => {
    cy.get("tr.govuk-table__row th.govuk-table__header").contains("Export weight").should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("The export weight must be in kilograms (kg).")
      .should("exist");
    cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
      .contains("Weights must be greater than zero with up to two decimal places.")
      .should("exist");
  });
});
