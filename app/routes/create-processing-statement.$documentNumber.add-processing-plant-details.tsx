import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, ErrorMessage, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { FormInput } from "@capgeminiuk/dcx-react-library";
import { useLoaderData, useActionData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { route } from "routes-gen";
import { displayErrorTransformedMessages } from "~/helpers";
import {
  getBearerTokenForRequest,
  updateProcessingStatement,
  processingStatemenGenericLoader,
  validateCSRFToken,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { ButtonGroup } from "~/composite-components";
import classNames from "classnames";

type loaderPlantDetails = {
  documentNumber: string;
  plantName?: string;
  plantApprovalNumber?: string;
  personResponsibleForConsignment?: string;
  nextUri?: string;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) =>
  processingStatemenGenericLoader(request, params, [
    "plantName",
    "plantApprovalNumber",
    "personResponsibleForConsignment",
  ]);

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);

  const form = await request.formData();
  const nextUri = form.get("nextUri") as string;
  const { _action, ...values } = Object.fromEntries(form);

  const isDraft = form.get("_action") === "saveAsDraft";
  const saveToRedisIfErrors = true;

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const errorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    {
      plantName: values["plantName"] as string,
      plantApprovalNumber: values["plantApprovalNumber"] as string,
      personResponsibleForConsignment: values["personResponsibleForConsignment"] as string,
    },
    route("/create-processing-statement/:documentNumber/add-processing-plant-details", { documentNumber }),
    undefined,
    saveToRedisIfErrors
  );

  if (errorResponse) {
    return errorResponse as Response;
  }

  if (isDraft) return redirect(route("/create-processing-statement/processing-statements"));

  return redirect(
    isEmpty(nextUri)
      ? route("/create-processing-statement/:documentNumber/add-processing-plant-address", { documentNumber })
      : nextUri
  );
};

const AddProcessingPlantDetails = () => {
  const { t } = useTranslation(["addProcessingPlantDetails"]);
  const { documentNumber, plantName, plantApprovalNumber, personResponsibleForConsignment, nextUri, csrf } =
    useLoaderData<loaderPlantDetails>();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;

  return (
    <Main
      backUrl={route("/create-processing-statement/:documentNumber/catch-added", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend">
                <Title title={`${t("psAddProcessingPDAddProcessingPlantDetails")}`} />
              </legend>
              <div className="govuk-warning-text" data-testid="warning-message">
                <span className="govuk-warning-text__icon" aria-hidden="true">
                  !
                </span>
                <strong className="govuk-warning-text__text">{t("psAddProcessingPDAlertText")} </strong>
              </div>
              <div
                className={isEmpty(errors?.plantName) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"}
              >
                {!isEmpty(errors?.plantName) && (
                  <ErrorMessage
                    id="consignmentDescription-error"
                    text={t(errors?.plantName?.message, { ns: "errorsText" })}
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
              <div
                className={
                  isEmpty(errors?.plantApprovalNumber) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"
                }
              >
                {!isEmpty(errors?.plantApprovalNumber) && (
                  <ErrorMessage
                    id="consignmentDescription-error"
                    text={t(errors?.plantApprovalNumber?.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <FormInput
                  containerClassName="govuk-form-group govuk-!-width-two-thirds"
                  label={t("psAddProcessingPDPlantApprovalNumber")}
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
                    text: t("psAddProcessingPDHintTextForPlantApprovalNumber"),
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
                    id="consignmentDescription-error"
                    text={t(errors?.personResponsibleForConsignment?.message, { ns: "errorsText" })}
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
              <ButtonGroup saveButtonLabel={t("psAddProcessingPDSaveButtonLabel")} />
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
