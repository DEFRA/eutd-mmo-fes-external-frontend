import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE, ErrorPosition, FormInput } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData, redirect, type LoaderFunction, type ActionFunction } from "react-router";

import { route } from "routes-gen";
import type { StorageDocument, IUnauthorised, IErrorsTransformed } from "~/types";
import {
  getBearerTokenForRequest,
  validateResponseData,
  instanceOfUnauthorised,
  getStorageDocument,
  updateStorageDocumentFacility,
  createCSRFToken,
  validateCSRFToken,
  nonJsDateValidation,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import {
  displayErrorTransformedMessages,
  getErrorMessage,
  getStrOrDefault,
  getTransformedError,
  toISODateFormat,
  toDDMMYYYYFormat,
} from "~/helpers";
import setApiMock from "tests/msw/helpers/setApiMock";
import { DateFieldWithPicker } from "~/composite-components";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import classNames from "classnames";
import { useScrollOnPageError } from "~/hooks";
import i18next from "~/i18next.server";
import type { Session } from "@remix-run/node";
import type { TFunction } from "i18next";

type loaderStorageFacility = {
  documentNumber: string;
  facilityName: string;
  facilityAddressOne?: string;
  facilityTownCity?: string;
  facilityPostcode?: string;
  nextUri?: string;
  hasFacility?: boolean;
  csrf: string;
  selectedArrivalDate: string;
  backUrl: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  if (instanceOfUnauthorised(storageDocument)) {
    return redirect("/forbidden");
  }

  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);

  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  validateResponseData(storageDocument);

  const hasFacility =
    storageDocument?.facilityAddressOne !== undefined && storageDocument?.facilityPostcode !== undefined;

  const getBackUrl = () => {
    // Prefer an explicit arrivalVehicle query param (set by the transport save redirect)
    // so we can determine the correct back link immediately after redirect.
    const url = new URL(request.url);
    const arrivalVehicleParam = url.searchParams.get("arrivalVehicle");

    const arrivalVehicle = arrivalVehicleParam ?? storageDocument?.arrivalTransport?.vehicle;

    if (!arrivalVehicle) {
      return route("/create-non-manipulation-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk", {
        documentNumber,
      });
    }

    const arrivalTransportRoutes: Record<string, string> = {
      truck: route("/create-non-manipulation-document/:documentNumber/add-arrival-transportation-details-truck", {
        documentNumber,
      }),
      train: route("/create-non-manipulation-document/:documentNumber/add-arrival-transportation-details-train", {
        documentNumber,
      }),
      plane: route("/create-non-manipulation-document/:documentNumber/add-arrival-transportation-details-plane", {
        documentNumber,
      }),
      containerVessel: route(
        "/create-non-manipulation-document/:documentNumber/add-arrival-transportation-details-container-vessel",
        {
          documentNumber,
        }
      ),
    };

    return (
      arrivalTransportRoutes[arrivalVehicle] ??
      route("/create-non-manipulation-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk", {
        documentNumber,
      })
    );
  };

  return new Response(
    JSON.stringify({
      documentNumber,
      facilityAddressOne: storageDocument?.facilityAddressOne,
      facilityTownCity: storageDocument?.facilityTownCity,
      facilityPostcode: storageDocument?.facilityPostcode,
      facilityName: storageDocument?.facilityName,
      nextUri,
      hasFacility,
      csrf,
      selectedArrivalDate: storageDocument?.facilityArrivalDate,
      backUrl: getBackUrl(),
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

// Helper function to validate facility fields
const validateFacilityFields = (
  values: Record<string, FormDataEntryValue>,
  result: Response | null,
  t: TFunction,
  fieldPrefixName: string,
  fieldPrefixDate: string
): Array<{ key: string; message: string }> => {
  const errorsArr: Array<{ key: string; message: string }> = [];

  if (!values["facilityName"] || String(values["facilityName"]).trim() === "") {
    errorsArr.push({
      key: fieldPrefixName,
      message: "sdAddStorageFacilityDetailsErrorEnterTheFacilityName",
    });
  }

  if (result !== null) {
    errorsArr.push({
      key: fieldPrefixDate,
      message: t(getErrorMessage(`error.${fieldPrefixDate}.date.isoDate`)),
    });
  }

  return errorsArr;
};

// Helper function to handle add address action
const handleGoToAddAddress = async (
  values: Record<string, FormDataEntryValue>,
  selectedDate: string | undefined,
  session: Session,
  result: Response | null,
  t: TFunction,
  documentNumber: string
): Promise<Response> => {
  session.set("facilityName", String(getStrOrDefault(values["facilityName"] as string)));
  session.set("selectedArrivalDate", selectedDate);

  const fieldPrefixName = "storageFacilities-facilityName";
  const fieldPrefixDate = "facilityArrivalDate";
  const errorsArr = validateFacilityFields(values, result, t, fieldPrefixName, fieldPrefixDate);

  if (errorsArr.length > 0) {
    return new Response(
      JSON.stringify({
        values,
        errors: getTransformedError(errorsArr),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return redirect(`/create-non-manipulation-document/${documentNumber}/what-storage-facility-address`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

// Helper to extract valid facility fields after a draft validation response
const getValidFacilityData = async (
  validationResponse: Response | null | undefined,
  storageFacilityData: Partial<StorageDocument>
): Promise<Partial<StorageDocument>> => {
  if (!validationResponse || !(validationResponse instanceof Response)) {
    return storageFacilityData;
  }

  const responseData = await validationResponse.clone().json();
  const errorKeys: string[] = responseData?.errors ? Object.keys(responseData.errors) : [];

  const filteredFacility = { ...storageFacilityData };

  if (errorKeys.some((k) => k.includes("facilityName"))) {
    filteredFacility.facilityName = null as unknown as string;
  }

  if (errorKeys.some((k) => k.includes("facilityArrivalDate"))) {
    filteredFacility.facilityArrivalDate = null as unknown as string;
  }

  return filteredFacility;
};

// Helper function to handle save as draft action
const handleSaveAsDraft = async (
  bearerToken: string,
  documentNumber: string,
  values: Record<string, FormDataEntryValue>,
  selectedDate: string | undefined,
  session: Session
): Promise<Response> => {
  session.unset("facilityName");
  session.unset("selectedArrivalDate");

  const storageFacilityData = {
    facilityName: String(getStrOrDefault(values["facilityName"] as string)),
    facilityArrivalDate: selectedDate as string,
  };

  const validationResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    "/create-non-manipulation-document/:documentNumber/add-storage-facility-details",
    false,
    false,
    storageFacilityData
  );

  const dataToSave = await getValidFacilityData(validationResponse, storageFacilityData);

  await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    "/create-non-manipulation-document/:documentNumber/add-storage-facility-details",
    true,
    false,
    dataToSave
  );

  return redirect(route("/create-non-manipulation-document/non-manipulation-documents"), {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

// Helper function to handle save and continue action
const handleSaveAndContinue = async (
  bearerToken: string,
  documentNumber: string,
  values: Record<string, FormDataEntryValue>,
  selectedDate: string | undefined,
  session: Session,
  nextUri: string,
  isDraft: boolean = false
): Promise<Response> => {
  const saveToRedisIfErrors = isDraft;
  const errorResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    "/create-non-manipulation-document/:documentNumber/add-storage-facility-details",
    saveToRedisIfErrors,
    undefined,
    {
      facilityName: String(getStrOrDefault(values["facilityName"] as string)),
      facilityArrivalDate: selectedDate as string,
    }
  );

  if (errorResponse instanceof Response) {
    // When there are errors and JavaScript is disabled, include the submitted form values
    // so they can be used to repopulate the form fields
    const responseData = await errorResponse.json();

    // Explicitly include the form values in the response under 'values' key
    const combinedResponse = {
      ...responseData,
      values: {
        facilityName: String(getStrOrDefault(values["facilityName"] as string)),
        facilityArrivalDate: selectedDate,
        facilityArrivalDateDay: values["facilityArrivalDateDay"],
        facilityArrivalDateMonth: values["facilityArrivalDateMonth"],
        facilityArrivalDateYear: values["facilityArrivalDateYear"],
      },
    };

    return new Response(JSON.stringify(combinedResponse), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  session.unset("facilityName");
  session.unset("selectedArrivalDate");

  return redirect(
    isEmpty(nextUri) ? `/create-non-manipulation-document/${documentNumber}/add-storage-facility-approval` : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  if (!documentNumber) {
    return redirect("/forbidden");
  }
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const form = await request.formData();
  const nextUri = form.get("nextUri") as string;
  const { _action, ...values } = Object.fromEntries(form);
  const t = await i18next.getFixedT(request, ["errorsText", "uploadFile"]);

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const facilityArrivalDateYear = form.get("facilityArrivalDateYear") as string;
  const facilityArrivalDateMonth = form.get("facilityArrivalDateMonth") as string;
  const facilityArrivalDateDay = form.get("facilityArrivalDateDay") as string;
  const selectedDate =
    facilityArrivalDateDay || facilityArrivalDateMonth || facilityArrivalDateYear
      ? toDDMMYYYYFormat(facilityArrivalDateDay, facilityArrivalDateMonth, facilityArrivalDateYear)
      : undefined;
  const selectedDateInISOFormat = toISODateFormat(
    getStrOrDefault(facilityArrivalDateDay),
    getStrOrDefault(facilityArrivalDateMonth),
    getStrOrDefault(facilityArrivalDateYear)
  );
  const result = await nonJsDateValidation(request, values, selectedDateInISOFormat, "facilityArrivalDate");

  if (_action === "add-facilityArrivalDate") {
    return (
      result ??
      new Response(JSON.stringify({ values }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  }

  if (_action === "goToAddAddress") {
    return handleGoToAddAddress(values, selectedDate, session, result, t, documentNumber);
  }

  if (_action === "saveAsDraft") {
    return handleSaveAsDraft(bearerToken, documentNumber, values, selectedDate, session);
  }

  return handleSaveAndContinue(bearerToken, documentNumber, values, selectedDate, session, nextUri, false);
};

const getArrivalDateFromAction = (actionData: any, type: string): string => {
  const year = actionData?.values?.[`${type}Year`] ?? "";
  const month = actionData?.values?.[`${type}Month`] ?? "";
  const day = actionData?.values?.[`${type}Day`] ?? "";
  return year || month || day ? `${year}-${month}-${day}` : "";
};

const AddStorageFacilityDetails = () => {
  const { t } = useTranslation(["addStorageFacilityDetails", "common"]);
  const {
    documentNumber,
    facilityAddressOne,
    facilityTownCity,
    facilityPostcode,
    facilityName,
    nextUri,
    hasFacility,
    csrf,
    selectedArrivalDate,
    backUrl,
  } = useLoaderData<loaderStorageFacility>();
  const actionData = useActionData<{ errors: IErrorsTransformed; values?: Record<string, any> }>() ?? { errors: {} };
  const { errors = {}, values: submittedValues } = actionData;

  // Helper function to get the value to display - prefer submitted form data when there are errors
  const getFormValue = (fieldName: string, defaultValue: any) => {
    if (!isEmpty(errors) && submittedValues?.[fieldName] !== undefined) {
      return submittedValues[fieldName];
    }
    return defaultValue;
  };

  const arrivalDateFromAction = getArrivalDateFromAction(actionData, "facilityArrivalDate");

  const getDateFromActionOrLoader = (dateFromAction: string, dateFromLoader: string | undefined): string =>
    dateFromAction?.trim() ?? dateFromLoader?.trim() ?? "";

  const [daySelected = "", monthSelected = "", yearSelected = ""] =
    selectedArrivalDate && typeof selectedArrivalDate === "string" ? selectedArrivalDate.split("/") : " ";

  useScrollOnPageError(errors);
  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={`${t("sdAddStorageDetailsHeader")}`} />
          <SecureForm
            method="post"
            action={`/create-non-manipulation-document/${documentNumber}/add-storage-facility-details`}
            csrf={csrf}
          >
            <div className="govuk-!-margin-bottom-6 centered">
              <div className="govuk-!-display-inline-block">
                <svg
                  version="1.1"
                  fill="currentColor"
                  width="35"
                  height="35"
                  viewBox="0 0 35.000000 35.000000"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <title>icon important</title>
                  <g transform="translate(0.000000,35.000000) scale(0.100000,-0.100000)">
                    <path
                      d="M100 332 c-87 -48 -125 -155 -82 -232 48 -87 155 -125 232 -82 87 48
                        125 155 82 232 -48 87 -155 125 -232 82z m100 -122 c0 -53 -2 -60 -20 -60 -18
                        0 -20 7 -20 60 0 53 2 60 20 60 18 0 20 -7 20 -60z m0 -111 c0 -12 -7 -19 -20
                        -19 -19 0 -28 28 -14 43 11 11 34 -5 34 -24z"
                    ></path>
                  </g>
                </svg>
              </div>
              <div className="govuk-!-display-inline-block govuk-!-padding-left-2 govuk-phase-banner__text">
                <strong>{t("sdAddStorageAddressRequired")}</strong>
              </div>
            </div>
            <DateFieldWithPicker
              id={"storageFacilities-facilityArrivalDate"}
              name="facilityArrivalDate"
              errors={errors?.["storageFacilities-facilityArrivalDate"] || errors?.facilityArrivalDate}
              dateSelected={getDateFromActionOrLoader(
                arrivalDateFromAction,
                yearSelected + "-" + monthSelected + "-" + daySelected
              )}
              getDateSelected={() => {}}
              label={t("sdStorageArrivalDate", {
                ns: "addStorageFacilityDetails",
                defaultValue: "Arrival date",
              })}
              labelStyle="normal"
              translationNs="addStorageFacilityDetails"
              hintText={t("sdStorageArrivalDateInfo", {
                ns: "addStorageFacilityDetails",
                defaultValue:
                  "This should be the date the product arrives at the storage facility. For example, 25/07/2025.",
              })}
            />
            <details className="govuk-details" data-module="govuk-details">
              <summary className="govuk-details__summary">
                <span className="govuk-details__summary-text">
                  {t("sdStorageArrivalDateGuidanceTitle", {
                    ns: "addStorageFacilityDetails",
                    defaultValue: "What is the arrival date?",
                  })}
                </span>
              </summary>
              <div className="govuk-details__text">
                {t("sdStorageArrivalDateGuidanceText", {
                  ns: "addStorageFacilityDetails",
                  defaultValue:
                    "This is the date the product arrives at the storage facility and is unloaded. If unloading happens later, enter the date the product was physically removed from the transport and received into storage.",
                })}
              </div>
            </details>
            <FormInput
              containerClassName={
                isEmpty(errors?.["storageFacilities-facilityName"])
                  ? "govuk-form-group govuk-!-width-one-half"
                  : "govuk-form-group govuk-!-width-one-half govuk-form-group--error"
              }
              label={t("sdFacilityName")}
              name="facilityName"
              type="text"
              inputClassName={classNames("govuk-input", {
                "govuk-input--error": errors?.["storageFacilities-facilityName"],
              })}
              errorProps={{
                className: !isEmpty(errors?.["storageFacilities-facilityName"]) ? "govuk-error-message" : "",
              }}
              staticErrorMessage={t(errors?.["storageFacilities-facilityName"]?.message, {
                ns: "errorsText",
              })}
              errorPosition={ErrorPosition.AFTER_LABEL}
              inputProps={{
                defaultValue: getFormValue("facilityName", facilityName),
                id: "storageFacilities-facilityName",
              }}
              hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
              hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
            />
            {hasFacility ? (
              <p>
                {facilityAddressOne}
                <br />
                {facilityTownCity}
                <br />
                {facilityPostcode}
              </p>
            ) : null}
            <br />
            <div className="govuk-button-group">
              <Button
                id="goToAddAddress"
                label={
                  hasFacility
                    ? t("commonWhatExportersAddressChangeLink", { ns: "common" })
                    : t("sdAddStorageFacilityDetailsAddAddressText")
                }
                className="govuk-button govuk-button--secondary"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                //@ts-ignore
                value="goToAddAddress"
                data-testid="goToAddAddress-button"
              />
              <Button
                id="saveAsDraft"
                label={t("commonSaveAsDraftButtonSaveAsDraftText", { ns: "common" })}
                className="govuk-button govuk-button--secondary"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                // @ts-ignore
                value="saveAsDraft"
                data-testid="save-draft-button"
              />
            </div>
            <br />
            <div className="govuk-button-group">
              <Button
                id="continue"
                label={t("commonContinueButtonSaveAndContinueButton", { ns: "common" })}
                className="govuk-button"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                // @ts-ignore
                value="saveAndContinue"
                data-testid="save-and-continue"
              />
            </div>
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-non-manipulation-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default AddStorageFacilityDetails;
