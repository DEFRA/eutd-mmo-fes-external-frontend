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
  getStorageFacility,
  updateStorageDocumentFacility,
  createCSRFToken,
  validateCSRFToken,
  nonJsDateValidation,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { displayErrorTransformedMessages, getStrOrDefault, toISODateFormat } from "~/helpers";
import setApiMock from "tests/msw/helpers/setApiMock";
import { DateFieldWithPicker } from "~/composite-components";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import classNames from "classnames/bind";
import { json } from "~/communication.server";
import { useScrollOnPageError } from "~/hooks";

type loaderStorageFacility = {
  documentNumber: string;
  facilityName: string;
  facilityAddressOne?: string;
  facilityTownCity?: string;
  facilityPostcode?: string;
  facilityIndex?: number;
  nextUri?: string;
  hasFacility?: boolean;
  csrf: string;
  selectedArrivalDate: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const facilityIndex = parseInt(params["*"] ?? "") || 0;
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);

  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");

  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  if (instanceOfUnauthorised(storageDocument)) {
    return redirect("/forbidden");
  }

  validateResponseData(storageDocument);

  const { validFacilityIndex, currentFacility } = getStorageFacility(storageDocument, facilityIndex);
  const hasFacility =
    currentFacility?.facilityAddressOne !== undefined && currentFacility?.facilityPostcode !== undefined;

  return json(
    {
      documentNumber,
      facilityAddressOne: currentFacility?.facilityAddressOne,
      facilityTownCity: currentFacility?.facilityTownCity,
      facilityPostcode: currentFacility?.facilityPostcode,
      facilityName: currentFacility?.facilityName,
      nextUri,
      facilityIndex: validFacilityIndex,
      hasFacility,
      csrf,
      selectedArrivalDate: currentFacility?.facilityArrivalDate,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const facilityIndex = parseInt(params["*"] ?? "") || 0;
  const facilityIndexUrlFragment = facilityIndex >= 0 ? `/${facilityIndex}` : "";
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const form = await request.formData();
  const nextUri = form.get("nextUri") as string;
  const { _action, ...values } = Object.fromEntries(form);

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const facilityArrivalDateYear = form.get("facilityArrivalDateYear") as string;
  const facilityArrivalDateMonth = form.get("facilityArrivalDateMonth") as string;
  const facilityArrivalDateDay = form.get("facilityArrivalDateDay") as string;
  const selectedDate =
    facilityArrivalDateDay || facilityArrivalDateMonth || facilityArrivalDateYear
      ? `${facilityArrivalDateDay}/${facilityArrivalDateMonth}/${facilityArrivalDateYear}`
      : undefined;

  if (_action == "add-facilityArrivalDate") {
    const selectedDateInISOFormat = toISODateFormat(
      getStrOrDefault(facilityArrivalDateDay),
      getStrOrDefault(facilityArrivalDateMonth),
      getStrOrDefault(facilityArrivalDateYear)
    );
    const result = await nonJsDateValidation(request, values, selectedDateInISOFormat, "facilityArrivalDate");
    if (result !== null) {
      return result;
    }

    return redirect("?#facilityArrivalDate");
  }

  if (_action === "goToAddAddress") {
    session.set("facilityName", values["facilityName"]);
    session.set("selectedArrivalDate", selectedDate);

    return redirect(
      `/create-storage-document/${documentNumber}/what-storage-facility-address${facilityIndexUrlFragment}`,
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  const saveToRedisIfErrors = false;
  const errorResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    {
      facilityName: values["facilityName"] as string,
      facilityArrivalDate: selectedDate as string,
    },
    `/create-storage-document/:documentNumber/add-storage-facility-details${facilityIndexUrlFragment}`,
    facilityIndex,
    saveToRedisIfErrors
  );

  const isDraft = _action === "saveAsDraft";
  if (isDraft) {
    session.unset("facilityName");
    session.unset("selectedArrivalDate");
    return redirect(route("/create-storage-document/storage-documents"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  if (errorResponse) {
    return errorResponse as Response;
  }

  session.unset("facilityName");
  session.unset("selectedArrivalDate");

  return redirect(
    isEmpty(nextUri)
      ? `/create-storage-document/${documentNumber}/add-storage-facility-approval${facilityIndexUrlFragment}`
      : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
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
    facilityIndex,
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
            action={`/create-storage-document/${documentNumber}/add-storage-facility-details/${facilityIndex}`}
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
              id="facilityArrivalDate"
              errors={errors?.[`storageFacilities-${facilityIndex}-facilityArrivalDate`]}
              dateSelected={getDateFromActionOrLoader(
                arrivalDateFromAction,
                yearSelected + "-" + monthSelected + "-" + daySelected
              )}
              getDateSelected={() => {}}
              label={t("sdStorageArrivalDateOptional")}
              translationNs="addStorageFacilityDetails"
              hintText={t("sdStorageArrivalDateHint")}
            />
            <FormInput
              containerClassName={
                isEmpty(errors?.[`storageFacilities-${facilityIndex}-facilityName`])
                  ? "govuk-form-group govuk-!-width-one-half"
                  : "govuk-form-group govuk-!-width-one-half govuk-form-group--error"
              }
              label={t("sdFacilityName")}
              name="facilityName"
              type="text"
              inputClassName={classNames("govuk-input", {
                "govuk-input--error": errors?.[`storageFacilities-${facilityIndex}-facilityName`],
              })}
              errorProps={{
                className: !isEmpty(errors?.[`storageFacilities-${facilityIndex}-facilityName`])
                  ? "govuk-error-message"
                  : "",
              }}
              staticErrorMessage={t(errors?.[`storageFacilities-${facilityIndex}-facilityName`]?.message, {
                ns: "errorsText",
              })}
              errorPosition={ErrorPosition.AFTER_LABEL}
              labelClassName="govuk-!-font-weight-bold"
              inputProps={{
                defaultValue: facilityName,
                id: `storageFacilities-${facilityIndex}-facilityName`,
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
