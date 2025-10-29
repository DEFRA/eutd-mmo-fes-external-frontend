// @ts-nocheck
import { type ITestParams, TestCaseId } from "~/types";

describe("Action function for aad login", () => {
  it("should return status 401(unauthorised) when request param is empty", () => {
    cy.request({
      method: "POST",
      url: "/auth/openid/returnUri",
      failOnStatusCode: false,
    }).as("noRequestData");
    cy.get("@noRequestData").should((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("should return status 401(unauthorised) when tokenset is empty", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.adminLogin,
    };
    cy.request({
      method: "POST",
      url: "/auth/openid/returnUri",
      qs: { ...testParams },
      failOnStatusCode: false,
      body: "client_id=456&scope=openid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fopenid%2Freturn&response_mode=form_post",
    }).as("unauthorised");

    cy.get("@unauthorised").should((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
