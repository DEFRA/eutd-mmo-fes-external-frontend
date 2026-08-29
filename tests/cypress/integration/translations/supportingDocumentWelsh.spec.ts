/**
 * UAT-496: Test for Welsh translation of supporting document error
 * Verify that the supporting document error message is available in Welsh
 * and displays the correct translation.
 */

describe("Supporting Document Welsh Translation (UAT-496)", () => {
  it("should have Welsh translation for supporting document must not exceed 54 characters error", () => {
    // Load the Welsh error translations
    cy.readFile("public/locales-v2/cy/errorsText.json").then((errorsData) => {
      // Check that the Welsh translation key exists
      expect(errorsData).to.have.property("sdAddProductToConsignmentSupportingDocumentErrorMustNotExceed-54");

      // Verify the Welsh translation content
      const welshTranslation = errorsData["sdAddProductToConsignmentSupportingDocumentErrorMustNotExceed-54"];
      expect(welshTranslation).to.equal("Rhaid i rif y ddogfen ategol fod yn llai na 54 o nodau");
    });
  });

  it("should have English translation for supporting document must not exceed 54 characters error", () => {
    // Load the English error translations for comparison
    cy.readFile("public/locales-v2/en/errorsText.json").then((errorsData) => {
      // Check that the English translation key exists
      expect(errorsData).to.have.property("sdAddProductToConsignmentSupportingDocumentErrorMustNotExceed-54");

      // Verify the English translation content
      const englishTranslation = errorsData["sdAddProductToConsignmentSupportingDocumentErrorMustNotExceed-54"];
      expect(englishTranslation).to.equal("Supporting document number must not exceed 54 characters");
    });
  });

  it("both English and Welsh translations should exist for the same key", () => {
    cy.readFile("public/locales-v2/en/errorsText.json").then((enErrors) => {
      cy.readFile("public/locales-v2/cy/errorsText.json").then((cyErrors) => {
        const translationKey = "sdAddProductToConsignmentSupportingDocumentErrorMustNotExceed-54";

        // Verify both files have the same key
        expect(enErrors).to.have.property(translationKey);
        expect(cyErrors).to.have.property(translationKey);

        // Verify they have different values (one in English, one in Welsh)
        expect(enErrors[translationKey]).to.not.equal(cyErrors[translationKey]);

        // Verify the Welsh translation has been corrected to reference 52 characters (UAT-496)
        expect(cyErrors[translationKey]).to.include("54 o nodau");
      });
    });
  });
});
