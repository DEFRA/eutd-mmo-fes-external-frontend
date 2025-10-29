import { rest } from "msw";
import { MOCK_ADMIN_LOGIN_DISCOVERYURI } from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";

const loginHandler: ITestHandler = {
  [TestCaseId.adminLogin]: () => [
    rest.get(MOCK_ADMIN_LOGIN_DISCOVERYURI, (req, res, ctx) =>
      res(ctx.json({ authorization_endpoint: "http://localhost:3000/auth/openid/return" }))
    ),
  ],
  [TestCaseId.idmLogin]: () => [
    rest.get("https://idm-dev-public.azure.defra.cloud/.well-known/openid-configuration", (req, res, ctx) =>
      res(ctx.json({ authorization_endpoint: "http://localhost:3000/login/return" }))
    ),
  ],
};

export default loginHandler;
