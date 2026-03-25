import * as React from "react";
import { Main, SecureForm } from "~/components";
import { PrivacyNotice } from "~/composite-components";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData, type ActionFunction, type LoaderFunction } from "react-router";

import { useIsHydrated } from "~/hooks";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { PrivacyNoticeAction, PrivacyNoticeLoader } from "~/models";

export const loader: LoaderFunction = async ({ request, params }) => await PrivacyNoticeLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  await PrivacyNoticeAction(request, params);

const Privacy = () => {
  const actionData = useActionData() ?? {};
  const isHydrated = useIsHydrated();
  const csrf = useLoaderData<{ csrf: string }>().csrf;

  useEffect(() => {
    if (!isEmpty(actionData)) {
      globalThis.location.href = actionData;
    }
  });

  const { t } = useTranslation(["privacyNotice"]);

  return (
    <Main showHelpLink={false}>
      <a href="/" className="govuk-back-link govuk-!-margin-top-0 govuk-!-margin-bottom-10">
        {t("commonBackLinkBackButtonLabel", { ns: "common" })}
      </a>
      <SecureForm method="post" csrf={csrf}>
        <PrivacyNotice />
        <Button
          id="acceptAndContinue"
          label={t("acceptButtonText")}
          className="govuk-button"
          type={BUTTON_TYPE.SUBMIT}
          data-module="govuk-button"
          name="_action"
          // @ts-ignore
          value="continue"
          data-testid="acceptandcontinue"
        />
        <input type="hidden" name="jsenable" value={isHydrated ? "true" : "false"} />
      </SecureForm>
    </Main>
  );
};

export default Privacy;
