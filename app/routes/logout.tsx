import { type LoaderFunction } from "@remix-run/node";
import setApiMock from "tests/msw/helpers/setApiMock";
import { logout } from "~/.server";

export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  return await logout(request);
};
