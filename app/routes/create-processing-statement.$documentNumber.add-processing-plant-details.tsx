import * as React from "react";
import {
  Main,
  Title,
  BackToProgressLink,
  ErrorSummary,
  ErrorMessage,
  SecureForm,
  AutocompleteFormField,
} from "~/components";
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
  getProcessingPlants,
  matchEstablishment,
  mapEstablishmentToPlantAddress,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { ButtonGroup } from "~/composite-components";
import classNames from "classnames";
import { useIsHydrated } from "~/hooks";
import { apiCallFailed } from "~/communication.server";
import type { Establishment, IError } from "~/types";

type LoaderPlantDetails = {
  documentNumber: string;
  plantName?: string;
  plantApprovalNumber?: string;
  personResponsibleForConsignment?: string;
  nextUri?: string;
  csrf: string;
  establishments: Establishment[];
};

const parseEstablishmentLabel = (value: string): { plantName: string; plantApprovalNumber: string } => {
  const trimmed = value.trim();
  const match = /^(.*) \(([^)]*)\)$/.exec(trimmed);

  if (!match) {
    return { plantName: "", plantApprovalNumber: "" };
  }

  return {
    plantName: match[1].trim(),
    plantApprovalNumber: match[2].trim(),
  };
};

const getSubmittedPlantValues = (isNonJs: boolean, values: Record<string, FormDataEntryValue>) => {
  const parsedProcessingPlant = parseEstablishmentLabel((values["processingPlant"] as string) ?? "");
  return {
    plantName: isNonJs ? (values["plantName"] as string) ?? "" : parsedProcessingPlant.plantName,
    plantApprovalNumber: isNonJs
      ? (values["plantApprovalNumber"] as string) ?? ""
      : parsedProcessingPlant.plantApprovalNumber,
  };
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
    plantName: string | undefined;
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

export const loader: LoaderFunction = async ({ request, params }) => {
  const [genericLoaderResponse, establishments] = await Promise.all([
    processingStatemenGenericLoader(request, params, [
      "plantName",
      "plantApprovalNumber",
      "personResponsibleForConsignment",
    ]),
    getProcessingPlants(),
  ]);

  const contentType = genericLoaderResponse.headers.get("Content-Type") ?? "";
  if (genericLoaderResponse.status !== 200 || !contentType.includes("application/json")) {
    return genericLoaderResponse;
  }

  const loaderData = (await genericLoaderResponse.clone().json()) as Omit<LoaderPlantDetails, "establishments">;

  return new Response(
    JSON.stringify({
      ...loaderData,
      establishments,
    }),
    {
      status: 200,
      headers: new Headers(genericLoaderResponse.headers),
    }
  );
};

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

  const { plantName, plantApprovalNumber } = getSubmittedPlantValues(isNonJs, values);

  const establishments = await getProcessingPlants();
  const matchedEstablishment = matchEstablishment(establishments, plantName, plantApprovalNumber);

  if (!matchedEstablishment) {
    const errors: IError[] = [
      { key: "plantName", message: "psAddProcessingPDErrorInvalidPlantName" },
      { key: "plantApprovalNumber", message: "psAddProcessingPDErrorInvalidPlantApprovalNumber" },
    ];

    return (await apiCallFailed(errors, values)) as Response;
  }

  const mappedAddress = mapEstablishmentToPlantAddress(matchedEstablishment);
  const plantData = {
    plantName: matchedEstablishment.tradingName,
    plantApprovalNumber: matchedEstablishment.approvalNumber?.content,
    personResponsibleForConsignment: values["personResponsibleForConsignment"] as string,
  };
  const plantAddressData = {
    plantAddressOne: mappedAddress.plantAddressOne,
    plantTownCity: mappedAddress.plantTownCity,
    plantPostcode: mappedAddress.plantPostcode,
    plantCountry: mappedAddress.plantCountry,
  };
  const plantUrl = "/create-processing-statement/:documentNumber/add-processing-plant-details";
  const plantAddressUrl = "/create-processing-statement/:documentNumber/add-processing-plant-address";

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

  const plantAddressErrorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    plantAddressData,
    plantAddressUrl,
    undefined,
    false,
    true,
    undefined,
    isNonJs
  );

  if (plantAddressErrorResponse) {
    return plantAddressErrorResponse as Response;
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
    establishments,
    nextUri,
    csrf,
  } = useLoaderData<LoaderPlantDetails>();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const errorKeysInOrder = ["plantName", "plantApprovalNumber", "personResponsibleForConsignment"];

  const isHydrated = useIsHydrated();
  const hasPlantErrors = errors?.plantName !== undefined || errors?.plantApprovalNumber !== undefined;
  const processingPlantSelection = plantName && plantApprovalNumber ? `${plantName} (${plantApprovalNumber})` : "";

  const processingPlantOptions = establishments
    .filter((establishment) => establishment.tradingName && establishment.approvalNumber?.content)
    .map((establishment) => `${establishment.tradingName} (${establishment.approvalNumber?.content})`);

  return (
    <Main backUrl={route("/create-processing-statement/:documentNumber/catch-added", { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend">
                <Title title={`${t("psAddProcessingPDAddProcessingPlantDetails")}`} />
              </legend>
              <div className="govuk-warning-text" data-testid="warning-message" role="note">
                <span className="govuk-warning-text__icon" aria-hidden="true">
                  !
                </span>
                <strong className="govuk-warning-text__text">
                  <span className="govuk-warning-text__assistive govuk-visually-hidden">
                    {t("commonWarning", { ns: "common" })}
                  </span>
                  {t("psAddProcessingPDAlertText")}
                </strong>
              </div>

              <AutocompleteFormField
                id="processingPlant"
                name="processingPlant"
                options={processingPlantOptions}
                optionsId="processing-plant-option"
                errorMessageText={
                  !isEmpty(errors?.plantName)
                    ? t(errors?.plantName?.message ?? "", { ns: "errorsText" })
                    : t(errors?.plantApprovalNumber?.message ?? "", { ns: "errorsText" })
                }
                defaultValue={processingPlantSelection}
                labelText={isHydrated ? t("psAddProcessingPDEstablishment") : undefined}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                hintText={isHydrated ? t("psAddProcessingPDEstablishmentHint") : undefined}
                containerClassName={classNames("govuk-form-group", {
                  "govuk-form-group--error": hasPlantErrors,
                })}
                selectProps={{
                  selectClassName: classNames("govuk-select govuk-!-width-two-thirds", {
                    "govuk-select--error": hasPlantErrors,
                  }),
                }}
                inputProps={{
                  id: "processingPlant",
                  className: classNames("govuk-input govuk-!-width-two-thirds", {
                    "govuk-input--error": hasPlantErrors,
                  }),
                }}
                customNonJSComp={
                  isHydrated ? undefined : (
                    <>
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
                      {!isEmpty(errors?.plantApprovalNumber) && (
                        <ErrorMessage
                          id="plantApprovalNumber-error"
                          text={t(errors?.plantApprovalNumber?.message ?? "", { ns: "errorsText" })}
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
                    </>
                  )
                }
              />

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
