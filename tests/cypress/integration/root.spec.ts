import * as GovUKFrontEnd from "govuk-frontend";

describe("App Root", () => {
  const pageUrl = "/";
  let testParams = {};

  it("should not call govuk header if the header element isn't defined", () => {
    const stub = cy.stub(GovUKFrontEnd, "Header");
    const querySelector = cy.stub(document, "querySelector").returns(false);
    cy.visit(pageUrl, { qs: { ...testParams } });
    expect(stub.notCalled).to.not.equal(false);
    stub.restore();
    querySelector.restore();
  });
});
