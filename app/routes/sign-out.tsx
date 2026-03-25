import * as React from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { type LoaderFunction, type ActionFunction, redirect } from "react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import setApiMock from "tests/msw/helpers/setApiMock";
import { Main, SecureForm, Title } from "~/components";
import { getEnv } from "~/env.server";
import { route } from "routes-gen";
import { BUTTON_TYPE, Button } from "@capgeminiuk/dcx-react-library";
import { createCSRFToken, validateCSRFToken } from "~/.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";

type signOutLoaderData = {
  warningTime: number;
  secondInMilliseconds: number;
  csrf: string;
  minuteInMilliseconds: number;
};

export const loader: LoaderFunction = async ({ request }) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const ENV = getEnv();

  const warningTime: number = Number.parseInt(ENV.WARNING_T0_TIME_OUT_IN_MILLISECONDS, 10);
  const minuteInMilliseconds = 60000;
  const secondInMilliseconds = 1000;
  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  return new Response(
    JSON.stringify({
      warningTime,
      secondInMilliseconds,
      csrf,
      minuteInMilliseconds,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const action: ActionFunction = async ({ request }) => {
  const ENV = getEnv();
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  throw redirect(ENV.IDENTITY_APPDOMAIN);
};

const SignOut = () => {
  const { warningTime, minuteInMilliseconds, secondInMilliseconds, csrf } = useLoaderData<signOutLoaderData>();
  const { t } = useTranslation(["signOut", "common"]);
  const navigate = useNavigate();
  const [idleTime, setIdleTime] = useState<number>(warningTime);

  let timer: NodeJS.Timeout;

  useEffect(() => {
    timer = setInterval(() => {
      setIdleTime((previousIdleTime: number) => (previousIdleTime > 0 ? previousIdleTime - secondInMilliseconds : 0));
    }, secondInMilliseconds);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const warningTimeToDisplay =
    idleTime > minuteInMilliseconds
      ? `${Math.ceil(idleTime / minuteInMilliseconds)} ${t("signOutMinutes")}`
      : `${idleTime / secondInMilliseconds} ${t("signOutSeconds")}`;

  useEffect(() => {
    if (idleTime === 0) {
      navigate(route("/logout"));
    }
  }, [idleTime]);

  return (
    <Main showHelpLink={false}>
      <Title title={t("signOutPageTitle")} />
      <p>{t("signOutWarningMessage", { warningTimeToDisplay })}</p>
      <SecureForm method="post" csrf={csrf}>
        <Button
          id="continue"
          label={t("commonContinueButtonContinueButtonText", { ns: "common" })}
          className="govuk-button"
          type={BUTTON_TYPE.SUBMIT}
          data-module="govuk-button"
          name="_action"
          value="continue"
          data-testid="continue"
        />
      </SecureForm>
    </Main>
  );
};

export default SignOut;
