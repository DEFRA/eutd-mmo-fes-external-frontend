// @ts-nocheck
import { type ITestParams, TestCaseId } from "~/types";

describe("Loader function for idm login", () => {
  it("should return status 500", () => {
    cy.request({
      method: "GET",
      url: "/login/return",
      failOnStatusCode: false,
    }).as("loader");
    cy.get("@loader").should((response) => {
      expect(response.status).to.eq(500);
    });
  });
});

describe("Action function for idm login", () => {
  it("should return status 401 when request param is empty", () => {
    cy.request({
      method: "POST",
      url: "/login/return",
      failOnStatusCode: false,
    }).as("noRequestData");
    cy.get("@noRequestData").should((response) => {
      expect(response.status).to.eq(401);
    });
  });

  it("should return status 500 when Unable to obtain a token", () => {
    const testParams: ITestParams = {
      testCaseId: TestCaseId.idmLogin,
    };
    cy.request({
      method: "POST",
      url: "/login/return",
      qs: { ...testParams },
      failOnStatusCode: false,
      body: "client_id=456&scope=openid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fopenid%2Freturn&response_mode=form_post",
    }).as("unauthorised");

    cy.get("@unauthorised").should((response) => {
      expect(response.status).to.eq(500);
    });
  });
});
