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
  getStorageFacility,
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
  chilled?: string;
  frozen?: string;
  other?: string;
  approvalIndex?: number;
  displayOptionalSuffix: boolean;
  nextUri?: string;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  setApiMock(request.url);
  const { documentNumber } = params;
  const approvalIndex = parseInt(params["*"] ?? "") || 0;
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const storageDocumentDetails: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
  const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";

  const session = await getSessionFromRequest(request);

  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  if (instanceOfUnauthorised(storageDocumentDetails)) {
    return redirect("/forbidden");
  }

  validateResponseData(storageDocumentDetails);

  const { validFacilityIndex: FacilityIndex, currentFacility: latestFacility } = getStorageFacility(
    storageDocumentDetails,
    approvalIndex
  );

  const storageObject = latestFacility?.facilityStorage
    ?.split(",")
    .map((item) => item.trim())
    .reduce(
      (acc, key) => {
        acc[key] = "Y";
        return acc;
      },
      {} as Record<string, string>
    );

  return json(
    {
      documentNumber,
      nextUri,
      approvalIndex: FacilityIndex,
      displayOptionalSuffix,
      approvalNumber: latestFacility?.facilityApprovalNumber,
      ...storageObject,
      csrf,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const facilityIndex = parseInt(params["*"] ?? "") || 0;
  const facilityIndexUrlFragment = facilityIndex >= 0 ? `/${facilityIndex}` : "";
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const chilled = form.get("chilled") as string;
  const frozen = form.get("frozen") as string;
  const other = form.get("other") as string;
  const selected = [
    chilled === "Y" ? "chilled" : null,
    frozen === "Y" ? "frozen" : null,
    other === "Y" ? "other" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const { _action, ...values } = Object.fromEntries(form);

  const saveToRedisIfErrors = false;
  const errorResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    {
      facilityApprovalNumber: values["approvalNumber"] as string,
      facilityStorage: selected,
    },
    `/create-storage-document/:documentNumber/add-storage-facility-approval${facilityIndexUrlFragment}`,
    facilityIndex,
    saveToRedisIfErrors
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

  session.set(
    "backLinkForFacilityAdded",
    `/create-storage-document/${documentNumber}/add-storage-facility-approval${facilityIndexUrlFragment}`
  );

  const nextUri = form.get("nextUri") as string;
  return redirect(
    isEmpty(nextUri) ? `/create-storage-document/${documentNumber}/you-have-added-a-storage-facility` : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const AddStorageFacilityApproval = () => {
  const { t } = useTranslation(["addStorageFacilityDetails", "common"]);
  const {
    documentNumber,
    approvalNumber,
    chilled,
    frozen,
    other,
    nextUri,
    approvalIndex,
    displayOptionalSuffix,
    csrf,
  } = useLoaderData<loaderStorageFacility>();
  const actionData = useActionData<{
    errors: IErrorsTransformed;
    chilled?: string;
    frozen?: string;
    other?: string;
  }>() ?? { errors: {} };
  const { errors = {} } = actionData;

  useScrollOnPageError(errors);

  return (
    <Main backUrl={`/create-storage-document/${documentNumber}/add-storage-facility-details/${approvalIndex}`}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={`${t("sdAddStorageDetailsHeader")}`} />
          <div className="govuk-warning-text" data-testid="warning-message">
            {" "}
            <span className="govuk-warning-text__icon" aria-hidden="true">
              {" "}
              !{" "}
            </span>{" "}
            <strong className="govuk-warning-text__text">{t("productApprovalheadingLabel")} </strong>{" "}
          </div>
          <SecureForm
            method="post"
            action={`/create-storage-document/${documentNumber}/add-storage-facility-approval/${approvalIndex}`}
            csrf={csrf}
          >
            <div
              className={
                isEmpty(errors?.[`storageFacilities-${approvalIndex}-facilityApproval`])
                  ? "govuk-form-group"
                  : "govuk-form-group govuk-form-group--error"
              }
            >
              {!isEmpty(errors?.[`storageFacilities-${approvalIndex}-facilityApproval`]) ? (
                <ErrorMessage
                  text={t(errors?.[`storageFacilities-${approvalIndex}-facilityApproval`]?.message, {
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
                  id: `hint-storageFacilities-${approvalIndex}-approvalNumber`,
                  text: t("hintApprovalNumber", { ns: "addStorageFacilityDetails" }),
                }}
                type="text"
                inputClassName={classNames("govuk-input govuk-input--width-10 margin-top-10")}
                inputProps={{
                  defaultValue: approvalNumber,
                  id: `storageFacilities-${approvalIndex}-facilityApproval`,
                  "aria-describedby": `hint-storageFacilities-${approvalIndex}-approvalNumber`,
                }}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
            </div>
            <br />
            <div className="govuk-form-group">
              <fieldset className="govuk-fieldset" aria-describedby="product-storage-hint">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  {t("productStorageLegend", { ns: "addStorageFacilityDetails" })}{" "}
                  {displayOptionalSuffix && (
                    <span className="govuk-!-font-weight-bold">
                      {t("optionalText", { ns: "addStorageFacilityDetails" })}
                    </span>
                  )}
                </legend>
                <div id="product-storage-hint" className="govuk-hint">
                  {t("productStorageHint", { ns: "addStorageFacilityDetails" })}
                </div>
                <div className="govuk-checkboxes" data-module="govuk-checkboxes" data-govuk-checkboxes-init="">
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="chilled"
                      value="Y"
                      defaultChecked={actionData.chilled === "Y" || chilled === "Y"}
                      name="chilled"
                      type="checkbox"
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="chilled">
                      {t("productStorageChilledLabel", { ns: "addStorageFacilityDetails" })}
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="frozen"
                      value="Y"
                      defaultChecked={actionData.frozen === "Y" || frozen === "Y"}
                      name="frozen"
                      type="checkbox"
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="frozen">
                      {t("productStorageFrozenLabel", { ns: "addStorageFacilityDetails" })}
                    </label>
                  </div>
                  <div className="govuk-checkboxes__item">
                    <input
                      className="govuk-checkboxes__input"
                      id="other"
                      value="Y"
                      defaultChecked={actionData.other === "Y" || other === "Y"}
                      name="other"
                      type="checkbox"
                    />
                    <label className="govuk-label govuk-checkboxes__label" htmlFor="other">
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
