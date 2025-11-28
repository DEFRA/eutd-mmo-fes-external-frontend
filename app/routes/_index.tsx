import * as React from "react";
import { analyticsAcceptedCookie } from "~/cookies.server";
import type { UserAttribute, IError } from "~/types";
import {
  createCSRFToken,
  getAllUserAttributes,
  getBearerTokenForRequest,
  isAcceptedCookies,
  journeySelectionSubmission,
  validateCSRFToken,
} from "~/.server";
import { route } from "routes-gen";
import { type ActionFunction, type LoaderFunction, redirect } from "@remix-run/node";
import { apiCallFailed, json } from "~/communication.server";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import { Main, SecureForm } from "~/components";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getSessionFromRequest } from "~/sessions.server";
import { useLoaderData } from "@remix-run/react";

/* istanbul ignore next */
export const loader: LoaderFunction = async ({ request }) => {
  // All this loader function does is set up API mocking for tests
  //   so the entire function is annotated with "ignore next"
  // If the loader is required to return actual data, move the above
  //   "ignore next" annotation down to just above setApiMock()
  //   and return a proper Response
  setApiMock(request.url);
  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  const url = new URL(request.url);
  const loggedIn = url.searchParams.get("loggedIn");

  if (loggedIn !== "yes") {
    await getBearerTokenForRequest(request);
  }

  return json({ csrf }, session);
};

export const action: ActionFunction = async ({ request }) => {
  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);

  const form = await request.formData();
  const journeySelection = form.get("journeySelection") as string;

  const response: {
    journeySelection?: string;
    errors?: IError[];
  } = await journeySelectionSubmission(bearerToken, journeySelection);

  const userAttributes: UserAttribute[] = await getAllUserAttributes(bearerToken);
  const hasAcceptedCookies = isAcceptedCookies(userAttributes);
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  if (!response.errors && response.journeySelection) {
    switch (response.journeySelection) {
      case "catchCertificate":
        return redirect(route("/create-catch-certificate/catch-certificates"), {
          headers: { "Set-Cookie": await analyticsAcceptedCookie.serialize({ analyticsAccepted: hasAcceptedCookies }) },
        });
      case "processingStatement":
        return redirect(route("/create-processing-statement/processing-statements"), {
          headers: { "Set-Cookie": await analyticsAcceptedCookie.serialize({ analyticsAccepted: hasAcceptedCookies }) },
        });
      case "storageNotes":
        return redirect(route("/create-storage-document/storage-documents"), {
          headers: { "Set-Cookie": await analyticsAcceptedCookie.serialize({ analyticsAccepted: hasAcceptedCookies }) },
        });
    }
  }

  if (Array.isArray(response.errors) && response.errors.length > 0) {
    return apiCallFailed(response.errors);
  }

  return redirect(route("/"));
};

const Home = () => {
  const { t } = useTranslation(["journeySelection", "common"]);
  const { csrf } = useLoaderData<{ csrf: string }>();

  return (
    <Main showHelpLink={false}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm reloadDocument method="post" csrf={csrf}>
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend govuk-!-margin-bottom-0">
                <h1 className="govuk-heading-xl">{t("commonHomePageWhatDoYouWant")}</h1>
              </legend>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="createCatchCertificate"
                  name="journeySelection"
                  type="radio"
                  value="catchCertificate"
                  defaultChecked={true}
                />
                <label
                  id="label-createCatchCertificate"
                  className="govuk-label govuk-radios__label"
                  htmlFor="createCatchCertificate"
                >
                  {t("commonDashboardCreateAUkCatchCertificate")}
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="createProcessingStatement"
                  name="journeySelection"
                  type="radio"
                  value="processingStatement"
                />
                <label
                  id="label-createProcessingStatement"
                  className="govuk-label govuk-radios__label"
                  htmlFor="createProcessingStatement"
                >
                  {t("processingStatementRendererHeaderSectionTitle")}
                </label>
              </div>
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id="createStorageDocument"
                  name="journeySelection"
                  type="radio"
                  value="storageNotes"
                />
                <label
                  id="label-createStorageDocument"
                  className="govuk-label govuk-radios__label"
                  htmlFor="createStorageDocument"
                >
                  {t("commonDashboardCreateaUkStorageDocument")}
                </label>
              </div>
            </fieldset>
            <br />
            <Button
              label={t("commonContinueButtonContinueButtonText", { ns: "common" })}
              type={BUTTON_TYPE.SUBMIT}
              className="govuk-button"
              id="continue"
              data-testid="continue"
              data-module="govuk-button"
            />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};

export default Home;
