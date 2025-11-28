import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE, ErrorPosition, FormInput } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
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
} from "~/helpers";
import setApiMock from "tests/msw/helpers/setApiMock";
import { DateFieldWithPicker } from "~/composite-components";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import classNames from "classnames/bind";
import { json } from "~/communication.server";
import { useScrollOnPageError } from "~/hooks";
import i18next from "~/i18next.server";

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

  return json(
    {
      documentNumber,
      facilityAddressOne: storageDocument?.facilityAddressOne,
      facilityTownCity: storageDocument?.facilityTownCity,
      facilityPostcode: storageDocument?.facilityPostcode,
      facilityName: storageDocument?.facilityName,
      nextUri,
      hasFacility,
      csrf,
      selectedArrivalDate: storageDocument?.facilityArrivalDate,
    },
    session
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
  session.set("facilityName", values["facilityName"]);
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

  return redirect(`/create-storage-document/${documentNumber}/what-storage-facility-address`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

// Helper function to handle save and continue action
const handleSaveAndContinue = async (
  bearerToken: string,
  documentNumber: string,
  values: Record<string, FormDataEntryValue>,
  selectedDate: string | undefined,
  session: Session,
  nextUri: string
): Promise<Response> => {
  const saveToRedisIfErrors = false;
  const errorResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    "/create-storage-document/:documentNumber/add-storage-facility-details",
    saveToRedisIfErrors,
    undefined,
    {
      facilityName: values["facilityName"] as string,
      facilityArrivalDate: selectedDate as string,
    }
  );

  if (errorResponse) {
    return errorResponse as Response;
  }

  session.unset("facilityName");
  session.unset("selectedArrivalDate");

  return redirect(
    isEmpty(nextUri) ? `/create-storage-document/${documentNumber}/add-storage-facility-approval` : nextUri,
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
      ? `${facilityArrivalDateDay}/${facilityArrivalDateMonth}/${facilityArrivalDateYear}`
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
    session.unset("facilityName");
    session.unset("selectedArrivalDate");
    return redirect(route("/create-storage-document/storage-documents"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  return handleSaveAndContinue(bearerToken, documentNumber, values, selectedDate, session, nextUri);
};

const getArrivalDateFromAction = (actionData: any, type: string): string => {
  const year = actionData?.values?.[`${type}Year`] ?? "";
  const month = actionData?.values?.[`${type}Month`] ?? "";
  const day = actionData?.values?.[`${type}Day`] ?? "";
  if (year || month || day) {
    return `${year ?? ""}-${month ?? ""}-${day ?? ""}`;
  }
  return "";
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
  } = useLoaderData<loaderStorageFacility>();
  const actionData = useActionData<{ errors: IErrorsTransformed }>() ?? { errors: {} };
  const { errors = {} } = actionData;

  const arrivalDateFromAction = getArrivalDateFromAction(actionData, "facilityArrivalDate");

  const getDateFromActionOrLoader = (dateFromAction: string, dateFromLoader: string | undefined) => {
    if (dateFromAction && dateFromAction.trim() !== "") {
      return dateFromAction;
    }
    if (dateFromLoader && dateFromLoader.trim() !== "") {
      return dateFromLoader;
    }
    return "";
  };

  const [daySelected = "", monthSelected = "", yearSelected = ""] =
    selectedArrivalDate && typeof selectedArrivalDate === "string" ? selectedArrivalDate.split("/") : " ";

  useScrollOnPageError(errors);
  return (
    <Main
      backUrl={route("/create-storage-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={`${t("sdAddStorageDetailsHeader")}`} />
          <SecureForm
            method="post"
            action={`/create-storage-document/${documentNumber}/add-storage-facility-details`}
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
              labelClassName="govuk-!-font-weight-bold"
              inputProps={{
                defaultValue: facilityName,
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
            progressUri="/create-storage-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default AddStorageFacilityDetails;
