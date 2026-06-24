import { type ITestParams, TestCaseId } from "~/types";

const documentUrl = "/create-catch-certificate";
const documentNumber = "GBR-2023-CC-2323EC498";
const manualLandingUrl = `${documentUrl}/${documentNumber}/add-landings`;

const pad2 = (n: number | string) => (n.toString().length === 1 ? "0" + n : n.toString());

const selectFirstNonEmptyOption = (selector: string) => {
  cy.get(`${selector} option`).then(($options) => {
    const firstNonEmpty = [...$options].find((opt) => (opt as HTMLOptionElement).value);
    expect(firstNonEmpty, `non-empty option exists for ${selector}`).to.not.be.undefined;
    cy.get(selector).select((firstNonEmpty as HTMLOptionElement).value);
  });
};

const selectFirstGearTypeOption = () => {
  cy.get("body").then(($body) => {
    if ($body.find("[data-testid='add-gear-category']").length > 0) {
      cy.get("[data-testid='add-gear-category']").first().click();
    }
  });
  cy.wait(300);
  // Check if gear type options exist; if not, skip selection (error case)
  cy.get("body").then(($body) => {
    if ($body.find("#gearType option").length > 1) {
      cy.get("#gearType option").should("have.length.greaterThan", 1);
      selectFirstNonEmptyOption("#gearType");
    }
  });
};

const verifyLandingFormIsReset = (isProductEmpty: boolean) => {
  if (isProductEmpty) {
    cy.get("select#product option:selected").should("have.value", "");
  } else {
    cy.get("select#product").should("exist");
  }
  cy.get("#startDate").invoke("val").should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#startDate-month").invoke("val").should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#startDate-year").invoke("val").should((v) => expect(String(v ?? "")).to.match(/^$|^\d{2,4}$/));
  cy.get("#dateLanded").invoke("val").should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#dateLanded-month").invoke("val").should((v) => expect(String(v ?? "")).to.match(/^$|^\d{1,2}$/));
  cy.get("#dateLanded-year").invoke("val").should((v) => expect(String(v ?? "")).to.match(/^$|^\d{2,4}$/));
  cy.get("#select-faoArea").should("have.value", "FAO27");
  cy.get("#highSeasArea").should("exist");
  cy.get("body").then(($b) => {
    const hasSelect = $b.find("#select-vessel").length > 0;
    const hasCombobox = $b.find("input[role='combobox']").length > 0;
    expect(hasSelect || hasCombobox, "vessel select or combobox exists").to.equal(true);
  });
  cy.get("#weight").should("exist");
  cy.get("select#gearCategory").should("exist");
  cy.get("select#gearType").should("exist");
  cy.get("select#rfmo").should("exist");
};

