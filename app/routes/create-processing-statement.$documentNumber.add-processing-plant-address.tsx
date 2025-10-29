import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, ErrorMessage, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE, FormInput } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { route } from "routes-gen";
import {
  getBearerTokenForRequest,
  updateProcessingStatement,
  processingStatemenGenericLoader,
  validateCSRFToken,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { displayErrorTransformedMessages } from "~/helpers";
import { ButtonGroup } from "~/composite-components";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import classNames from "classnames/bind";
import type { ErrorResponse } from "~/types";

type loaderPlantAddress = {
  documentNumber: string;
  plantAddressOne?: string;
  plantBuildingNumber?: string;
  plantSubBuildingName?: string;
  plantBuildingName?: string;
  plantStreetName?: string;
  plantCounty?: string;
  plantCountry?: string;
  plantTownCity?: string;
  plantPostcode: string;
  plantName?: string;
  nextUri?: string;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) =>
  processingStatemenGenericLoader(request, params, ["plantAddressOne", "plantTownCity", "plantPostcode", "plantName"]);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const form = await request.formData();
  const nextUri = form.get("nextUri") as string;
  const { _action, ...values } = Object.fromEntries(form);

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  if (form.get("_action") === "goToAddAddress") {
    session.set("plantName", values["plantName"]);
    session.unset("currentStep");
    session.unset("postcode");

    return redirect(
      route("/create-processing-statement/:documentNumber/what-processing-plant-address", {
        documentNumber,
      }),
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  const isDraft = form.get("_action") === "saveAsDraft";
  const saveToRedisIfErrors = true;

  const errorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    { plantName: values["plantName"] as string },
    route("/create-processing-statement/:documentNumber/add-processing-plant-address", { documentNumber }),
    undefined,
    saveToRedisIfErrors
  );

  if (isDraft) {
    session.unset("plantName");
    return redirect(route("/create-processing-statement/processing-statements"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  if (errorResponse) {
    return errorResponse;
  }

  session.unset("plantName");

  return redirect(
    isEmpty(nextUri)
      ? route("/create-processing-statement/:documentNumber/add-health-certificate", { documentNumber })
      : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const AddProcessingPlantAddress = () => {
  const { t } = useTranslation(["addProcessingPlantAddress", "common"]);
  const { documentNumber, plantAddressOne, plantTownCity, plantPostcode, plantName, nextUri, csrf } =
    useLoaderData<loaderPlantAddress>();
  const actionData = useActionData<{ errors: any }>() ?? {};

  const { errors = {} } = actionData;
  const hasAddress = !isEmpty(plantAddressOne) && !isEmpty(plantPostcode);
  return (
    <Main
      backUrl={route("/create-processing-statement/:documentNumber/add-processing-plant-details", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={`${t("psAddProcessingPlantAddressDetailsAddressText")}`} />
          <SecureForm method="post" csrf={csrf}>
            <div
              className={isEmpty(errors?.plantName) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"}
            >
              {!isEmpty(errors?.plantName) ? (
                <ErrorMessage
                  id="plant-name-error"
                  text={t(errors?.plantName?.message, { ns: "errorsText" })}
                  visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                />
              ) : null}
              <FormInput
                containerClassName="govuk-form-group govuk-!-width-two-thirds"
                label={t("psAddProcessingPlantAddressDetailsPlantNameText")}
                name="plantName"
                type="text"
                inputClassName={classNames("govuk-input", {
                  "govuk-input--error": errors?.plantName,
                })}
                inputProps={{
                  defaultValue: plantName,
                  id: "plantName",
                }}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
            </div>
            {hasAddress ? (
              <p>
                {plantAddressOne}
                <br />
                {plantTownCity}
                <br />
                {plantPostcode}
              </p>
            ) : (
              <p>{t("psAddProcessingPlantAddressDetailsAnAddressMustBeAddedForThisProcessingPlant")}</p>
            )}
            <br />
            <div className="govuk-button-group">
              <Button
                id="goToAddAddress"
                label={
                  hasAddress
                    ? t("commonWhatExportersAddressChangeLink", { ns: "common" })
                    : t("psAddProcessingPlantAddressDetailsAddressText")
                }
                className="govuk-button govuk-button--secondary"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                //@ts-ignore
                value="goToAddAddress"
                data-testid="goToAddAddress-button"
              />
            </div>
            <br />
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-processing-statement/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default AddProcessingPlantAddress;
