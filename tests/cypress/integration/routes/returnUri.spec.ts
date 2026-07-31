// @ts-nocheck
import { type ITestParams, TestCaseId } from "~/types";

describe("Action function for aad login", () => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.adminLogin,
  };

  const postBody =
    "client_id=456&scope=openid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fopenid%2Freturn&response_mode=form_post";

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
    cy.request({
      method: "POST",
      url: "/auth/openid/returnUri",
      qs: { ...testParams },
      failOnStatusCode: false,
      body: postBody,
    }).as("unauthorised");

    cy.get("@unauthorised").should((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("should consistently return 401 for both empty and populated admin-login payloads", () => {
    cy.request({
      method: "POST",
      url: "/auth/openid/returnUri",
      qs: { ...testParams },
      failOnStatusCode: false,
    }).as("emptyPayload");

    cy.request({
      method: "POST",
      url: "/auth/openid/returnUri",
      qs: { ...testParams },
      failOnStatusCode: false,
      body: postBody,
    }).as("populatedPayload");

    cy.get("@emptyPayload").should((response) => {
      expect(response.status).to.eq(401);
    });

    cy.get("@populatedPayload").should((response) => {
      expect(response.status).to.eq(401);
    });
  });
});
