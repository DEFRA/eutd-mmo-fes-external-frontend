import * as React from "react";
import { Main, Title, BackToProgressLink, SecureForm, ErrorSummary, ErrorMessage } from "~/components";
import { useTranslation } from "react-i18next";
import { FormInput } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData, redirect, type ActionFunction, type LoaderFunction } from "react-router";

import { route } from "routes-gen";
import type { StorageDocument, IUnauthorised, IErrorsTransformed, Establishment } from "~/types";
import {
  getBearerTokenForRequest,
  validateResponseData,
  instanceOfUnauthorised,
  getStorageDocument,
  createCSRFToken,
  updateStorageDocumentFacility,
  validateCSRFToken,
  matchEstablishment,
  mapEstablishmentToFacilityAddress,
  nonJsDateValidation,
  searchEstablishments,
} from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { ButtonGroup, DateFieldWithPicker } from "~/composite-components";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import classNames from "classnames";
import { getEnv } from "~/env.server";
import isEmpty from "lodash/isEmpty";
import { displayErrorTransformedMessages, getStrOrDefault, toDDMMYYYYFormat, toISODateFormat } from "~/helpers";
import { useScrollOnPageError } from "~/hooks";

type loaderStorageFacility = {
  documentNumber: string;
  approvalNumber: string;
  facilityStorage?: string;
  facilityName?: string;
  facilityAddressOne?: string;
  facilityTownCity?: string;
  facilityPostcode?: string;
  selectedArrivalDate?: string;
  isMatchedEstablishment: boolean;
  hasFacility: boolean;
  displayOptionalSuffix: boolean;
  nextUri?: string;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  setApiMock(request.url);
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const storageDocumentDetails: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
  const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";

  const session = await getSessionFromRequest(request);

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  if (instanceOfUnauthorised(storageDocumentDetails)) {
    return redirect("/forbidden");
  }

  validateResponseData(storageDocumentDetails);

  const sd = storageDocumentDetails as StorageDocument;
  const establishments: Establishment[] = await searchEstablishments("storage", "");
  // Recomputed every request rather than persisted - the facility can only change via
  // add-storage-facility, so the registry is always the source of truth for this flag.
  const matchedEstablishment = matchEstablishment(establishments, sd.facilityName, sd.facilityApprovalNumber);
  const matchedAddress = matchedEstablishment ? mapEstablishmentToFacilityAddress(matchedEstablishment) : undefined;
  const isMatchedEstablishment = Boolean(matchedEstablishment);
  const hasFacility = !isEmpty(sd.facilityAddressOne) && !isEmpty(sd.facilityPostcode);

  return new Response(
    JSON.stringify({
      documentNumber,
      nextUri,
      displayOptionalSuffix,
      approvalNumber: sd.facilityApprovalNumber,
      facilityStorage: sd.facilityStorage,
      facilityName: sd.facilityName,
      facilityAddressOne: matchedAddress?.facilityAddressOne ?? sd.facilityAddressOne,
      facilityTownCity: matchedAddress?.facilityTownCity ?? sd.facilityTownCity,
      facilityPostcode: matchedAddress?.facilityPostcode ?? sd.facilityPostcode,
      selectedArrivalDate: sd.facilityArrivalDate,
      isMatchedEstablishment,
      hasFacility,
      csrf,
    }),
    {
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const facilityDetailsUrl = "/create-non-manipulation-document/:documentNumber/add-storage-facility-details";

// nonJsDateValidation always keys its error "facilityArrivalDate", but the Day/Month/Year inputs
// all share the DateFieldWithPicker's own id ("storageFacilities-facilityArrivalDate") - remap so
// the error summary link's href/focus target actually matches an element in the DOM (the Day input,
// being first in markup order).
const dateFieldId = "storageFacilities-facilityArrivalDate";
const remapDateErrorKey = (errors: IErrorsTransformed): IErrorsTransformed => {
  const dateError = errors.facilityArrivalDate;
  if (!dateError) {
    return errors;
  }

  const { facilityArrivalDate, ...rest } = errors;
  return {
    [dateFieldId]: { ...dateError, key: dateFieldId, fieldId: `${dateFieldId}-error` },
    ...rest,
  };
};

const saveAsDraftFacilityApproval = async (
  bearerToken: string,
  documentNumber: string | undefined,
  facilityData: Partial<StorageDocument>
): Promise<void> => {
  const validationResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    facilityDetailsUrl,
    false,
    undefined,
    facilityData
  );

  const dataToSave: Partial<StorageDocument> = { ...facilityData };

  if (validationResponse instanceof Response) {
    const responseData = await validationResponse.clone().json();
    const errorKeys: string[] = responseData?.errors ? Object.keys(responseData.errors) : [];

    for (const key of Object.keys(dataToSave) as Array<keyof StorageDocument>) {
      if (errorKeys.some((k) => k.includes(key) || k.includes("facilityApproval"))) {
        dataToSave[key] = undefined;
      }
    }
  }

  await updateStorageDocumentFacility(bearerToken, documentNumber, facilityDetailsUrl, true, undefined, dataToSave);
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  if (!documentNumber) {
    return redirect("/forbidden");
  }

  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const form = await request.formData();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const { _action, ...values } = Object.fromEntries(form);
  const isDraft = _action === "saveAsDraft";
  const nextUri = form.get("nextUri") as string;

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

  const facilityData: Partial<StorageDocument> = {
    facilityName: (values["facilityName"] as string) ?? "",
    facilityApprovalNumber: isEmpty(values["approvalNumber"]) ? undefined : (values["approvalNumber"] as string),
    facilityStorage: isEmpty(values["facilityStorage"]) ? undefined : (values["facilityStorage"] as string),
    facilityArrivalDate: selectedDate,
  };

  if (isDraft) {
    // Drafts intentionally skip arrival-date validation below - incomplete data is allowed.
    await saveAsDraftFacilityApproval(bearerToken, documentNumber, facilityData);
    return redirect(route("/create-non-manipulation-document/non-manipulation-documents"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  const dateValidationResponse = await nonJsDateValidation(
    request,
    values,
    selectedDateInISOFormat,
    "facilityArrivalDate"
  );
  const dateErrors: IErrorsTransformed = dateValidationResponse
    ? remapDateErrorKey((await dateValidationResponse.clone().json())?.errors ?? {})
    : {};

  const errorResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    facilityDetailsUrl,
    false,
    undefined,
    facilityData
  );

  if (errorResponse || !isEmpty(dateErrors)) {
    const backendErrors: IErrorsTransformed =
      errorResponse instanceof Response ? (await errorResponse.clone().json())?.errors ?? {} : {};

    // Merge so both the arrival date and backend (storage type, approval number, etc.) errors
    // can be shown together, instead of the date check short-circuiting the backend call. Date
    // errors are spread first so they're listed before the backend's in the error summary.
    return new Response(JSON.stringify({ errors: { ...dateErrors, ...backendErrors } }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  session.set(
    "backLinkForFacilityAdded",
    `/create-non-manipulation-document/${documentNumber}/add-storage-facility-details`
  );

  return redirect(
    isEmpty(nextUri)
      ? `/create-non-manipulation-document/${documentNumber}/how-does-the-consignment-leave-the-uk`
      : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const AddStorageFacilityApproval = () => {
  const { t } = useTranslation(["addStorageFacilityDetails", "common", "errorsText"]);
  const {
    documentNumber,
    approvalNumber,
    facilityStorage,
    facilityName,
    facilityAddressOne,
    facilityTownCity,
    facilityPostcode,
    selectedArrivalDate,
    isMatchedEstablishment,
    hasFacility,
    nextUri,
    csrf,
  } = useLoaderData<loaderStorageFacility>();
  const actionData = useActionData<{
    errors: IErrorsTransformed;
    facilityStorage?: string;
  }>() ?? { errors: {} };
  const { errors = {} } = actionData;
  const [facilityNameValue, setFacilityNameValue] = React.useState(facilityName ?? "");

  useScrollOnPageError(errors);

  const [daySelected = "", monthSelected = "", yearSelected = ""] =
    selectedArrivalDate && typeof selectedArrivalDate === "string" ? selectedArrivalDate.split("/") : " ";

  // The address is always known by this page (add-storage-facility requires a registry match
  // or a completed manual address first).
  const hasAddress = isMatchedEstablishment || hasFacility;

  return (
    <Main backUrl={`/create-non-manipulation-document/${documentNumber}/add-storage-facility`}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("sdAddStorageApprovalDetailsHeader")} />
          <SecureForm
            method="post"
            action={`/create-non-manipulation-document/${documentNumber}/add-storage-facility-details`}
            csrf={csrf}
          >
            {hasAddress && (
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-two-thirds" data-testid="facility-summary-column">
                  <div
                    id="storageFacilities-facilityTownCity"
                    className="app-establishment-summary govuk-!-margin-bottom-6"
                    data-testid="facility-summary"
                  >
                    <p className="govuk-body govuk-!-margin-bottom-3">
                      <strong>
                        {t("sdStorageFacilityAddressSummaryHeading", { ns: "addStorageFacilityDetails" })}
                      </strong>
                    </p>
                    {facilityName && (
                      <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">{facilityName}</p>
                    )}
                    {approvalNumber && (
                      <p className="govuk-body govuk-!-margin-bottom-1">
                        {t("sdFacilitySummaryApprovalNumberLabel")}: {approvalNumber}
                      </p>
                    )}
                    {facilityAddressOne && <p className="govuk-body govuk-!-margin-bottom-1">{facilityAddressOne}</p>}
                    {facilityTownCity && <p className="govuk-body govuk-!-margin-bottom-1">{facilityTownCity}</p>}
                    {facilityPostcode && <p className="govuk-body govuk-!-margin-bottom-1">{facilityPostcode}</p>}
                  </div>
                </div>
              </div>
            )}
            <DateFieldWithPicker
              id="storageFacilities-facilityArrivalDate"
              name="facilityArrivalDate"
              errors={errors?.["storageFacilities-facilityArrivalDate"] || errors?.facilityArrivalDate}
              dateSelected={`${yearSelected}-${monthSelected}-${daySelected}`}
              getDateSelected={() => {}}
              label={t("sdStorageArrivalDate", { ns: "addStorageFacilityDetails", defaultValue: "Arrival date" })}
              labelStyle="bold"
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
            <div
              className={
                isEmpty(errors?.["storageFacilities-facilityName"])
                  ? "govuk-form-group"
                  : "govuk-form-group govuk-form-group--error"
              }
            >
              {!isEmpty(errors?.["storageFacilities-facilityName"]) && (
                <ErrorMessage
                  id="storageFacilities-facilityName-error"
                  text={t(errors?.["storageFacilities-facilityName"]?.message, { ns: "errorsText" })}
                  visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                />
              )}
              <FormInput
                containerClassName="govuk-form-group govuk-!-width-two-thirds"
                label={t("sdFacilityName", { ns: "addStorageFacilityDetails" })}
                labelClassName="govuk-label govuk-label--s"
                name="facilityName"
                type="text"
                value={facilityNameValue}
                onChange={(event: React.FormEvent<HTMLInputElement>) => setFacilityNameValue(event.currentTarget.value)}
                inputClassName={classNames("govuk-input", {
                  "govuk-input--error": errors?.["storageFacilities-facilityName"],
                })}
                inputProps={{
                  id: "storageFacilities-facilityName",
                  "aria-describedby": isEmpty(errors?.["storageFacilities-facilityName"])
                    ? undefined
                    : "storageFacilities-facilityName-error",
                }}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
            </div>
            <div
              className={
                isEmpty(errors?.["storageFacilities-facilityApproval"])
                  ? "govuk-form-group"
                  : "govuk-form-group govuk-form-group--error"
              }
            >
              {isEmpty(errors?.["storageFacilities-facilityApproval"]) ? null : (
                <ErrorMessage
                  id="storageFacilities-facilityApproval-error"
                  text={t(errors?.["storageFacilities-facilityApproval"]?.message, {
                    ns: "errorsText",
                  })}
                  visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                />
              )}
              <FormInput
                containerClassName="govuk-form-group  govuk-!-width-two-thirds"
                label={t("productStorageApprovalNumberLabel", { ns: "addStorageFacilityDetails" })}
                labelClassName="govuk-label govuk-label--s"
                name="approvalNumber"
                hint={{
                  position: "above",
                  className: "govuk-hint",
                  id: "hint-storageFacilities-approvalNumber",
                  text: t(isMatchedEstablishment ? "hintApprovalNumberMatched" : "hintApprovalNumber", {
                    ns: "addStorageFacilityDetails",
                  }),
                }}
                type="text"
                inputClassName={classNames("govuk-input govuk-input--width-10 margin-top-10")}
                inputProps={{
                  defaultValue: approvalNumber,
                  id: "storageFacilities-facilityApproval",
                  "aria-describedby": isEmpty(errors?.["storageFacilities-facilityApproval"])
                    ? "hint-storageFacilities-approvalNumber"
                    : "hint-storageFacilities-approvalNumber storageFacilities-facilityApproval-error",
                }}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
            </div>
            <br />
            <div
              className={
                isEmpty(errors?.["storageFacilities-facilityStorage"])
                  ? "govuk-form-group"
                  : "govuk-form-group govuk-form-group--error"
              }
            >
              <fieldset
                className="govuk-fieldset"
                aria-describedby={
                  isEmpty(errors?.["storageFacilities-facilityStorage"])
                    ? "product-storage-hint"
                    : "product-storage-hint storageFacilities-facilityStorage-error"
                }
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  {t("productStorageLegend", { ns: "addStorageFacilityDetails" })}{" "}
                </legend>
                {isEmpty(errors?.["storageFacilities-facilityStorage"]) ? null : (
                  <ErrorMessage
                    id="storageFacilities-facilityStorage-error"
                    text={t(errors?.["storageFacilities-facilityStorage"]?.message, {
                      ns: "errorsText",
                    })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <div id="product-storage-hint" className="govuk-hint">
                  {t("productStorageHint", { ns: "addStorageFacilityDetails" })}
                </div>
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="storageFacilities-facilityStorage"
                      name="facilityStorage"
                      type="radio"
                      value="Chilled"
                      defaultChecked={actionData.facilityStorage === "Chilled" || facilityStorage === "Chilled"}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="storageFacilities-facilityStorage">
                      {t("productStorageChilledLabel", { ns: "addStorageFacilityDetails" })}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="frozen"
                      name="facilityStorage"
                      type="radio"
                      value="Frozen"
                      defaultChecked={actionData.facilityStorage === "Frozen" || facilityStorage === "Frozen"}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="frozen">
                      {t("productStorageFrozenLabel", { ns: "addStorageFacilityDetails" })}
                    </label>
                  </div>
                  <div className="govuk-radios__divider">
                    {t("productStorageOrLabel", { ns: "addStorageFacilityDetails" })}
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="other"
                      name="facilityStorage"
                      type="radio"
                      value="Other"
                      defaultChecked={actionData.facilityStorage === "Other" || facilityStorage === "Other"}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="other">
                      {t("productStorageOtherLabel", { ns: "addStorageFacilityDetails" })}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <ButtonGroup />
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

export default AddStorageFacilityApproval;
