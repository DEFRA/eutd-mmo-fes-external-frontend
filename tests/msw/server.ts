/* eslint-disable no-console */
import { setupServer } from "msw/node";
import { isTestEnv } from "~/helpers";

const createServer = () => {
  let server;

  if (isTestEnv()) {
    server = setupServer();

    // TIP: Temporarily change to "error" to quickly see which tests are making real API calls
    //   as these tests will fail when set to "error"; Once identified, fix those tests to ensure
    //   all API calls are mocked
    server.listen({ onUnhandledRequest: "error" });

    console.info("Started API mocks...");

    const stopServer = () => {
      server.close();
      console.info("Stopped API mocks");
    };

    process.once("SIGINT", stopServer);
    process.once("SIGTERM", stopServer);
  }

  return server;
};

const server = { instance: createServer() };

export default server;
