import { redirect, type LoaderFunction } from "@remix-run/node";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getEnv } from "~/env.server";
import { getClient } from "~/.server";

const ENV = getEnv();
const redirectUri = "/auth/openid/returnUri";
const REDIRECT_URL = `${ENV.IDENTITY_APPDOMAIN}${redirectUri}`;

export const loader: LoaderFunction = async ({ request }) => {
  setApiMock(request.url);

  const clientId = ENV.AAD_CLIENTID;
  const clientSecret = ENV.AAD_CLIENTSECRET;
  const tenantId = ENV.AAD_TENANTID;
  const discoveryUri = `https://login.microsoftonline.com/${tenantId}/.well-known/openid-configuration`;

  const cl = await getClient(clientId, clientSecret, discoveryUri);
  const redirectTo = cl.authorizationUrl({
    redirect_uri: REDIRECT_URL,
    scope: "openid",
    response_mode: "form_post",
  });

  return redirect(redirectTo);
};
