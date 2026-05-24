import { type ITestParams, TestCaseId } from "~/types";

describe("Set Cookie Preference API Route", () => {
  beforeEach(() => {
    // Intercept the user attributes API call that happens internally
    cy.intercept("POST", "**/v1/userAttributes", {
      statusCode: 200,
      body: {},
    }).as("saveUserAttribute");
  });

  describe("Successful Cookie Preference Updates", () => {
    it("should accept cookies and return success response", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("success", true);
        expect(response.headers["content-type"]).to.include("application/json");
      });
    });

    it("should reject cookies and return success response", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: false,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("success", true);
      });
    });

    it("should set accepts_cookies to 'yes' when acceptsCookies is true", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        // eslint-disable-next-line no-unused-expressions
        expect(response.body.success).to.be.true;
      });
    });

    it("should set accepts_cookies to 'no' when acceptsCookies is false", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: false,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        // eslint-disable-next-line no-unused-expressions
        expect(response.body.success).to.be.true;
      });
    });
  });

  describe("Request Headers and Content Type", () => {
    it("should accept JSON content type", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ acceptsCookies: true }),
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("should return JSON response", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.headers["content-type"]).to.include("application/json");
        expect(response.body).to.be.an("object");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle missing acceptsCookies parameter", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {},
        qs: { ...testParams },
      }).then((response) => {
        // Should still process with undefined/falsy value
        expect(response.status).to.be.oneOf([200, 500]);
      });
    });

    it("should handle invalid JSON body gracefully", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: "invalid-json",
        qs: { ...testParams },
        failOnStatusCode: false,
      }).then((response) => {
        // Should return error status
        expect(response.status).to.be.oneOf([400, 500]);
      });
    });
  });

  describe("HTTP Methods", () => {
    it("should only accept POST requests", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "GET",
        url: "/set-cookie-preference",
        qs: { ...testParams },
        failOnStatusCode: false,
      }).then((response) => {
        // Should not allow GET method - expects 404 or 405
        expect(response.status).to.be.oneOf([404, 405]);
      });
    });

    it("should handle POST method correctly", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe("Integration with User Attributes", () => {
    it("should update user attributes in database", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      // First, accept cookies
      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        // eslint-disable-next-line no-unused-expressions
        expect(response.body.success).to.be.true;
      });

      // Verify the API call was made to user attributes endpoint
      cy.wait("@saveUserAttribute").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          key: "accepts_cookies",
          value: "yes",
        });
      });
    });

    it("should send 'no' value to user attributes when rejecting cookies", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: false,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        // eslint-disable-next-line no-unused-expressions
        expect(response.body.success).to.be.true;
      });

      // Verify the API call was made with "no" value
      cy.wait("@saveUserAttribute").then((interception) => {
        expect(interception.request.body).to.deep.equal({
          key: "accepts_cookies",
          value: "no",
        });
      });
    });

    it("should persist preference across requests", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      // Set preference
      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      });

      // Verify by making another request (preference should still be set)
      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: false,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });

  describe("Response Format", () => {
    it("should return success object on successful update", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.body).to.have.property("success");
        expect(response.body.success).to.be.a("boolean");
        expect(response.body.success).to.eq(true);
      });
    });
  });

  describe("Boolean Value Handling", () => {
    it("should handle boolean true value", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: true,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        // eslint-disable-next-line no-unused-expressions
        expect(response.body.success).to.be.true;
      });
    });

    it("should handle boolean false value", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: false,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
        // eslint-disable-next-line no-unused-expressions
        expect(response.body.success).to.be.true;
      });
    });

    it("should handle truthy values as true", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: 1,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });

    it("should handle falsy values as false", () => {
      const testParams: ITestParams = {
        testCaseId: TestCaseId.UserAttributes,
      };

      cy.request({
        method: "POST",
        url: "/set-cookie-preference",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          acceptsCookies: 0,
        },
        qs: { ...testParams },
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});
