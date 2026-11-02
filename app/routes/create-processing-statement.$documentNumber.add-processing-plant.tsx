import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { getEnv } from "~/env.server";
import { route } from "routes-gen";
import { useLoaderData, redirect, type LoaderFunction, type ActionFunction, useActionData } from "react-router";
import { useTranslation } from "react-i18next";
import { BUTTON_TYPE, Button } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames";

import { Main, Title, BackToProgressLink, SecureForm, AutocompleteFormField, ErrorSummary } from "~/components";
import logger from "~/logger";
import { displayErrorMessagesInOrder, getTransformedError } from "~/helpers";
import {
  validateCSRFToken,
  getBearerTokenForRequest,
  updateProcessingStatement,
  processingStatemenGenericLoader,
  searchEstablishments,
  formatEstablishmentLabel,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import type { Establishment } from "~/types";

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

type AddProcessingPlantLoaderData = {
  documentNumber: string;
  csrf: string;
  plantName: string;
  plantApprovalNumber: string;
  savedPlantOption?: string;
  savedPlantDetails?: ProcessingPlantSearchResult;
  minCharsBeforeSearch: number;
  labels: ProcessingPlantSearchResult[];
  nextUri?: string;
};

// Non-JS posts the <select>'s label text ("Name (Approval) - Postcode") with no address fields.
// Use greedy matching so a trading name containing "(...)" (e.g. "Andy's Seafoods (Grimsby) Ltd")
// doesn't get misread as the approval number - the real approval number is always the last "(...)".
const parseEstablishmentLabel = (value: string): { plantName: string; plantApprovalNumber: string } => {
  const trimmed = value.trim();
  const match = /^(.*) \(([^)]*)\)(?:\s-\s.*)?$/.exec(trimmed);

  if (!match) {
    return { plantName: "", plantApprovalNumber: "" };
  }

  return {
    plantName: match[1].trim(),
    plantApprovalNumber: match[2].trim(),
  };
};

const saveDraftPlantSelection = async (
  bearerToken: string,
  documentNumber: string | undefined,
  plantData: { plantName: string; plantApprovalNumber: string },
  plantUrl: string,
  isNonJs: boolean
): Promise<void> => {
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
  const filteredData: Record<string, string | null> = { ...plantData };

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

  const minCharsBeforeSearch = Number.parseInt(getEnv().APPROVED_ESTABLISHMENT_SEARCH_MIN_LENGTH, 10);

  const contentType = genericLoaderResponse.headers.get("Content-Type") ?? "";
  if (genericLoaderResponse.status !== 200 || !contentType.includes("application/json")) {
    return genericLoaderResponse;
  }

  const loaderData = await genericLoaderResponse.clone().json();
  const { plantName, plantApprovalNumber, plantAddressOne, plantTownCity, plantPostcode, plantCounty, plantCountry } =
    loaderData;

  const establishments: Establishment[] = await searchEstablishments("processing", "");

  let savedPlantOption: string | undefined;
  let savedPlantDetails: ProcessingPlantSearchResult | undefined;

  if (plantName && plantApprovalNumber) {
    const matched = establishments.find(
      (establishment) =>
        establishment.approvalNumber?.content?.trim().toLowerCase() === plantApprovalNumber.trim().toLowerCase()
    );

    // Match the label format produced below for the full list, so the non-JS <select>'s
    // defaultValue lines up with one of its <option> values and shows as pre-selected.
    savedPlantOption = formatEstablishmentLabel(
      matched ?? {
        tradingName: plantName,
        approvalNumber: { content: plantApprovalNumber },
        address: { postCode: { code: plantPostcode } },
      }
    );

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
  }

  const labels: ProcessingPlantSearchResult[] = establishments.map((establishment) => ({
    label: formatEstablishmentLabel(establishment),
    tradingName: establishment.tradingName ?? "",
    approvalNumber: establishment.approvalNumber?.content ?? "",
    addressLine: [
      establishment.address?.line1,
      establishment.address?.line2,
      establishment.address?.line3,
      establishment.address?.line4,
    ]
      .filter(Boolean)
      .join(", "),
    cityName: establishment.address?.cityName ?? "",
    postcode: establishment.address?.postCode?.code ?? "",
    country:
      (typeof establishment.country === "string" ? establishment.country : establishment.country?.countryName) ??
      establishment.address?.country?.countryName ??
      "",
  }));

  // The saved plant may fall outside the default search page - add it so the non-JS
  // <select> still offers it as a (pre-selected) option.
  if (savedPlantOption && !labels.some((label) => label.label === savedPlantOption)) {
    labels.unshift({
      label: savedPlantOption,
      tradingName: plantName,
      approvalNumber: plantApprovalNumber,
      addressLine: plantAddressOne ?? "",
      cityName: plantTownCity ?? "",
      postcode: plantPostcode ?? "",
      country: plantCountry ?? "",
    });
  }

  return new Response(
    JSON.stringify({ ...loaderData, savedPlantOption, savedPlantDetails, minCharsBeforeSearch, labels }),
    {
      status: 200,
      headers: new Headers(genericLoaderResponse.headers),
    }
  );
};

