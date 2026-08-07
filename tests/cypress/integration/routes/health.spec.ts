describe("Health Page", () => {
  it("should render health page content", () => {
    cy.visit("/health");

    cy.get("h1").should("be.visible").contains("This is a devOps page to test frontDoor");
  });

  it("should exercise coverage fixtures for legacy components", () => {
    cy.intercept("POST", "/set-cookie-preference", {
      statusCode: 200,
      body: { success: true },
    }).as("cookiePreferenceSave");

    cy.visit("/health?showCoverageFixtures=1&loggedIn=yes");

    cy.get(".govuk-cookie-banner").should("be.visible");
    cy.contains("button", "Accept analytics cookies").then(($button) => {
      ($button[0] as HTMLButtonElement).click();
    });
    cy.wait("@cookiePreferenceSave");
    cy.get(".govuk-cookie-banner__content").should("contain.text", "You've accepted analytics cookies");
    cy.contains("button", "Hide cookie message").then(($button) => {
      ($button[0] as HTMLButtonElement).click();
    });
    cy.get(".govuk-cookie-banner").should("not.exist");

    cy.intercept("POST", "/set-cookie-preference", {
      forceNetworkError: true,
    }).as("cookiePreferenceNetworkError");
    cy.visit("/health?showCoverageFixtures=1&loggedIn=yes");
    cy.contains("button", "Reject analytics cookies").then(($button) => {
      ($button[0] as HTMLButtonElement).click();
    });
    cy.wait("@cookiePreferenceNetworkError");
    cy.get(".govuk-cookie-banner__content").should("contain.text", "You've rejected analytics cookies");
    cy.contains("button", "Hide cookie message").then(($button) => {
      ($button[0] as HTMLButtonElement).click();
    });
    cy.get(".govuk-cookie-banner").should("not.exist");

    cy.get("[data-testid='coverage-fixtures']").should("be.visible");
    cy.get("[data-testid='coverage-notification-component-fixture'] .notification-banner__heading").should(
      "contain.text",
      "Coverage Title"
    );
    cy.get("[data-testid='coverage-notification-component-fixture'] .notification-banner__message").should(
      "contain.text",
      "Coverage Message"
    );

    cy.get("[data-testid='coverage-help-link-cc'] [data-test-id='get-help-body']").should(
      "contain.text",
      "catch certificate"
    );
    cy.get("[data-testid='coverage-help-link-ps'] [data-test-id='get-help-body']").should(
      "contain.text",
      "processing statement"
    );
    cy.get("[data-testid='coverage-help-link-sd'] [data-test-id='get-help-body']").should(
      "contain.text",
      "non-manipulation document"
    );
    cy.get("[data-testid='coverage-help-link-unknown'] [data-test-id='get-help-body']").should("be.visible");
    cy.get("[data-testid='coverage-help-link-loader-fallback'] [data-test-id='get-help-body']").should("be.visible");

    cy.get("[data-testid='client-filter-search-fixture']").should("be.visible");
    cy.get("#client-filter-search").should("have.value", "Cod");

    cy.get("[data-testid='filter-search-reset']")
      .first()
      .then(($button) => {
        const button = $button[0] as HTMLButtonElement;
        button.form?.requestSubmit(button);
      });
    cy.get("input#q-filter").should("exist");

    cy.get("[data-testid='client-filter-search-fixture'] [data-testid='filter-search-reset']").then(($button) => {
      const button = $button[0] as HTMLButtonElement;
      button.form?.requestSubmit(button);
    });
    cy.get("#client-filter-search").should("exist");

    cy.get("[data-testid='coverage-notification']").should("contain.text", "A sample notification message");
    cy.get("[data-testid='coverage-notification-multi']").should("have.length", 2);
    cy.get(".client-mounted-error-summary").should("be.visible");

    cy.get("[data-testid='coverage-autocomplete-default-fixture'] #coverage-autocomplete")
      .should("have.attr", "aria-controls", "coverage-autocomplete__listbox")
      .clear()
      .type("zz");
    cy.get("[data-testid='coverage-autocomplete-default-fixture'] #coverage-autocomplete").should("have.value", "zz");

    cy.get("[data-testid='coverage-autocomplete-default-fixture'] #coverage-autocomplete").clear().type("hak");
    cy.get("[data-testid='coverage-autocomplete-default-fixture'] #coverage-autocomplete").should("have.value", "hak");

    cy.get("[data-testid='coverage-autocomplete-default-fixture'] #coverage-autocomplete").clear().type("co");
    cy.get("[data-testid='coverage-autocomplete-default-fixture'] #coverage-autocomplete").should("have.value", "co");
    cy.get("[data-testid='coverage-autocomplete-change-value']").should("not.be.empty");

    cy.get("[data-testid='coverage-autocomplete-custom-fixture'] .coverage-autocomplete-container").should("exist");
    cy.get("[data-testid='coverage-autocomplete-custom-fixture'] .coverage-autocomplete-label").should("exist");
    cy.get("[data-testid='coverage-autocomplete-custom-fixture'] .coverage-autocomplete-hint").should("exist");
    cy.get("[data-testid='coverage-autocomplete-custom-fixture'] #coverage-autocomplete-custom")
      .should("have.attr", "aria-controls", "coverage-autocomplete-custom__listbox")
      .clear()
      .type("zzz");

    cy.get("[data-testid='coverage-autocomplete-value-fixture'] #coverage-autocomplete-value").should(
      "have.value",
      "Cod"
    );
    cy.get("[data-testid='coverage-autocomplete-status-none']").should("have.text", "No results found");
    cy.get("[data-testid='coverage-autocomplete-status-one']").should("have.text", "single:1:fish:2");
    cy.get("[data-testid='coverage-autocomplete-status-many']").should("have.text", "multiple:2:fish:3");
    cy.get("[data-testid='coverage-autocomplete-status-negative']").should("have.text", "");
    cy.get("[data-testid='coverage-autocomplete-search-zz']").should("have.text", "[]");
    cy.get("[data-testid='coverage-autocomplete-search-hak']").should("have.text", '["Hake"]');
    cy.get("[data-testid='coverage-autocomplete-search-co']").should("have.text", '["Cod","Coley"]');
    cy.get("[data-testid='coverage-autocomplete-search-filter']").should("contain.text", "Coley");
    cy.get("[data-testid='coverage-autocomplete-translator-single']").should("have.text", "single:1:fish:2");
    cy.get("[data-testid='coverage-autocomplete-translator-multiple']").should("have.text", "multiple:2:fish:3");
    cy.get("[data-testid='coverage-autocomplete-translator-fallback']").should("have.text", "unknownKey");
    cy.get("[data-testid='coverage-pagination-translator-fallback']").should("have.text", "unknownKey");
    cy.get("[data-testid='coverage-autocomplete-noop-change-result']").should("have.text", "true");
    cy.get("[data-testid='coverage-autocomplete-resolved-defaults']")
      .invoke("text")
      .should("include", '"notFoundText":"No results found"')
      .and("include", '"containerClassName":"govuk-form-group"')
      .and("include", '"errorPosition":"after-hint"')
      .and("include", '"resultUlClass":"autocomplete__menu"');
    cy.get("[data-testid='coverage-autocomplete-resolved-customs']")
      .invoke("text")
      .should("include", '"notFoundText":"No fish found"')
      .and("include", '"containerClassName":"custom-container"')
      .and("include", '"errorPosition":"after-label"')
      .and("include", '"resultUlClass":"custom-menu"')
      .and("include", '"defaultValue":"Cod"');
    cy.get("[data-testid='coverage-autocomplete-resolved-default-value']")
      .invoke("text")
      .should("include", '"defaultValue":"Haddock"');
    cy.get("[data-testid='coverage-autocomplete-resolved-empty-fallback']")
      .invoke("text")
      .should("include", '"defaultValue":""');
    cy.get("[data-testid='coverage-common-date-initial-valid']")
      .invoke("text")
      .should("match", /^2026-08-/);
    cy.get("[data-testid='coverage-common-date-initial-invalid']").should("have.text", "true");
    cy.get("[data-testid='coverage-common-date-parts-complete']").should(
      "have.text",
      '{"yearSelected":"2026","monthSelected":"8","daySelected":"20"}'
    );
    cy.get("[data-testid='coverage-common-date-parts-empty']").should(
      "have.text",
      '{"yearSelected":"","monthSelected":"","daySelected":""}'
    );
    cy.get("[data-testid='coverage-common-date-change-state-valid']")
      .invoke("text")
      .should("match", /^2026-08-/);
    cy.get("[data-testid='coverage-common-date-change-state-null']").should("have.text", "Invalid date");
    cy.get("[data-testid='coverage-common-date-sync-valid']").should("contain.text", "2026-08-");
    cy.get("[data-testid='coverage-common-date-sync-valid-fallback']").should("have.text", "null");
    cy.get("[data-testid='coverage-common-date-sync-invalid']").should("have.text", "null");
    cy.get("[data-testid='coverage-common-date-add-button-true']").should("have.text", "true");
    cy.get("[data-testid='coverage-common-date-add-button-false']").should("have.text", "false");
    cy.get("[data-testid='coverage-common-date-calendar-true']").should("have.text", "true");
    cy.get("[data-testid='coverage-common-date-calendar-false']").should("have.text", "false");
    cy.get("[data-testid='coverage-page-navigation-prev'] a")
      .should("have.attr", "rel", "prev")
      .and("have.attr", "href")
      .and("include", "month=");
    cy.get("[data-testid='coverage-page-navigation-next'] a")
      .should("have.attr", "rel", "next")
      .and("have.attr", "href")
      .and("include", "year=");
    cy.get("[data-testid='coverage-page-navigation-monthly'] li").should("have.length.at.least", 1);
    cy.get("[data-testid='coverage-page-navigation-monthly'] .govuk-pagination__item--current").should("exist");
    cy.get("[data-testid='coverage-page-navigation-prev'] .govuk-visually-hidden").should(
      "contain.text",
      "Catch certificates pages"
    );
    cy.get("[data-testid='coverage-page-navigation-next'] .govuk-visually-hidden").should(
      "contain.text",
      "Catch certificates pages"
    );
    cy.get("[data-testid='coverage-page-navigation-prev-no-hidden'] .govuk-visually-hidden").should("not.exist");
    cy.get("[data-testid='coverage-page-navigation-next-no-hidden'] .govuk-visually-hidden").should("not.exist");

    cy.get("#coverage-date-container .date-picker").should("exist");
    cy.get("#coverage-date-year").clear();
    cy.get("#coverage-date-year").type("2026");
    cy.get("#coverage-date-month").clear();
    cy.get("#coverage-date-month").type("8");
    cy.get("#coverage-date").clear();
    cy.get("#coverage-date").type("15");
    cy.get("#coverage-date-container .date-picker")
      .invoke("val")
      .should("match", /^2026-08-/);
    cy.get("#coverage-date-container .date-picker").first().click();
    cy.get(".react-datepicker").should("be.visible");
    cy.get(".react-datepicker__day--020:not(.react-datepicker__day--outside-month)").first().click();
    cy.get("#coverage-date-container .date-picker")
      .invoke("val")
      .should("match", /^2026-08-/);
    cy.get("button[data-testid='add-coverage-date']").should("not.exist");
    cy.get("button[data-testid='add-coverage-date-add-button']").should("be.visible");
    cy.get("#coverage-date-with-error").should("have.class", "govuk-input--error");

    cy.get("[data-testid='coverage-table-header'] thead tr").within(() => {
      cy.get("th").should("have.length", 2);
      cy.get("td").should("have.length", 1);
    });

    cy.get("[data-testid='coverage-format-address']").should("contain.text", "Line 1");
    cy.get("[data-testid='coverage-format-address']").should("contain.text", "Line 2");
    cy.get("[data-testid='coverage-format-address']").should("contain.text", "Line 3");

    cy.get("#hsa-option-yes").should("have.length", 1);
    cy.get("#hsa-option-no").should("have.length", 1);
    cy.get("#hsa-option-error-yes").should("have.length", 1);
    cy.get("#hsa-option-error-no").should("have.length", 1);

    cy.contains("summary", "RFMO help").click();
    cy.contains("details.govuk-details", "RFMO help").within(() => {
      cy.get("a.govuk-link").should("have.attr", "href").and("include", "fishing-area#rfmo");
    });

    cy.get("#hsa-option-yes").first().check();
    cy.get("#hsa-option-error-no").first().check();

    cy.get("#gearCategory").eq(0).select("Longline");
    cy.get("#gearType").eq(0).select("Pots (FPO)");
    cy.get("#gearType").last().select("Drift nets (GN)");
    cy.get("#rfmo").select("NEAFC");
    cy.get("[data-testid='client-rfmo-selector-fixture'] select[name='rfmo']").select("NEAFC");

    cy.get("[data-testid='mount-client-filter-search']").click();
    cy.get("[data-testid='mount-client-rfmo-selector']").click();
    cy.get("[data-testid='mount-client-error-summary']").click();

    cy.get("[data-testid='coverage-fixtures']").should("exist");
  });
});