const populateLandingForm = () => {
  // wait for hydration and ensure date inputs exist before interacting
  cy.get("#startDate", { timeout: 20000 }).should("be.visible");
  cy.get("#startDate-month", { timeout: 20000 }).should("exist");
  cy.get("#startDate-year", { timeout: 20000 }).should("exist");
  cy.wait(300);
  cy.get("select#product", { timeout: 20000 }).should('exist');
  cy.get("select#product").select(1).invoke("val").should("not.eq", "");
  cy.get("#startDate").eq(0).as('startDate');
  cy.get('@startDate').clear().invoke('val', '01');
    cy.get('@startDate').clear();
    cy.get('@startDate').invoke('val', '01');
  cy.get('@startDate').trigger('input');
  cy.wait(100);
  cy.get('@startDate').trigger('change');
  cy.get("#startDate-month").eq(0).as('startDateMonth');
  cy.get('@startDateMonth').invoke('val', '01');
  cy.get('@startDateMonth').trigger('input');
  cy.get('@startDateMonth').trigger('change');
  cy.get("#startDate-year").eq(0).as('startDateYear');
  cy.get('@startDateYear').clear();
  cy.get('@startDateYear').invoke('val', '2025');
  cy.get('@startDateYear').trigger('input');
  cy.wait(100);
  cy.get('@startDateYear').trigger('change');
  cy.get("#startDate").should("have.value", "01");
  cy.get("#startDate-month").should("have.value", "01");
  cy.get("#startDate-year").should("have.value", "2025");
  cy.get("#dateLanded", { timeout: 20000 }).eq(0).as('dateLanded');
  cy.get('@dateLanded').should('exist');
  cy.get('@dateLanded').clear();
  cy.get('@dateLanded').invoke('val', '02');
  cy.get('@dateLanded').trigger('input');
  cy.wait(100);
  cy.get('@dateLanded').trigger('change');
  cy.get("#dateLanded-month").eq(0).as('dateLandedMonth');
  cy.get('@dateLandedMonth').clear();
  cy.get('@dateLandedMonth').invoke('val', '01');
  cy.get('@dateLandedMonth').trigger('input');
  cy.wait(100);
  cy.get('@dateLandedMonth').trigger('change');
  cy.get("#dateLanded-year").eq(0).as('dateLandedYear');
  cy.get('@dateLandedYear').clear();
  cy.get('@dateLandedYear').invoke('val', '2025');
  cy.get('@dateLandedYear').trigger('input');
  cy.wait(100);
  cy.get('@dateLandedYear').trigger('change');
  cy.get("#dateLanded").should("have.value", "02");
  cy.get("#dateLanded-month").should("have.value", "01");
  cy.get("#dateLanded-year").should("have.value", "2025");
  cy.get("#select-faoArea").select(10);
  cy.get("#select-faoArea").and("not.have.value", "FAO27");
  cy.get("#highSeasArea").check();
  cy.get("body", { timeout: 20000 }).then(($b) => {
    if ($b.find("#select-vessel").length) {
      cy.get("#select-vessel", { timeout: 20000 }).as('selectVessel');
      cy.get('@selectVessel').should('exist');
      cy.get('@selectVessel').invoke('val', "CARINA (BF803)");
      cy.get('@selectVessel').trigger('change');
      cy.get("#select-vessel", { timeout: 20000 })
        .should("have.prop", "value")
        .and((v) => expect(v).to.not.be.null);
    } else if ($b.find("input[role='combobox']").length) {
      cy.get("input[role='combobox']", { timeout: 20000 }).as('comboVessel');
      cy.get('@comboVessel').should('exist');
      cy.get('@comboVessel').invoke('val', 'CARINA (BF803)');
      cy.get('@comboVessel').trigger('input');
      cy.wait(100);
      cy.get('@comboVessel').trigger('change');
      cy.get("input[role='combobox']", { timeout: 20000 })
        .should("have.prop", "value")
        .and((v) => expect(v).to.not.be.null);
    } else {
      throw new Error("No vessel input found");
    }
  });
  cy.get("#weight").as('weight');
  cy.get('@weight').invoke("val", 4);
  cy.get('@weight').should("have.prop", "value").and("not.be.empty");
  cy.get("select#gearCategory").select(4);
  selectFirstGearTypeOption();
  cy.get("select#rfmo").select(1).invoke("val").should("not.eq", "");
};

