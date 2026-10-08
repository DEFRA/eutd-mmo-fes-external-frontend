import * as React from "react";
import { useEffect, useState } from "react";
import { route } from "routes-gen";
import { useLoaderData, redirect, type LoaderFunction, type ActionFunction, useActionData } from "react-router";
import { useTranslation } from "react-i18next";
import { BUTTON_TYPE, Button, FormInput } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames";

import {
  Main,
  Title,
  BackToProgressLink,
  SecureForm,
  AutocompleteFormField,
  ErrorMessage,
  ErrorSummary,
} from "~/components";
import { useIsHydrated } from "~/hooks";
import logger from "~/logger";
import { displayErrorMessagesInOrder } from "~/helpers";
import {
  validateCSRFToken,
  formatEstablishmentLabel,
  getBearerTokenForRequest,
  updateProcessingStatement,
  getProcessingPlants,
  matchEstablishment,
  processingStatemenGenericLoader,
  mapEstablishmentToPlantAddress,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { commitSession, getSessionFromRequest } from "~/sessions.server";

type ProcessingPlantSearchResult = {
  label: string;
  tradingName: string;
  approvalNumber: string;
  addressLine: string;
  cityName: string;
  postcode: string;
  county?: string;
  country?: string;
};

type LoaderData = {
  documentNumber: string;
  csrf: string;
  plantName: string;
  plantApprovalNumber: string;
  savedPlantOption?: string;
  savedPlantDetails?: ProcessingPlantSearchResult;
};

const minCharsBeforeSearch = 2;

const parseEstablishmentLabel = (value: string): { plantName: string; plantApprovalNumber: string } => {
  const trimmed = value.trim();
  const match = /^(.*?) \(([^)]*)\)/.exec(trimmed);

  if (!match) {
    return { plantName: "", plantApprovalNumber: "" };
  }

  return {
    plantName: match[1].trim(),
    plantApprovalNumber: match[2].trim(),
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const genericLoaderResponse = await processingStatemenGenericLoader(request, params, [
    "plantName",
    "plantApprovalNumber",
    "plantAddressOne",
    "plantSubBuildingName",
    "plantBuildingName",
    "plantStreetName",
    "plantCounty",
    "plantCountry",
    "plantTownCity",
    "plantPostcode",
  ]);

  const contentType = genericLoaderResponse.headers.get("Content-Type") ?? "";
  if (genericLoaderResponse.status !== 200 || !contentType.includes("application/json")) {
    return genericLoaderResponse;
  }

  const loaderData = await genericLoaderResponse.clone().json();
  const {
    plantName,
    plantApprovalNumber,
    plantAddressOne,
    plantSubBuildingName,
    plantBuildingName,
    plantStreetName,
    plantTownCity,
    plantPostcode,
    plantCounty,
    plantCountry,
  } = loaderData;

  let savedPlantOption: string | undefined;
  let savedPlantDetails: ProcessingPlantSearchResult | undefined;
  if (plantName && plantApprovalNumber) {
    const establishments = await getProcessingPlants();
    const matched = matchEstablishment(establishments, plantName, plantApprovalNumber);
    savedPlantOption = matched ? formatEstablishmentLabel(matched) : `${plantName} (${plantApprovalNumber})`;

    const hasManualAddressOverride =
      !isEmpty(plantAddressOne) ||
      !isEmpty(plantSubBuildingName) ||
      !isEmpty(plantBuildingName) ||
      !isEmpty(plantStreetName) ||
      !isEmpty(plantTownCity) ||
      !isEmpty(plantPostcode) ||
      !isEmpty(plantCounty) ||
      !isEmpty(plantCountry);

    if (hasManualAddressOverride) {
      savedPlantDetails = {
        label: savedPlantOption,
        tradingName: plantName,
        approvalNumber: plantApprovalNumber,
        addressLine: plantAddressOne ?? "",
        cityName: plantTownCity ?? "",
        postcode: plantPostcode ?? "",
        county: plantCounty ?? "",
        country: plantCountry ?? "",
      };
    } else if (matched) {
      savedPlantDetails = {
        label: savedPlantOption,
        tradingName: plantName,
        approvalNumber: plantApprovalNumber,
        addressLine: matched.address?.line1 ?? "",
        cityName: matched.address?.cityName ?? "",
        postcode: matched.address?.postCode?.code ?? "",
        county: matched.address?.line4 ?? "",
        country: matched.address?.country?.countryName ?? "",
      };
    }
  }

  return new Response(JSON.stringify({ ...loaderData, savedPlantOption, savedPlantDetails }), {
    status: 200,
    headers: new Headers(genericLoaderResponse.headers),
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { documentNumber } = params;
  const form = await request.formData();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const session = await getSessionFromRequest(request);
  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");
  session.unset("csrf");

  const action = form.get("_action");

  if (action === "navigateToManualAddress") {
    return redirect(
      route("/create-processing-statement/:documentNumber/what-processing-plant-address", { documentNumber }),
      {
        headers: { "Set-Cookie": await commitSession(session) },
      }
    );
  }

  const submittedPlant = (form.get("processingPlant") as string) ?? "";
  const isNonJs = form.get("isNonJs") === "true";
  const parsedProcessingPlant = parseEstablishmentLabel(submittedPlant);
  const plantName = isNonJs ? (form.get("plantName") as string) ?? "" : parsedProcessingPlant.plantName;
  const plantApprovalNumber = isNonJs
    ? (form.get("plantApprovalNumber") as string) ?? ""
    : parsedProcessingPlant.plantApprovalNumber;

  const establishments = await getProcessingPlants();
  const hasSubmittedPlant = !isEmpty(plantName) || !isEmpty(plantApprovalNumber);
  const matchedEstablishment = hasSubmittedPlant
    ? matchEstablishment(establishments, plantName, plantApprovalNumber)
    : undefined;

  const bearerToken = await getBearerTokenForRequest(request);
  const payload = matchedEstablishment
    ? {
        plantName: matchedEstablishment.tradingName,
        plantApprovalNumber: matchedEstablishment.approvalNumber?.content,
        ...mapEstablishmentToPlantAddress(matchedEstablishment),
        plantSubBuildingName: "",
        plantBuildingName: "",
        plantStreetName: "",
        plantCounty: "",
      }
    : {
        plantName,
        plantApprovalNumber,
      };

  const errorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    payload,
    "/create-processing-statement/:documentNumber/add-processing-plant",
    undefined,
    false,
    true,
    undefined,
    isNonJs
  );

  if (errorResponse) {
    return errorResponse as Response;
  }

  return redirect(
    route("/create-processing-statement/:documentNumber/add-processing-plant-details", { documentNumber }),
    {
      headers: { "Set-Cookie": await commitSession(session) },
    }
  );
};

const AddProcessingPlant = () => {
  const { t } = useTranslation(["addProcessingPlant", "common"]);
  const { documentNumber, csrf, plantName, plantApprovalNumber, savedPlantOption, savedPlantDetails } =
    useLoaderData<LoaderData>();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const isHydrated = useIsHydrated();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [processingPlantResults, setProcessingPlantResults] = useState<ProcessingPlantSearchResult[]>(
    savedPlantDetails ? [savedPlantDetails] : []
  );
  const [selectedPlant, setSelectedPlant] = useState<ProcessingPlantSearchResult | undefined>(savedPlantDetails);
  const processingPlantOptions = processingPlantResults.map((result) => result.label);
  const showNoResultsMessage =
    isHydrated && searchTerm.trim().length >= minCharsBeforeSearch && processingPlantResults.length === 0;

  const handlePlantSelected = (label: string) => {
    const match = processingPlantResults.find((result) => result.label === label);
    if (match) {
      setSelectedPlant(match);
    }
  };

  useEffect(() => {
    const getProcessingPlantsOptions = async (): Promise<void> => {
      if (searchTerm.length < minCharsBeforeSearch) {
        setProcessingPlantResults((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      try {
        const response = await fetch(`/get-processing-plants?search=${searchTerm}`);
        const plantOptions: ProcessingPlantSearchResult[] = await response.json();
        const fresh = plantOptions ?? [];
        const merged =
          savedPlantDetails && !fresh.some((result) => result.label === savedPlantDetails.label)
            ? [savedPlantDetails, ...fresh]
            : fresh;
        setProcessingPlantResults(merged);
      } catch (e) {
        logger.info("[ADD-PROCESSING-PLANT][GET-PROCESSING-PLANTS][ERROR]");
        if (e instanceof Error) {
          logger.error(e);
        }

        setProcessingPlantResults((prev) => (prev.length === 0 ? prev : []));
      }
    };

    void getProcessingPlantsOptions();
  }, [searchTerm, savedPlantDetails]);

  return (
    <Main backUrl={route("/create-processing-statement/:documentNumber/catch-added", { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, ["plantName"])} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <Title title={t("psAddProcessingPlantHeading", { ns: "addProcessingPlant" })} />
          <SecureForm method="post" csrf={csrf}>
            {isHydrated && selectedPlant ? (
              <div className="govuk-!-margin-bottom-6 app-selected-address">
                <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                  {selectedPlant.tradingName}
                </p>
                <p className="govuk-body govuk-!-margin-bottom-1">
                  {t("psAddProcessingPlantSummaryApprovalNumberLabel", { ns: "addProcessingPlant" })}:{" "}
                  {selectedPlant.approvalNumber}
                </p>
                {selectedPlant.addressLine && (
                  <p className="govuk-body govuk-!-margin-bottom-1">{selectedPlant.addressLine}</p>
                )}
                {selectedPlant.cityName && (
                  <p className="govuk-body govuk-!-margin-bottom-1">{selectedPlant.cityName}</p>
                )}
                {selectedPlant.postcode && (
                  <p className="govuk-body govuk-!-margin-bottom-1">{selectedPlant.postcode}</p>
                )}
                <a
                  href="#"
                  className="govuk-link"
                  data-testid="change-processing-plant"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedPlant(undefined);
                    setSearchTerm("");
                  }}
                >
                  {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                </a>
                <input type="hidden" name="processingPlant" value={selectedPlant.label} />
              </div>
            ) : (
              <AutocompleteFormField
                id="processingPlant"
                name="processingPlant"
                options={processingPlantOptions}
                optionsId="processing-plant-option"
                errorMessageText={errors?.plantName ? t(errors?.plantName?.message ?? "", { ns: "errorsText" }) : ""}
                defaultValue={savedPlantOption ?? ""}
                labelText={isHydrated ? t("psAddProcessingPlantLabel") : undefined}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                hintText={isHydrated ? t("psAddProcessingPlantHint") : undefined}
                containerClassName={classNames("govuk-form-group", {
                  "govuk-form-group--error": errors?.plantName,
                })}
                selectProps={{
                  selectClassName: "govuk-select govuk-!-width-full",
                }}
                inputProps={{
                  id: "processingPlant",
                  className: classNames("govuk-input govuk-!-width-full", {
                    "govuk-input--error": errors?.plantName,
                  }),
                }}
                customNonJSComp={
                  isHydrated ? undefined : (
                    <>
                      {savedPlantDetails && (
                        <div className="govuk-!-margin-bottom-6 app-selected-address">
                          <strong>
                            {t("psAddProcessingPlantAddressSummaryHeading", { ns: "addProcessingPlant" })}
                          </strong>
                          <br />
                          <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">{plantName}</p>
                          <p className="govuk-body govuk-!-margin-bottom-1">
                            {t("psAddProcessingPlantSummaryApprovalNumberLabel", { ns: "addProcessingPlant" })}:{" "}
                            {savedPlantDetails?.approvalNumber}
                          </p>
                          {savedPlantDetails?.addressLine && (
                            <p className="govuk-body govuk-!-margin-bottom-1">{savedPlantDetails.addressLine}</p>
                          )}
                          {savedPlantDetails?.cityName && (
                            <p className="govuk-body govuk-!-margin-bottom-1">{savedPlantDetails.cityName}</p>
                          )}
                          {savedPlantDetails?.postcode && (
                            <p className="govuk-body govuk-!-margin-bottom-1">{savedPlantDetails.postcode}</p>
                          )}
                        </div>
                      )}
                      {!isEmpty(errors?.plantName) && (
                        <ErrorMessage
                          id="plantName-error"
                          text={t(errors?.plantName?.message ?? "", { ns: "errorsText" })}
                          visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                        />
                      )}
                      <FormInput
                        containerClassName={classNames("govuk-form-group govuk-!-two-thirds", {
                          "govuk-form-group--error": errors?.plantName,
                        })}
                        label={t("psAddProcessingPlantNameLabel", { ns: "addProcessingPlant" })}
                        labelClassName="govuk-label govuk-!-font-weight-bold"
                        name="plantName"
                        type="text"
                        inputClassName={classNames("govuk-input", {
                          "govuk-input--error": errors?.plantName,
                        })}
                        inputProps={{
                          defaultValue: plantName,
                          id: "plantName",
                          className: "govuk-input govuk-!-width-two-thirds",
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
                        containerClassName={classNames("govuk-form-group govuk-!-two-thirds", {
                          "govuk-form-group--error": errors?.plantApprovalNumber,
                        })}
                        label={t("psAddProcessingPlantApprovalNumberLabel", { ns: "addProcessingPlant" })}
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
                          className: "govuk-input govuk-!-width-two-thirds",
                        }}
                        hint={{
                          id: "hint-plantApprovalNumber",
                          position: "above",
                          text: t("psAddProcessingPlantApprovalNumberHint", { ns: "addProcessingPlant" }),
                          className: "govuk-hint",
                        }}
                        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                      />
                    </>
                  )
                }
                onChange={setSearchTerm}
                onSelected={handlePlantSelected}
                minCharsBeforeSearch={minCharsBeforeSearch}
                notFoundText=""
              />
            )}
            <div role="status" aria-live="polite" aria-atomic="true">
              {showNoResultsMessage && (
                <p className="govuk-body" data-testid="no-processing-plant-results">
                  <strong className="govuk-!-font-weight-bold">
                    {t("psAddProcessingPlantNoResultsHeading", { ns: "addProcessingPlant" })}
                  </strong>
                  <br />
                  {t("psAddProcessingPlantNoResultsCheckDetails", { ns: "addProcessingPlant" })}
                  <br />
                  {t("psAddProcessingPlantNoResultsEnterManually", { ns: "addProcessingPlant" })}
                  <br />
                  {t("psAddProcessingPlantNoResultsHint", { ns: "addProcessingPlant" })}
                </p>
              )}
            </div>
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
              <Button
                id="navigateToManualAddress"
                label={t("psAddProcessingPlantManualButton")}
                className="govuk-button govuk-button--secondary"
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                value="navigateToManualAddress"
                data-testid="manual-entry-button"
              />
            </div>
            <input type="hidden" name="isNonJs" value={(!isHydrated).toString()} />
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

export default AddProcessingPlant;
