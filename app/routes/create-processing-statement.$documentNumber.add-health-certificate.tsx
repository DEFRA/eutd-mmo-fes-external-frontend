import * as React from "react";
import { useLoaderData, useActionData, redirect, type LoaderFunction, type ActionFunction } from "react-router";

import { useTranslation } from "react-i18next";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ErrorPosition, FormInput } from "@capgeminiuk/dcx-react-library";
import { DateFieldWithPicker, ButtonGroup } from "~/composite-components";
import { route } from "routes-gen";
import classNames from "classnames/bind";
import isEmpty from "lodash/isEmpty";
import {
  getBearerTokenForRequest,
  updateProcessingStatement,
  processingStatemenGenericLoader,
  validateCSRFToken,
} from "~/.server";
import { displayErrorMessages, getStrOrDefault, isValidDate, getTransformedError } from "~/helpers";
import type { IErrorsTransformed } from "~/types";

export const loader: LoaderFunction = async ({ request, params }) =>
  processingStatemenGenericLoader(request, params, ["healthCertificateNumber", "healthCertificateDate"]);

const handleSaveAsDraft = async (
  bearerToken: string,
  documentNumber: string | undefined,
  healthCertData: { healthCertificateNumber: string; healthCertificateDate: string },
  healthCertUrl: string
): Promise<Response> => {
  const validationResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    healthCertData,
    healthCertUrl,
    undefined,
    false
  );

  if (validationResponse) {
    const responseData = await (validationResponse as Response).clone().json();
    const errorKeys: string[] = responseData?.errors ? Object.keys(responseData.errors) : [];
    const invalidFieldNames = new Set(errorKeys);
    const filteredData: Record<string, string | null> = { ...healthCertData };
    for (const invalidField of invalidFieldNames) {
      filteredData[invalidField] = null;
    }
    await updateProcessingStatement(bearerToken, documentNumber, filteredData, healthCertUrl, undefined, true);
  } else {
    await updateProcessingStatement(bearerToken, documentNumber, healthCertData, healthCertUrl, undefined, true);
  }

  return redirect(route("/create-processing-statement/processing-statements"));
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);

  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const nextUri = form.get("nextUri") as string;
  const isDraft = form.get("_action") === "saveAsDraft";

  const isValid = await validateCSRFToken(request, form);
  if (isValid === false) return redirect("/forbidden");

  const healthCertificateDateYear = values["healthCertificateDateYear"] as string;
  const healthCertificateDateMonth = values["healthCertificateDateMonth"] as string;
  const healthCertificateDateDay = values["healthCertificateDateDay"] as string;
  const isoHealthCertificateDate = `${healthCertificateDateYear}-${healthCertificateDateMonth}-${healthCertificateDateDay}`;
  const hasFullHealthCertificateDate =
    !!healthCertificateDateYear && !!healthCertificateDateMonth && !!healthCertificateDateDay;
  const healthCertificateDateIsValid = isValidDate(isoHealthCertificateDate, ["YYYY-M-D", "YYYY-MM-DD"]);
  if (hasFullHealthCertificateDate && healthCertificateDateIsValid === false) {
    return new Response(
      JSON.stringify({
        errors: getTransformedError([
          {
            key: "healthCertificateDate",
            message: "psAddHealthCertificateErrorRealDateHealthCertificateDate",
          },
        ]),
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const healthCertData = {
    healthCertificateNumber: values["healthCertificateNumber"] as string,
    healthCertificateDate: `${getStrOrDefault(values["healthCertificateDateDay"] as string)}/${getStrOrDefault(values["healthCertificateDateMonth"] as string)}/${getStrOrDefault(values["healthCertificateDateYear"] as string)}`,
  };
  const healthCertUrl = route("/create-processing-statement/:documentNumber/add-health-certificate", {
    documentNumber,
  });

  if (isDraft) {
    return handleSaveAsDraft(bearerToken, documentNumber, healthCertData, healthCertUrl);
  }

  const errorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    healthCertData,
    healthCertUrl,
    undefined,
    false // saveToRedisIfErrors = false
  );

  if (errorResponse) {
    return errorResponse as Response;
  }

  return redirect(
    isEmpty(nextUri)
      ? route("/create-processing-statement/:documentNumber/what-export-destination", { documentNumber })
      : nextUri
  );
};

const AddHealthCertificate = () => {
  const { t } = useTranslation(["common"]);
  const {
    documentNumber,
    healthCertificateNumber,
    healthCertificateDate = "",
    nextUri,
    csrf,
  } = useLoaderData<{
    documentNumber: string;
    healthCertificateNumber: string;
    healthCertificateDate: string;
    nextUri?: string;
    csrf: string;
  }>();

  const { errors = {} } = useActionData<{ errors: IErrorsTransformed }>() ?? {};
  const hasErrors = !isEmpty(errors);
  const hasHealthCertificateNumberError = !isEmpty(errors?.healthCertificateNumber);
  const [daySelected = "", monthSelected = "", yearSelected = ""] =
    healthCertificateDate === null ? " " : healthCertificateDate.split("/");

  return (
    <Main
      backUrl={route("/create-processing-statement/:documentNumber/add-processing-plant-address", { documentNumber })}
    >
      {hasErrors && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title
            title={t("psAddHealthCertificateHeader", {
              ns: "addHealthCertificate",
            })}
          />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <SecureForm method="post" csrf={csrf}>
            <div
              className={
                hasHealthCertificateNumberError ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"
              }
            >
              <FormInput
                containerClassName="govuk-form-group"
                label={t("psAddHealthCertificateHealthCertificateNumber", {
                  ns: "addHealthCertificate",
                })}
                labelClassName={classNames("govuk-label")}
                name="healthCertificateNumber"
                type="text"
                inputClassName={classNames("govuk-input", {
                  "govuk-input--error": errors?.healthCertificateNumber,
                })}
                hint={{
                  id: "hint-healthCertificateNumber",
                  position: "above",
                  text: t("psAddHealthCertificateHealthCertificateNumberHint", {
                    ns: "addHealthCertificate",
                  }),
                  className: "govuk-hint",
                }}
                inputProps={{
                  defaultValue: healthCertificateNumber,
                  id: "healthCertificateNumber",
                  "aria-describedby": "hint-healthCertificateNumber",
                }}
                errorProps={{ className: hasHealthCertificateNumberError ? "govuk-error-message" : "" }}
                staticErrorMessage={t(errors?.healthCertificateNumber?.message, { ns: "errorsText" })}
                errorPosition={ErrorPosition.AFTER_HINT}
                containerClassNameError={hasHealthCertificateNumberError ? "govuk-form-group--error" : ""}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
            </div>
            <DateFieldWithPicker
              id="healthCertificateDate"
              name="healthCertificateDate"
              getDateSelected={() => {}}
              dateSelected={yearSelected + "-" + monthSelected + "-" + daySelected}
              errors={errors?.healthCertificateDate}
              hideAddDateButton={true}
              label="psAddHealthCertificateHealthCertificateDateLabel"
              labelStyle="label"
              translationNs="addHealthCertificate"
              hintText="psAddHealthCertificateDateFieldHint"
            />
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

export default AddHealthCertificate;
