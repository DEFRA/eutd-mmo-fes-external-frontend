import { buildSearchRequestHeaders, hasApimHeaderConfig } from "~/helpers/approvedFoodEstablishmentsHeaders";

describe("approvedFoodEstablishmentsHeaders", () => {
  describe("hasApimHeaderConfig", () => {
    it("returns false when header name is empty", () => {
      expect(hasApimHeaderConfig("", "local-dev-functions-key")).to.equal(false);
    });

    it("returns false when header value is empty", () => {
      expect(hasApimHeaderConfig("x-functions-key", "")).to.equal(false);
    });

    it("returns true when header name and value are both set", () => {
      expect(hasApimHeaderConfig("x-functions-key", "local-dev-functions-key")).to.equal(true);
    });
  });

  describe("buildSearchRequestHeaders", () => {
    it("omits the APIM header when name/value are empty", () => {
      const headers = buildSearchRequestHeaders("token-123", "", "");

      expect(headers).to.deep.equal({
        Authorization: "Bearer token-123",
      });
    });

    it("includes the APIM header when name/value are both configured", () => {
      const headers = buildSearchRequestHeaders("token-123", "x-functions-key", "local-dev-functions-key");

      expect(headers).to.deep.equal({
        Authorization: "Bearer token-123",
        "x-functions-key": "local-dev-functions-key",
      });
    });
  });
});
