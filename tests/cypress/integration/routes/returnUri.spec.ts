// @ts-nocheck
import { type ITestParams, TestCaseId } from "~/types";

describe("Action function for aad login", () => {
  const testParams: ITestParams = {
    testCaseId: TestCaseId.adminLogin,
  };

  const postBody =
    "client_id=456&scope=openid&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fopenid%2Freturn&response_mode=form_post";

  const requestCases = [
    {
      alias: "noRequestData",
      title: "request params are missing",
      request: {
        method: "POST",
        url: "/auth/openid/returnUri",
        failOnStatusCode: false,
      },
    },
    {
      alias: "emptyPayload",
      title: "request params exist but body is missing",
      request: {
        method: "POST",
        url: "/auth/openid/returnUri",
        qs: { ...testParams },
        failOnStatusCode: false,
      },
    },
    {
      alias: "populatedPayload",
      title: "request params and payload are present",
      request: {
        method: "POST",
        url: "/auth/openid/returnUri",
        qs: { ...testParams },
        failOnStatusCode: false,
        body: postBody,
      },
    },
  ] as const;

  requestCases.forEach(({ alias, title, request }) => {
    it(`should return status 401 (unauthorised) when ${title}`, () => {
      cy.request(request).as(alias);
      cy.get(`@${alias}`).should((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });
});
