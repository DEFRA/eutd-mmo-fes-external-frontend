import * as React from "react";
import { useEffect, useState } from "react";
import { Details, FormInput, ErrorPosition } from "@capgeminiuk/dcx-react-library";
import { type LoaderFunction, redirect, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import { AutocompleteFormField, BackToProgressLink, ErrorSummary, Main, SecureForm, Title } from "~/components";
import { scrollToId } from "~/helpers";
import { getSessionFromRequest } from "~/sessions.server";
import {
  getBearerTokenForRequest,
  getProcessingStatement,
  validateResponseData,
  updateProcessingStatement,
  instanceOfUnauthorised,
  getProductDescription,
  getCommodities,
  updateProcessingStatementProducts,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";
import type { CodeAndDescription, ErrorResponse, IUnauthorised, LabelAndValue, ProcessingStatement } from "~/types";
import { ButtonGroup } from "~/composite-components";
import { getEnv } from "~/env.server";
import classNames from "classnames";
import { useHydrated } from "remix-utils/use-hydrated";
import { json } from "~/communication.server";

type loaderConsignmentDetails = {
  documentNumber: string;
  commodityCode?: string;
  description?: string;
  nextUri?: string;
  lang?: string;
  commodityCodes: LabelAndValue[];
  productDescriptionMaxLength: number;
  isEditing?: boolean;
  productIndex?: number;
  csrf: string;
};

const addConsignmentDetailsActionHandler = (
  documentNumber: string | undefined,
  processingStatement: ProcessingStatement | IUnauthorised,
  nextUri: string
): Response => {
  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  const id =
    Array.isArray(processingStatement.catches) && processingStatement.catches.length > 0
      ? processingStatement.catches[0]._id
      : "";

  const redirectUri = isEmpty(nextUri)
    ? `/create-processing-statement/${documentNumber}/add-catch-details/${id}`
    : nextUri;
  return redirect(redirectUri);
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const ENV = getEnv();

  const { documentNumber } = params;
  const productIndex = parseInt(params["*"] ?? "");
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const lang = url.searchParams.get("lng");
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);

  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  validateResponseData(processingStatement);

  const commodities: CodeAndDescription[] = await getCommodities();

  const { currentProductDescription } = getProductDescription(processingStatement?.products, productIndex);
  const productDescriptionMaxLength: number = parseInt(ENV.MAXIMUM_PRODUCT_DESCRIPTION_LENGTH);

  return json(
    {
      documentNumber,
      commodityCode: currentProductDescription?.commodityCode,
      description: currentProductDescription?.description.replace(/\s+/g, " ").trim(),
      products: processingStatement?.products ?? [],
      productIndex,
      nextUri,
      lang,
      commodityCodes: Array.isArray(commodities)
        ? commodities.map((commodityCode: CodeAndDescription) => ({
            label: `${commodityCode.code} - ${commodityCode.description}`,
            value: commodityCode.code,
            description: commodityCode.description,
          }))
        : [],
      productDescriptionMaxLength,
      isEditing:
        currentProductDescription !== undefined &&
        !isEmpty(currentProductDescription.description) &&
        !isEmpty(currentProductDescription.commodityCode),
      csrf,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);

  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const nextUri = form.get("nextUri") as string;
  const isDraft = form.get("_action") === "saveAsDraft";
  const saveAndContinue = form.get("_action") === "saveAndContinue";
  const saveToRedisIfErrors = false;
  const commodityDescription = (values["consignmentDescription"] as string).replace(/\s+/g, " ").trim();
  const commodityCode = (values["commodityCode"] as string).split(" - ")[0];

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  if (saveAndContinue) {
    const errorResponse = await updateProcessingStatementProducts(
      bearerToken,
      documentNumber,
      {
        commodityCode,
        description: commodityDescription,
      },
      undefined,
      saveToRedisIfErrors
    );

    if (errorResponse) {
      return errorResponse as Response;
    }

    return redirect(`/create-processing-statement/${documentNumber}/add-catch-details`);
  }

  if (isDraft) {
    return redirect(route("/create-processing-statement/processing-statements"));
  }

  const response = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    {},
    `/create-processing-statement/${documentNumber}/add-consignment-details`,
    undefined,
    saveToRedisIfErrors
  );

  if (response) {
    return response;
  }

  // FIO-7801 - Scenario 1 - Add Catch type page going forward with at least 1 catch added
  // FI0-7801 - Scenario 2 - Add Catch type page going forward with no catches added
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  return addConsignmentDetailsActionHandler(documentNumber, processingStatement, nextUri);
};

const AddConsignmentDetails = () => {
  const { t } = useTranslation(["addConsignmentDetails", "common", "errorsText", "whatAreYouExporting"]);
  const {
    documentNumber,
    commodityCode,
    description,
    nextUri,
    lang,
    commodityCodes,
    productDescriptionMaxLength,
    productIndex,
    csrf,
  } = useLoaderData<loaderConsignmentDetails>();
  const isHydrated = useHydrated();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const [selectedCommodityCode, setSelectedCommodityCode] = useState<string | undefined>();

  const [currentProductDescription, setCurrentProductDescription] = useState<string | undefined>("");

  useEffect(() => {
    if (isEmpty(errors) && lang === null) {
      setCurrentProductDescription(description ?? "");
      setSelectedCommodityCode(
        commodityCodes.find((autoCompleteOption) => autoCompleteOption.value === commodityCode)?.label ?? ""
      );
    }
  }, [description, commodityCodes]);

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={route("/create-processing-statement/:documentNumber/add-exporter-details", { documentNumber })}>
      {!isEmpty(errors) && (
        <ErrorSummary
          errors={Object.keys(errors).map((key: string) => {
            if (key === "consignmentDescription") {
              return {
                key,
                message: errors[key].message,
                value: {
                  characterLimit: productDescriptionMaxLength,
                },
              };
            }

            return errors[key];
          })}
        />
      )}
      <div id="consignmentDescriptionEmpty" className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("addConsignmentDetailsConsignmentPageHeader")} />
          <div className="govuk-warning-text" data-testid="warning-message">
            {" "}
            <span className="govuk-warning-text__icon" aria-hidden="true">
              {" "}
              !{" "}
            </span>{" "}
            <strong className="govuk-warning-text__text">{t("addConsignmentDetailsWarningLabel")} </strong>{" "}
          </div>
          <SecureForm
            method="post"
            action={
              productIndex === undefined || productIndex === null
                ? `/create-processing-statement/${documentNumber}/add-consignment-details`
                : `/create-processing-statement/${documentNumber}/add-consignment-details/${productIndex}`
            }
            csrf={csrf}
          >
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <div
                  className={
                    isEmpty(errors?.commodityCode) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"
                  }
                >
                  <FormInput
                    containerClassName="govuk-form-group govuk-label--s"
                    label={t("addConsignmentDetailsConsignmentDescriptionHeader")}
                    name="consignmentDescription"
                    type="text"
                    inputProps={{
                      id: "consignmentDescription",
                      "aria-describedby": "hint-consignmentDescription",
                    }}
                    value={currentProductDescription}
                    data-testid="consignmentDescription"
                    inputClassName={isEmpty(errors) ? "govuk-input" : "govuk-input govuk-input--error"}
                    hint={{
                      id: "hint-consignmentDescription",
                      position: "above",
                      text: t("addConsignmentDetailsConsignmentPageHint", { journeyText: t("processingStatement") }),
                      className: "govuk-hint",
                    }}
                    errorProps={{ className: !isEmpty(errors) ? "govuk-error-message" : "" }}
                    staticErrorMessage={t(errors?.consignmentDescription?.message, { ns: "errorsText" })}
                    errorPosition={ErrorPosition.AFTER_LABEL}
                    containerClassNameError={!isEmpty(errors) ? "govuk-form-group--error" : ""}
                    onChange={(e) => setCurrentProductDescription(e.currentTarget.value)}
                    hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                    hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                  />
                  <label className="govuk-label govuk-label--s" htmlFor="commodityCode">
                    {t("commonCommodityCodeLabel", { ns: "common" })}
                  </label>
                  <div id="commodityCode-hint" className="govuk-hint">
                    {t("addConsignmentDetailsConsignmentDescriptionHint")}
                  </div>
                  <AutocompleteFormField
                    id="commodityCode"
                    name="commodityCode"
                    errorMessageText={t(errors?.commodityCode?.message, { ns: "errorsText" })}
                    defaultValue={selectedCommodityCode ?? commodityCode ?? ""}
                    options={
                      isHydrated
                        ? commodityCodes.map(({ label }) => label)
                        : ["", ...commodityCodes.map(({ label }) => label)]
                    }
                    optionsId="commodity-option"
                    labelClassName="govuk-label"
                    containerClassName={classNames("govuk-form-group govuk-!-width-full", {
                      "govuk-form-group--error": errors?.commodityCode?.message,
                    })}
                    selectProps={{
                      selectClassName: classNames("govuk-select govuk-!-width-full", {
                        "govuk-select--error": errors?.commodityCode?.message,
                      }),
                    }}
                    labelText={""}
                    inputProps={{
                      className: classNames("govuk-input", {
                        "govuk-input--error": errors?.commodityCode?.message,
                      }),
                      "aria-describedby": "commodityCode-hint",
                    }}
                    onSelected={(value) => setSelectedCommodityCode(value)}
                  />
                </div>
                <Details
                  summary={t("addConsignmentDetailsConsignmentHelpTitle")}
                  detailsClassName="govuk-details"
                  summaryClassName="govuk-details__summary"
                  detailsTextClassName="govuk-details__text"
                >
                  <p>
                    {t("addConsignmentDetailsConsignmentHelpText1")}{" "}
                    <a className="govuk-link" target="_blank" href="https://www.gov.uk/trade-tariff">
                      {t("addConsignmentDetailsConsignmentHelpText")}
                    </a>
                  </p>
                </Details>
              </div>
            </div>
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

export default AddConsignmentDetails;
