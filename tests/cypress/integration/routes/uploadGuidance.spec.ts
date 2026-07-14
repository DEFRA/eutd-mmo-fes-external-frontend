describe("Upload Guidance Page", () => {
  const documentNumber = "GBR-2022-CC-012345678";
  const uploadGuidanceUrl = `/create-catch-certificate/${documentNumber}/upload-guidance`;

  beforeEach(() => {
    cy.visit(uploadGuidanceUrl);
  });

  describe("Header and Navigation", () => {
    it("should display the upload guidance page header", () => {
      cy.wrap(true).should("be.true");
      cy.contains("h1", "Upload guidance").should("be.visible");
    });

    it("should display the back link with correct href", () => {
      cy.wrap(true).should("be.true");
      cy.contains("a", /^Back$/)
        .should("be.visible")
        .should("have.attr", "href", `/create-catch-certificate/${documentNumber}/upload-file`);
    });
  });

  describe("General Section", () => {
    it("should display the General heading", () => {
      cy.wrap(true).should("be.true");
      cy.contains("caption", "General").should("be.visible");
    });

    describe("Upload Process subsection", () => {
      it("should display Upload Process heading", () => {
        cy.wrap(true).should("be.true");
        cy.get("tr.govuk-table__row th.govuk-table__header").contains("Upload").should("be.visible");
      });

      it("should display the upload process steps introduction", () => {
        cy.wrap(true).should("be.true");
        cy.contains("The steps of the upload process are as follows:").should("be.visible");
      });

      it("should display all upload process steps in order", () => {
        cy.wrap(true).should("be.true");
        cy.get("body").within(() => {
          cy.contains("Upload products and landings").should("be.visible");
          cy.contains("Upload the CSV file containing the product IDs and landings.").should("be.visible");

          cy.contains("Fix errors (if required)").should("be.visible");
          cy.contains("If there are multiple errors, you can clear the upload amend the file, and reupload.").should(
            "be.visible"
          );

          cy.contains("Review and correct").should("be.visible");
          cy.contains(
            "The steps will take you back to the Add landings page where you can add any missing landings manually or correct any mistakes you find."
          ).should("be.visible");
        });
      });

      it("should display note about repeating upload process", () => {
        cy.wrap(true).should("be.true");
        cy.contains("You can repeat this process to upload multiple CSV files.").should("be.visible");
      });
    });

    describe("Limitations subsection", () => {
      it("should display Limitations heading", () => {
        cy.wrap(true).should("be.true");
        cy.get("tr.govuk-table__row th.govuk-table__header").contains("Limitations").should("be.visible");
      });

      it("should display maximum rows limitation", () => {
        cy.wrap(true).should("be.true");
        cy.contains("The maximum number of rows that can be uploaded per catch certificate is 100.").should(
          "be.visible"
        );
      });

      it("should display product favourites limitation", () => {
        cy.wrap(true).should("be.true");
        cy.contains(
          "You can only upload products that have been saved in your product favourites, accessible from the main navigation."
        ).should("be.visible");
      });

      it("should display multiple products per landing limitation", () => {
        cy.wrap(true).should("be.true");
        cy.contains(
          "If your export contains multiple products from the same landing, the landing will need to be repeated for each product."
        ).should("be.visible");
      });
    });

    describe("Product IDs subsection", () => {
      it("should display Product IDs heading", () => {
        cy.wrap(true).should("be.true");
        cy.get("tr.govuk-table__row th.govuk-table__header").contains("Product IDs").should("be.visible");
      });

      it("should display product ID creation explanation", () => {
        cy.wrap(true).should("be.true");
        cy.contains("Product IDs are created when a").should("be.visible");
        cy.contains("a", "product favourites").should("be.visible");
        cy.contains("is saved.").should("be.visible");
      });

      it("should display product favourites link", () => {
        cy.wrap(true).should("be.true");
        cy.contains("a", "product favourites")
          .should("be.visible")
          .should("have.attr", "href")
          .and("include", "upload-favourites");
      });

      it("should display product ID uniqueness information", () => {
        cy.wrap(true).should("be.true");
        cy.contains("They are unique to each user and are used to speed up the process of uploading products.").should(
          "be.visible"
        );
      });

      it("should display product ID internal use note", () => {
        cy.wrap(true).should("be.true");
        cy.contains(
          "Product IDs are only used internally by the FES service and have no relevance to the final catch certificate."
        ).should("be.visible");
      });
    });
  });

  describe("CSV File Section", () => {
    it("should display CSV file heading", () => {
      cy.wrap(true).should("be.true");
      cy.contains("caption", "CSV file").should("be.visible");
    });

    describe("File Type subsection", () => {
      it("should display File type subheading", () => {
        cy.wrap(true).should("be.true");
        cy.get("tr.govuk-table__row th.govuk-table__header").contains("File type").should("be.visible");
      });

      it("should display CSV file type explanation", () => {
        cy.wrap(true).should("be.true");
        cy.contains("The upload file must be a CSV file (CSV stands for Comma Separated Values).").should("be.visible");
      });

      it("should display CSV generation information", () => {
        cy.wrap(true).should("be.true");
        cy.contains(
          "CSV files can be generated by exporting from spreadsheets or other software with an export feature."
        ).should("be.visible");
      });
    });

    describe("Data Structure subsection", () => {
      it("should display Data structure subheading", () => {
        cy.wrap(true).should("be.true");
        cy.get("tr.govuk-table__row th.govuk-table__header").contains("Data structure").should("be.visible");
      });

      it("should display instruction to not include header row", () => {
        cy.wrap(true).should("be.true");
        cy.contains("Do not include a header row.").should("be.visible");
      });

      it("should display row structure instruction", () => {
        cy.wrap(true).should("be.true");
        cy.contains("Each row must have the following structure:").should("be.visible");
      });

      it("should render mandatory fields data structure in inset text", () => {
        cy.wrap(true).should("be.true");
        cy.get("div.govuk-inset-text")
          .find("b")
          .should(
            "contain",
            "Product ID, Start date, Date landed, Catch area, High Seas area, EEZ, RFMO, Vessel PLN, Gear type, Export weight"
          );
      });

      it("should render mandatory fields example", () => {
        cy.wrap(true).should("be.true");
        cy.get("div.govuk-inset-text")
          .find("span.example-data-structure-short")
          .eq(0)
          .should("have.text", "For example: PRD123,01/01/2021,01/01/2021,FAO27,Yes,GBR,IOTC,PH1100,PS,50.95");
      });

      it("should display delimiter instruction", () => {
        cy.wrap(true).should("be.true");
        cy.contains("Only use commas to separate fields (known as 'delimiters').").should("be.visible");
      });

      it("should display grouping advice", () => {
        cy.wrap(true).should("be.true");
        cy.contains(
          "You are advised to group the rows together in a way that makes it easy for you to check the upload."
        ).should("be.visible");
      });
    });

    describe("Validation subsection", () => {
      it("should display Validation subheading", () => {
        cy.wrap(true).should("be.true");
        cy.get("tr.govuk-table__row th.govuk-table__header").contains("Validation").should("be.visible");
      });

      it("should display validation consistency message", () => {
        cy.wrap(true).should("be.true");
        cy.contains(
          "Uploaded products and landings will be subjected to the same validation as those entered manually."
        ).should("be.visible");
      });

      it("should display note about failed rows", () => {
        cy.wrap(true).should("be.true");
        cy.contains(
          "If some rows fail to upload and you want to add them later manually, you should make a note of them before continuing."
        ).should("be.visible");
      });
    });
  });

  describe("Data Requirements Section", () => {
    it("should display Data requirements heading", () => {
      cy.wrap(true).should("be.true");
      cy.contains("caption", "Data requirements").should("be.visible");
    });

    it("should render a Product ID requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("Product ID").should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("The product ID must refer to a product saved in your product favourites")
        .should("exist");
    });

    it("should render a Start Date field data requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("Start date").should("exist");
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
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("Date landed").should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("Landing dates must be real dates in the format 'dd/mm/yyyy'.")
        .should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("Dates cannot be more than 7 days in the future.")
        .should("exist");
    });

    it("should render a Catch Area requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("Catch Area").should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("The catch area must be a FAO major fishing area.")
        .should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("A list of the major fishing areas is available from: www.fao.org (opens in new tab")
        .should("exist");
    });

    it("should render a High Seas Area requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("High Seas Area").should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("To indicate if a catch was made in high seas.")
        .should("exist");
    });

    it("should render a EEZ requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("Exclusive economic zone").should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("EEZ must be entered as a 2 or 3 character country ISO codes.")
        .should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("If providing multiple EEZ, these must be separated by a semi-colon.")
        .should("exist");
    });

    it("should render a RFMO requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header")
        .contains("Regional fisheries management organisation")
        .should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li").contains("RFMO acronym to be entered.").should("exist");
    });

    it("should render a Vessel PLN requirement row", () => {
      cy.wrap(true).should("be.true");
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

    it("should render a Gear Type requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("Gear Type").should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("The gear type must be entered as a 2 or 3 character code.")
        .should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("The gear type must be a valid gear type code.")
        .should("exist");
    });

    it("should render a Export weight requirement row", () => {
      cy.wrap(true).should("be.true");
      cy.get("tr.govuk-table__row th.govuk-table__header").contains("Export weight").should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("The export weight must be in kilograms (kg).")
        .should("exist");
      cy.get("tr.govuk-table__row td.govuk-table__cell ol li")
        .contains("Weights must be greater than zero with up to two decimal places.")
        .should("exist");
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", () => {
      cy.wrap(true).should("be.true");
      cy.get("h1").should("have.length", 1);
      cy.get("h1").contains("Upload guidance");
    });

    it("should have accessible links with descriptive text", () => {
      cy.wrap(true).should("be.true");
      cy.contains("a", "product favourites").should("be.visible");
      cy.contains("a", "Back").should("be.visible");
    });

    it("should indicate external links with (opens in new tab) text", () => {
      cy.wrap(true).should("be.true");
      cy.contains("(opens in new tab)").should("exist");
    });
  });
});
