import { type LoaderFunction } from "@remix-run/node";
import { isProdEnv } from "../helpers";

interface ExtendedNodeJSGlobal extends NodeJS.Global {
  __coverage__: {};
}

declare const global: ExtendedNodeJSGlobal;

export const loader: LoaderFunction = async () => {
  if (!isProdEnv() && global.__coverage__) {
    return new Response(JSON.stringify({ coverage: global.__coverage__ }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    return new Response(null, {
      statusText: "Not Found",
      status: 404,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