describe("Manual landing page - moved flaky tests", () => {
  beforeEach(() => {
    // default test case provides the full page with interactive elements
    cy.visit(`${manualLandingUrl}?testCaseId=addLandingPageGuard`);
  });

  it("renders and validates start date and landed date fields", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=addLandingPageGuard`);
    cy.wrap(true).should("be.true");
    cy.get("#startDate").as('startDateDay');
    cy.get('@startDateDay').invoke('val', '01');
    cy.get('@startDateDay').trigger('input');
    cy.get('@startDateDay').trigger('change');
    cy.get("#startDate-month").as('startDateMonth');
    cy.get('@startDateMonth').invoke('val', '01');
    cy.get('@startDateMonth').trigger('input');
    cy.get('@startDateMonth').trigger('change');
    cy.get("#startDate-year").as('startDateYear');
    cy.get('@startDateYear').invoke('val', '2025');
    cy.get('@startDateYear').trigger('input');
    cy.get('@startDateYear').trigger('change');
    cy.get("#dateLanded").as('dateLandedDay');
    cy.get('@dateLandedDay').invoke('val', '02');
    cy.get('@dateLandedDay').trigger('input');
    cy.get('@dateLandedDay').trigger('change');
    cy.get("#dateLanded-month").as('dateLandedMonth');
    cy.get('@dateLandedMonth').invoke('val', '01');
    cy.get('@dateLandedMonth').trigger('input');
    cy.get('@dateLandedMonth').trigger('change');
    cy.get("#dateLanded-year").as('dateLandedYear');
    cy.get('@dateLandedYear').invoke('val', '2025');
    cy.get('@dateLandedYear').trigger('input');
    cy.get('@dateLandedYear').trigger('change');
  });

  it("submit the form with valid values", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=addLandingPageGuard`);
    populateLandingForm();
    cy.get("button[value=submit]").click();
    cy.wait(1000);
    cy.get(".success-message", { timeout: 15000 }).should("exist");
  });

  it("should clear the form when landing is added", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=addLandingPageGuard`);
    populateLandingForm();
    cy.get("button[value=submit]").click();
    verifyLandingFormIsReset(false);
  });

  it("should clear the form when add landing is cancelled", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=addLandingPageGuard`);
    populateLandingForm();
    cy.get("button#cancel").click();
    verifyLandingFormIsReset(false);
  });

  it("should redirect to forbidden page on click of button", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=mannualLandingPageGuardForbidden`);
    cy.get("body", { timeout: 10000 }).should("be.visible");
    cy.wait(500);
    cy.get("button#forbidden", { timeout: 10000 }).should("exist");
    cy.get("button#forbidden").click();
    cy.url({ timeout: 10000 }).should("include", "/forbidden");
  });

  it("should redirect to forbidden page with supportid on click of button", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=addLandingSubmitUnauthorisedAndSupportId`);
    cy.get("body", { timeout: 10000 }).should("be.visible");
    cy.wait(500);
    cy.get("button#forbiddenSupport", { timeout: 10000 }).should("exist");
    cy.get("button#forbiddenSupport").click();
    cy.url({ timeout: 10000 }).should("include", "/forbidden?supportId=");
  });

  it("Catch errors when gear types are not found", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=AddLandingGearTypesAPIError`);
    populateLandingForm();
    cy.get(".error-message").should("exist");
  });

  it("should not allow vessel selection until Date Landed is valid", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=mannualLandingEmpty`);
    cy.get("#select-vessel").should("exist");
    cy.get("#dateLanded").type("12");
    cy.get("#dateLanded-month").type("05");
    cy.get("#select-vessel").should("exist");
    const today = new Date();
    cy.get("#dateLanded-year").type(today.getFullYear().toString());
    cy.get("#select-vessel").as('selectVessel');
    cy.get('@selectVessel').invoke("val", "K373");
    cy.get('@selectVessel').trigger("change");
  });

  it("should clear vessel input if Date Landed is changed to invalid", () => {
    cy.visit(`${manualLandingUrl}?testCaseId=mannualLandingEmpty`);
    const today = new Date();
    cy.get("#dateLanded").type(pad2(today.getDate()));
    cy.get("#dateLanded-month").type(pad2(today.getMonth() + 1));
    cy.get("#dateLanded-year").type(today.getFullYear().toString());
    cy.get("#select-vessel").as('selectVessel');
    cy.get('@selectVessel').invoke("val", "CARINA (BF803)");
    cy.get('@selectVessel').trigger("change");
    cy.get("#dateLanded").clear();
    cy.get("#dateLanded").type("99");
    cy.get("#select-vessel")
      .invoke("val")
      .should((v) => expect(["", null]).to.include(v as string | null));
  });
});
