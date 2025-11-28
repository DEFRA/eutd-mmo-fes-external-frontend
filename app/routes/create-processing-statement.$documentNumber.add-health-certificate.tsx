import * as React from "react";
import { useLoaderData, useActionData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
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
import { displayErrorMessages, getStrOrDefault } from "~/helpers";
import type { IErrorsTransformed } from "~/types";

export const loader: LoaderFunction = async ({ request, params }) =>
  processingStatemenGenericLoader(request, params, ["healthCertificateNumber", "healthCertificateDate"]);

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);

  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const nextUri = form.get("nextUri") as string;
  const isDraft = form.get("_action") === "saveAsDraft";
  const saveToRedisIfErrors = true;

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const errorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    {
      healthCertificateNumber: values["healthCertificateNumber"] as string,
      healthCertificateDate: `${getStrOrDefault(values["healthCertificateDateDay"] as string)}/${getStrOrDefault(values["healthCertificateDateMonth"] as string)}/${getStrOrDefault(values["healthCertificateDateYear"] as string)}`,
    },
    route("/create-processing-statement/:documentNumber/add-health-certificate", { documentNumber }),
    undefined,
    saveToRedisIfErrors
  );

  if (isDraft) return redirect(route("/create-processing-statement/processing-statements"));

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
  const [daySelected = "", monthSelected = "", yearSelected = ""] =
    healthCertificateDate === null ? " " : healthCertificateDate.split("/");

  return (
    <Main
      backUrl={route("/create-processing-statement/:documentNumber/add-processing-plant-address", { documentNumber })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
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
                isEmpty(errors?.healthCertificateNumber)
                  ? "govuk-form-group"
                  : "govuk-form-group govuk-form-group--error"
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
                errorProps={{ className: !isEmpty(errors?.healthCertificateNumber) ? "govuk-error-message" : "" }}
                staticErrorMessage={t(errors?.healthCertificateNumber?.message, { ns: "errorsText" })}
                errorPosition={ErrorPosition.AFTER_HINT}
                containerClassNameError={!isEmpty(errors?.healthCertificateNumber) ? "govuk-form-group--error" : ""}
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
