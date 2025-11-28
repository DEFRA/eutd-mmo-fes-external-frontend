import * as React from "react";
import { Main, Title, BackToProgressLink, SecureForm, ErrorSummary, ErrorMessage } from "~/components";
import { useTranslation } from "react-i18next";
import { FormInput } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type ActionFunction, type LoaderFunction, redirect } from "@remix-run/node";
import type { StorageDocument, IUnauthorised, IErrorsTransformed } from "~/types";
import {
  getBearerTokenForRequest,
  validateResponseData,
  instanceOfUnauthorised,
  getStorageDocument,
  createCSRFToken,
  updateStorageDocumentFacility,
} from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { ButtonGroup } from "~/composite-components";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import classNames from "classnames/bind";
import { json } from "~/communication.server";
import { getEnv } from "~/env.server";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import { displayErrorTransformedMessages } from "~/helpers";
import { useScrollOnPageError } from "~/hooks";

type loaderStorageFacility = {
  documentNumber: string;
  approvalNumber: string;
  facilityStorage?: string;
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

  return json(
    {
      documentNumber,
      nextUri,
      displayOptionalSuffix,
      approvalNumber: storageDocumentDetails?.facilityApprovalNumber,
      facilityStorage: storageDocumentDetails?.facilityStorage,
      csrf,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);

  const saveToRedisIfErrors = false;
  const errorResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    "/create-storage-document/:documentNumber/add-storage-facility-approval",
    saveToRedisIfErrors,
    undefined,
    {
      facilityApprovalNumber: !isEmpty(values["approvalNumber"]) ? (values["approvalNumber"] as string) : undefined,
      facilityStorage: !isEmpty(values["facilityStorage"]) ? (values["facilityStorage"] as string) : undefined,
    }
  );

  const session = await getSessionFromRequest(request);
  const isDraft = _action === "saveAsDraft";
  if (isDraft) {
    return redirect(route("/create-storage-document/storage-documents"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  if (errorResponse) {
    return errorResponse as Response;
  }

  session.set("backLinkForFacilityAdded", `/create-storage-document/${documentNumber}/add-storage-facility-approval`);

  const nextUri = form.get("nextUri") as string;
  return redirect(
    isEmpty(nextUri) ? `/create-storage-document/${documentNumber}/how-does-the-export-leave-the-uk` : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const AddStorageFacilityApproval = () => {
  const { t } = useTranslation(["addStorageFacilityDetails", "common"]);
  const { documentNumber, approvalNumber, facilityStorage, nextUri, csrf } = useLoaderData<loaderStorageFacility>();
  const actionData = useActionData<{
    errors: IErrorsTransformed;
    facilityStorage?: string;
  }>() ?? { errors: {} };
  const { errors = {} } = actionData;

  useScrollOnPageError(errors);

  return (
    <Main backUrl={`/create-storage-document/${documentNumber}/add-storage-facility-details`}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("sdAddStorageDetailsHeader")} />
          <SecureForm
            method="post"
            action={`/create-storage-document/${documentNumber}/add-storage-facility-approval`}
            csrf={csrf}
          >
            <div
              className={
                isEmpty(errors?.["storageFacilities-facilityApproval"])
                  ? "govuk-form-group"
                  : "govuk-form-group govuk-form-group--error"
              }
            >
              {!isEmpty(errors?.["storageFacilities-facilityApproval"]) ? (
                <ErrorMessage
                  text={t(errors?.["storageFacilities-facilityApproval"]?.message, {
                    ns: "errorsText",
                  })}
                  visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                />
              ) : null}
              <FormInput
                containerClassName="govuk-form-group  govuk-!-width-two-thirds"
                label={t("productStorageApprovalNumberLabel", { ns: "addStorageFacilityDetails" })}
                labelClassName="govuk-label govuk-label--s"
                name="approvalNumber"
                hint={{
                  position: "above",
                  className: "govuk-hint",
                  id: "hint-storageFacilities-approvalNumber",
                  text: t("hintApprovalNumber", { ns: "addStorageFacilityDetails" }),
                }}
                type="text"
                inputClassName={classNames("govuk-input govuk-input--width-10 margin-top-10")}
                inputProps={{
                  defaultValue: approvalNumber,
                  id: "storageFacilities-facilityApproval",
                  "aria-describedby": "hint-storageFacilities-approvalNumber",
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
                  !isEmpty(errors?.["storageFacilities-facilityStorage"])
                    ? "product-storage-hint storageFacilities-facilityStorage-error"
                    : "product-storage-hint"
                }
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  {t("productStorageLegend", { ns: "addStorageFacilityDetails" })}{" "}
                </legend>
                {!isEmpty(errors?.["storageFacilities-facilityStorage"]) ? (
                  <ErrorMessage
                    id="storageFacilities-facilityStorage-error"
                    text={t(errors?.["storageFacilities-facilityStorage"]?.message, {
                      ns: "errorsText",
                    })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                ) : null}
                <div id="product-storage-hint" className="govuk-hint">
                  {t("productStorageHint", { ns: "addStorageFacilityDetails" })}
                </div>
                <div className="govuk-radios" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="chilled"
                      name="facilityStorage"
                      type="radio"
                      value="Chilled"
                      defaultChecked={actionData.facilityStorage === "Chilled" || facilityStorage === "Chilled"}
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="chilled">
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
            progressUri="/create-storage-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default AddStorageFacilityApproval;
