import { rest } from "msw";
import { TestCaseId, type ITestHandler } from "~/types";
import { mockEuCatchStatus } from "~/urls.server";

// Mock response matching actual API structure
const euDataIntegrationSuccessResponse = {
  reference: "CATCH.CC.GB.2025.0000083",
  status: "SUCCESS",
};

const euDataIntegrationHandler: ITestHandler = {
  [TestCaseId.EuDataIntegrationSuccessful]: () => [
    rest.get(mockEuCatchStatus, (req, res, ctx) => res(ctx.json(euDataIntegrationSuccessResponse))),
  ],
  [TestCaseId.EuDataIntegrationUnauthorised]: () => [
    rest.get(mockEuCatchStatus, (req, res, ctx) => res(ctx.status(403), ctx.json({ unauthorised: true }))),
  ],
};

export default euDataIntegrationHandler;
