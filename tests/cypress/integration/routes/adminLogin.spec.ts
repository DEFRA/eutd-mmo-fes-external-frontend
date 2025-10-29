import { type ITestParams, TestCaseId } from "~/types";

describe("Admin to FE-V2 Login Page", () => {
  it("should call admin login loader function", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.adminLogin,
    };
    cy.request({ url: "/admin-login", qs: { ...testParams }, failOnStatusCode: false });
  });
});
