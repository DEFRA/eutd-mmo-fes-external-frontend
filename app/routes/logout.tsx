import { type LoaderFunction } from "react-router";
import setApiMock from "tests/msw/helpers/setApiMock";
import { logout } from "~/.server";

export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  return await logout(request);
};
