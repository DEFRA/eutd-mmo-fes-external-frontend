/* istanbul ignore file */
import { type LoaderFunction } from "react-router";
import setApiMock from "tests/msw/helpers/setApiMock";
import { logout } from "~/.server";

/* istanbul ignore next */
export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  /* istanbul ignore next */
  return await logout(request);
};