export const action: ActionFunction = async ({ request, params }) => {
  const { documentNumber } = params;
  const form = await request.formData();
  const nextUri = form.get("nextUri") as string;
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
      route("/create-processing-statement/:documentNumber/add-processing-plant-address", { documentNumber }),
      {
        headers: { "Set-Cookie": await commitSession(session) },
      }
    );
  }

  const isNonJs = form.get("isNonJs") === "true";
  const processingPlant = (form.get("processingPlant") as string) ?? "";
  if (
    action === "saveAndContinue" &&
    !processingPlant.trim() &&
    (isNonJs || !((form.get("plantName") as string) ?? "").trim())
  ) {
    const errors = getTransformedError([{ key: "processingPlant", message: "psAddProcessingPlantErrorSelectPlant" }]);

    return new Response(JSON.stringify({ errors, processingPlant }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const bearerToken = await getBearerTokenForRequest(request);

  let payload = {
    plantName: (form.get("plantName") as string) ?? "",
    plantApprovalNumber: (form.get("plantApprovalNumber") as string) ?? "",
    plantAddressOne: (form.get("plantAddressOne") as string) ?? "",
    plantTownCity: (form.get("plantTownCity") as string) ?? "",
    plantCounty: (form.get("plantCounty") as string) ?? "",
    plantCityName: (form.get("plantCityName") as string) ?? "",
    plantPostcode: (form.get("plantPostcode") as string) ?? "",
    plantCountry: (form.get("plantCountry") as string) ?? "",
  };

  if (processingPlant.trim()) {
    const { plantName, plantApprovalNumber } = parseEstablishmentLabel(processingPlant);

    const establishments = plantApprovalNumber ? await searchEstablishments("processing", plantApprovalNumber) : [];
    const establishment = establishments.find(
      (candidate) =>
        candidate.approvalNumber?.content?.trim().toLowerCase() === plantApprovalNumber.trim().toLowerCase()
    );

    payload = {
      plantName: establishment?.tradingName ?? plantName,
      plantApprovalNumber,
      plantAddressOne: [
        establishment?.address?.line1,
        establishment?.address?.line2,
        establishment?.address?.line3,
        establishment?.address?.line4,
      ]
        .filter(Boolean)
        .join(", "),
      plantTownCity: establishment?.address?.cityName ?? "",
      plantCounty: "",
      plantCityName: "",
      plantPostcode: establishment?.address?.postCode?.code ?? "",
      plantCountry: establishment?.address?.country?.countryName ?? "",
    };
  }

  if (action === "saveAsDraft") {
    await saveDraftPlantSelection(
      bearerToken,
      documentNumber,
      payload as { plantName: string; plantApprovalNumber: string },
      "/create-processing-statement/:documentNumber/add-processing-plant",
      isNonJs
    );

    return redirect(route("/create-processing-statement/processing-statements"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

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

  const nextRoute = !isEmpty(nextUri)
    ? nextUri
    : route("/create-processing-statement/:documentNumber/add-processing-plant-details", {
        documentNumber,
      });

  return redirect(nextRoute, {
    headers: { "Set-Cookie": await commitSession(session) },
  });
};

const AddProcessingPlant = () => {
  const { t } = useTranslation(["addProcessingPlant", "common"]);
  const { documentNumber, csrf, savedPlantOption, savedPlantDetails, minCharsBeforeSearch, labels, nextUri } =
    useLoaderData<AddProcessingPlantLoaderData>();
  const actionData = useActionData() ?? {};
  const { errors = {}, processingPlant: submittedProcessingPlant } = actionData;
  // Plain mount-detection: useSyncExternalStore-based hydration hooks can get stuck
  // false after a hydration mismatch recovery re-render; this always eventually flips.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => setIsHydrated(true), []);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = searchContainerRef.current;
    if (!container) return;

    const syncAutocompleteAria = () => {
      const input = container.querySelector<HTMLInputElement>("#processingPlant");
      if (!input) return;

      const listbox = container.querySelector<HTMLElement>("#processingPlant__listbox");
      const activeOption = listbox?.querySelector<HTMLElement>('[role="option"][aria-selected="true"][id]');
      const expanded = Boolean(listbox);

      if (input.getAttribute("aria-expanded") !== String(expanded)) {
        input.setAttribute("aria-expanded", String(expanded));
      }

      if (listbox) {
        if (input.getAttribute("aria-controls") !== listbox.id) input.setAttribute("aria-controls", listbox.id);
        if (input.getAttribute("aria-owns") !== listbox.id) input.setAttribute("aria-owns", listbox.id);
      } else {
        input.removeAttribute("aria-controls");
        input.removeAttribute("aria-owns");
      }

      if (activeOption) {
        if (input.getAttribute("aria-activedescendant") !== activeOption.id) {
          input.setAttribute("aria-activedescendant", activeOption.id);
        }
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    };

    const observer = new MutationObserver(syncAutocompleteAria);
    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-expanded", "aria-controls", "aria-owns", "aria-activedescendant"],
    });
    syncAutocompleteAria();

    return () => observer.disconnect();
  }, [isHydrated]);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [processingPlantResults, setProcessingPlantResults] = useState<ProcessingPlantSearchResult[]>(labels);
  const [selectedPlant, setSelectedPlant] = useState<ProcessingPlantSearchResult | undefined>(savedPlantDetails);
  const [selectPlantOption, setSelectPlantOption] = useState<string | undefined>(
    submittedProcessingPlant ?? savedPlantOption
  );
  const processingPlantOptions = processingPlantResults.map((result) => result.label);
  const showNoResultsMessage =
    isHydrated && searchTerm.trim().length >= minCharsBeforeSearch && processingPlantResults.length === 0;

  const handlePlantSelected = (label: string) => {
    const match = processingPlantResults.find((result) => result.label === label);
    if (match) {
      setSelectedPlant(match);
      setSelectPlantOption(label);
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
        setProcessingPlantResults(plantOptions ?? []);
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
      {!isEmpty(errors) && (
        <ErrorSummary
          errors={displayErrorMessagesInOrder(errors, ["processingPlant", "plantName", "plantApprovalNumber"])}
        />
      )}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds" ref={searchContainerRef}>
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
                    setSelectPlantOption("");
                    setSearchTerm("");
                  }}
                >
                  {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                </a>
                <input type="hidden" name="plantName" value={selectedPlant.tradingName} />
                <input type="hidden" name="plantApprovalNumber" value={selectedPlant.approvalNumber} />
                <input type="hidden" name="plantAddressOne" value={selectedPlant.addressLine ?? ""} />
                <input type="hidden" name="plantCounty" value={selectedPlant.county ?? ""} />
                <input type="hidden" name="plantTownCity" value={selectedPlant.cityName ?? ""} />
                <input type="hidden" name="plantPostcode" value={selectedPlant.postcode ?? ""} />
                <input type="hidden" name="plantCountry" value={selectedPlant.country ?? ""} />
              </div>
            ) : (
              <AutocompleteFormField
                id="processingPlant"
                name="processingPlant"
                options={processingPlantOptions}
                optionsId="processing-plant-option"
                errorMessageText={
                  errors?.processingPlant ? t(errors?.processingPlant?.message ?? "", { ns: "errorsText" }) : ""
                }
                errorVisuallyHiddenText={{
                  text: t("commonErrorText", { ns: "errorsText" }),
                  className: "govuk-visually-hidden",
                }}
                defaultValue={selectPlantOption ?? ""}
                labelText={t("psAddProcessingPlantLabel")}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                hintText={t("psAddProcessingPlantHint")}
                containerClassName={classNames(
                  !isHydrated ? "govuk-form-group app-processing-plant-nonjs-only" : "govuk-form-group",
                  {
                    "govuk-form-group--error": errors?.processingPlant,
                  }
                )}
                selectProps={{
                  selectClassName: "govuk-select govuk-!-width-full",
                  nullOption: t("psAddProcessingPlantSelectPlaceholder"),
                }}
                inputProps={{
                  id: "processingPlant",
                  className: classNames("govuk-input govuk-!-width-full", {
                    "govuk-input--error": errors?.processingPlant,
                  }),
                }}
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
                className="govuk-button govuk-button--secondary app-processing-plant-manual-entry"
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                value="navigateToManualAddress"
                data-testid="manual-entry-button"
              />
            </div>
            <input type="hidden" name="isNonJs" value={(!isHydrated).toString()} />
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

export default AddProcessingPlant;
