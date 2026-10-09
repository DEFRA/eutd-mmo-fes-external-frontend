import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, ErrorMessage, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { FormInput } from "@capgeminiuk/dcx-react-library";
import { useLoaderData, useActionData, redirect, type LoaderFunction, type ActionFunction } from "react-router";

import { route } from "routes-gen";
import { displayErrorMessagesInOrder } from "~/helpers";
import {
  getBearerTokenForRequest,
  updateProcessingStatement,
  processingStatemenGenericLoader,
  validateCSRFToken,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { ButtonGroup } from "~/composite-components";
import classNames from "classnames";
import { useIsHydrated } from "~/hooks";

type LoaderPlantDetails = {
  documentNumber: string;
  plantName?: string;
  plantApprovalNumber?: string;
  personResponsibleForConsignment?: string;
  nextUri?: string;
  csrf: string;
};

const getContinueRedirect = (isNonJs: boolean, nextUri: string, documentNumber: string | undefined) => {
  if (!isEmpty(nextUri)) {
    return nextUri;
  }

  if (isNonJs) {
    return route("/create-processing-statement/:documentNumber/add-processing-plant-address", { documentNumber });
  }

  return route("/create-processing-statement/:documentNumber/add-health-certificate", { documentNumber });
};

const saveDraftPlantData = async (
  bearerToken: string,
  documentNumber: string | undefined,
  plantData: {
    plantName?: string;
    plantApprovalNumber: string | undefined;
    personResponsibleForConsignment: string;
  },
  plantUrl: string,
  isNonJs: boolean
) => {
  const validationResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    plantData,
    plantUrl,
    undefined,
    false,
    false,
    undefined,
    isNonJs
  );

  if (!validationResponse) {
    await updateProcessingStatement(
      bearerToken,
      documentNumber,
      plantData,
      plantUrl,
      undefined,
      true,
      false,
      undefined,
      isNonJs
    );
    return;
  }

  const responseData = await (validationResponse as Response).clone().json();
  const invalidFieldNames = new Set(Object.keys(responseData?.errors ?? {}));
  const filteredData: Record<string, string | null | undefined> = { ...plantData };

  for (const invalidField of invalidFieldNames) {
    filteredData[invalidField] = null;
  }

  await updateProcessingStatement(
    bearerToken,
    documentNumber,
    filteredData,
    plantUrl,
    undefined,
    true,
    false,
    undefined,
    isNonJs
  );
};

export const loader: LoaderFunction = async ({ request, params }) =>
  await processingStatemenGenericLoader(request, params, [
    "plantName",
    "plantApprovalNumber",
    "personResponsibleForConsignment",
    "plantAddressOne",
    "plantTownCity",
    "plantPostcode",
  ]);

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);

  const form = await request.formData();
  const nextUri = form.get("nextUri") as string;
  const isNonJs = form.get("isNonJs") === "true";
  const { _action, ...values } = Object.fromEntries(form);

  const isDraft = _action === "saveAsDraft";

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const plantData = {
    plantName: values["plantName"] as string | undefined,
    plantApprovalNumber: values["plantApprovalNumber"] as string,
    personResponsibleForConsignment: values["personResponsibleForConsignment"] as string,
  };
  const plantUrl = "/create-processing-statement/:documentNumber/add-processing-plant-details";

  if (isDraft) {
    await saveDraftPlantData(bearerToken, documentNumber, plantData, plantUrl, isNonJs);

    return redirect(route("/create-processing-statement/processing-statements"));
  }

  const errorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    plantData,
    plantUrl,
    undefined,
    false,
    true,
    undefined,
    isNonJs
  );

  if (errorResponse) {
    return errorResponse as Response;
  }

  return redirect(getContinueRedirect(isNonJs, nextUri, documentNumber));
};

