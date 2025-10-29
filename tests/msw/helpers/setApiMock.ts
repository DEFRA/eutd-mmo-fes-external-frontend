import { isTestEnv } from "~/helpers";
import type { HandlerFunction } from "~/types";
import handlers from "../handlers";
import server from "../server";
import setupDefaultMocks from "./defaultMocks";

/**
 *
 * @param requestUrl - URL containing query-string parameters "testCaseId" and "args"
 */
const setApiMock = (requestUrl: string) => {
  if (isTestEnv() && server.instance) {
    const params = new URL(requestUrl).searchParams;
    const key = params.get("testCaseId");
    const additionalArgs = params.get("args") ?? "";

    const mockFn: HandlerFunction = handlers[key];

    if (mockFn) {
      server.instance.resetHandlers();
      setupDefaultMocks();
      mockFn(...decodeURIComponent(additionalArgs).split(",")).forEach((mock) => server.instance.use(mock));
    }
  }
};

export default setApiMock;