const AddProcessingPlantDetails = () => {
  const { t } = useTranslation(["addProcessingPlantDetails"]);
  const {
    documentNumber,
    plantName,
    plantApprovalNumber,
    personResponsibleForConsignment,
    plantAddressOne,
    plantTownCity,
    plantPostcode,
    nextUri,
    csrf,
  } = useLoaderData<LoaderPlantDetails>();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const errorKeysInOrder = ["plantName", "plantApprovalNumber", "personResponsibleForConsignment"];

  const isHydrated = useIsHydrated();

  return (
    <Main backUrl={route("/create-processing-statement/:documentNumber/add-processing-plant", { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend">
                <Title title={`${t("psAddProcessingPDAddProcessingPlantDetails")}`} />
              </legend>
              {isEmpty(plantName) ? (
                <div
                  className={
                    isEmpty(errors?.plantName) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"
                  }
                >
                  {!isEmpty(errors?.plantName) && (
                    <ErrorMessage
                      id="plantName-error"
                      text={t(errors?.plantName?.message ?? "", { ns: "errorsText" })}
                      visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                    />
                  )}
                  <FormInput
                    containerClassName="govuk-form-group govuk-!-width-two-thirds"
                    label={t("psAddProcessingPDPlantName")}
                    labelClassName="govuk-label govuk-!-font-weight-bold"
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
              ) : (
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-two-thirds">
                    <div className="govuk-!-margin-bottom-6 app-selected-address">
                      <strong>{t("psAddProcessingPlantAddressSummaryHeading", { ns: "addProcessingPlant" })}</strong>
                      <br />
                      <br />
                      <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">{plantName}</p>
                      {plantAddressOne && <p className="govuk-body govuk-!-margin-bottom-1">{plantAddressOne}</p>}
                      {plantTownCity && <p className="govuk-body govuk-!-margin-bottom-1">{plantTownCity}</p>}
                      {plantPostcode && <p className="govuk-body govuk-!-margin-bottom-1">{plantPostcode}</p>}
                      <input type="hidden" name="plantName" value={plantName} />
                    </div>
                  </div>
                </div>
              )}
              <div
                className={
                  isEmpty(errors?.plantApprovalNumber) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"
                }
              >
                {!isEmpty(errors?.plantApprovalNumber) && (
                  <ErrorMessage
                    id="plantApprovalNumber-error"
                    text={t(errors?.plantApprovalNumber?.message ?? "", { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <FormInput
                  containerClassName="govuk-form-group govuk-!-width-two-thirds"
                  label={t("psAddProcessingPDApprovalNumber")}
                  labelClassName="govuk-label govuk-!-font-weight-bold"
                  name="plantApprovalNumber"
                  type="text"
                  inputClassName={classNames("govuk-input", {
                    "govuk-input--error": errors?.plantApprovalNumber,
                  })}
                  inputProps={{
                    defaultValue: plantApprovalNumber,
                    id: "plantApprovalNumber",
                    "aria-describedby": "hint-plantApprovalNumber",
                  }}
                  hint={{
                    id: "hint-plantApprovalNumber",
                    position: "above",
                    text: t("psAddProcessingPDApprovalNumberHint"),
                    className: "govuk-hint",
                  }}
                  hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                  hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                />
              </div>
              <div
                className={
                  isEmpty(errors?.personResponsibleForConsignment)
                    ? "govuk-form-group"
                    : "govuk-form-group govuk-form-group--error"
                }
              >
                {!isEmpty(errors?.personResponsibleForConsignment) && (
                  <ErrorMessage
                    id="personResponsibleForConsignment-error"
                    text={t(errors?.personResponsibleForConsignment?.message ?? "", { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <FormInput
                  containerClassName="govuk-form-group govuk-!-width-two-thirds"
                  label={t("psAddProcessingPDPersonResponsibleForThisConsignment")}
                  labelClassName="govuk-label govuk-!-font-weight-bold"
                  name="personResponsibleForConsignment"
                  type="text"
                  inputClassName={classNames("govuk-input", {
                    "govuk-input--error": errors?.personResponsibleForConsignment,
                  })}
                  inputProps={{
                    defaultValue: personResponsibleForConsignment,
                    id: "personResponsibleForConsignment",
                    "aria-describedby": "hint-personResponsibleForConsignment",
                  }}
                  hint={{
                    id: "hint-personResponsibleForConsignment",
                    position: "above",
                    text: t("psAddProcessingPDHintTextForPersonResponsibleForThisConsignment"),
                    className: "govuk-hint",
                  }}
                  hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                  hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                />
              </div>
              <ButtonGroup />
              <input type="hidden" name="isNonJs" value={(!isHydrated).toString()} />
              <input type="hidden" name="nextUri" value={nextUri} />
            </fieldset>
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

export default AddProcessingPlantDetails;
