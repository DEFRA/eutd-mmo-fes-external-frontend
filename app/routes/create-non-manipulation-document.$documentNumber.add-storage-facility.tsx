import * as React from "react";
import { useEffect, useState } from "react";
import { route } from "routes-gen";
import { useLoaderData, redirect, type LoaderFunction, type ActionFunction, useActionData } from "react-router";
import { useTranslation } from "react-i18next";
import { BUTTON_TYPE, Button, FormSelect } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames";

import { Main, Title, BackToProgressLink, SecureForm, AutocompleteFormField, ErrorSummary } from "~/components";
import { useIsHydrated } from "~/hooks";
import setApiMock from "tests/msw/helpers/setApiMock";
import logger from "~/logger";
import { displayErrorMessagesInOrder, getTransformedError } from "~/helpers";
import {
  validateCSRFToken,
  formatEstablishmentLabel,
  matchEstablishment,
  searchEstablishments,
  getBearerTokenForRequest,
  getStorageDocument,
  getStorageFacilities,
  getStorageFacilitiesNoJs,
  mapEstablishmentToFacilityAddress,
  updateStorageDocumentFacility,
  createCSRFToken,
  instanceOfUnauthorised,
  validateResponseData,
} from "~/.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import isEmpty from "lodash/isEmpty";
import type { StorageDocument, IUnauthorised, Establishment } from "~/types";

type StorageFacilitySearchResult = {
  label: string;
  tradingName: string;
  approvalNumber: string;
  addressLine: string;
  cityName: string;
  postcode: string;
};

type LoaderData = {
  documentNumber: string;
  csrf: string;
  nextUri?: string;
  backUrl: string;
  savedFacilityOption?: string;
  savedFacilityDetails?: StorageFacilitySearchResult;
  facilityOptionsNoJs: string[];
};

const minCharsBeforeSearch = 2;

const whichStorageFacilityUri = "/create-non-manipulation-document/:documentNumber/add-storage-facility";

const keepStorageAutocompleteFocusedOnOptionMouseDown = (event: React.MouseEvent<HTMLFormElement>) => {
  if (event.target instanceof Element && event.target.closest(".autocomplete__option")) {
    event.preventDefault();
  }
};

const getArrivalBackUrl = (request: Request, documentNumber: string | undefined, storageDocument: StorageDocument) => {
  const url = new URL(request.url);
  const arrivalVehicleParam = url.searchParams.get("arrivalVehicle");
  const arrivalVehicle = arrivalVehicleParam ?? storageDocument?.arrivalTransport?.vehicle;

  if (arrivalVehicle) {
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
        { documentNumber }
      ),
    };

    return (
      arrivalTransportRoutes[arrivalVehicle] ??
      route("/create-non-manipulation-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk", {
        documentNumber,
      })
    );
  }

  return route("/create-non-manipulation-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk", {
    documentNumber,
  });
};

export const loader: LoaderFunction = async ({ request, params }) => {
  setApiMock(request.url);
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";

  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  if (instanceOfUnauthorised(storageDocument)) {
    return redirect("/forbidden");
  }

  validateResponseData(storageDocument);

  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);
  // Clear any leftover what-storage-facility-address wizard state from a previous, possibly
  // abandoned, manual-entry attempt so a fresh "Enter facility details manually" click there
  // doesn't come back pre-filled with a stale postcode/address.
  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");

  const sd = storageDocument as StorageDocument;
  const [establishments, noJsFacilityOptions] = await Promise.all([getStorageFacilities(), getStorageFacilitiesNoJs()]);
  let facilityOptionsNoJs = noJsFacilityOptions;

  const matched = matchEstablishment(establishments, sd.facilityName, sd.facilityApprovalNumber);
  // The facility name is optional here - a manual address can be saved (via "Enter facility
  // details manually") before a name is collected on the following add-storage-facility-details page.
  const hasManualAddress = !isEmpty(sd.facilityAddressOne);

  let savedFacilityOption: string | undefined;
  let savedFacilityDetails: StorageFacilitySearchResult | undefined;

  if (matched) {
    savedFacilityOption = formatEstablishmentLabel(matched);
    const address = mapEstablishmentToFacilityAddress(matched);
    savedFacilityDetails = {
      label: savedFacilityOption,
      tradingName: matched.tradingName ?? "",
      approvalNumber: matched.approvalNumber?.content ?? "",
      addressLine: address.facilityAddressOne ?? "",
      cityName: address.facilityTownCity ?? "",
      postcode: address.facilityPostcode ?? "",
    };
  } else if (hasManualAddress) {
    savedFacilityOption = isEmpty(sd.facilityName)
      ? sd.facilityAddressOne
      : `${sd.facilityName} (${sd.facilityApprovalNumber ?? ""})`.trim();
    savedFacilityDetails = {
      label: savedFacilityOption ?? "",
      tradingName: sd.facilityName ?? "",
      approvalNumber: sd.facilityApprovalNumber ?? "",
      addressLine: sd.facilityAddressOne ?? "",
      cityName: sd.facilityTownCity ?? "",
      postcode: sd.facilityPostcode ?? "",
    };
  }

  if (savedFacilityOption && !facilityOptionsNoJs.includes(savedFacilityOption)) {
    const firstFacilityOption = facilityOptionsNoJs[0] === "" ? 1 : 0;
    facilityOptionsNoJs = [
      ...facilityOptionsNoJs.slice(0, firstFacilityOption),
      savedFacilityOption,
      ...facilityOptionsNoJs.slice(firstFacilityOption),
    ];
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      nextUri,
      backUrl: getArrivalBackUrl(request, documentNumber, sd),
      savedFacilityOption,
      savedFacilityDetails,
      facilityOptionsNoJs,
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

type ResolvedStorageFacilitySelection = {
  facilityName: string;
  facilityApprovalNumber: string;
  facilityAddress: Partial<StorageDocument>;
};

const resolveStorageFacilitySelection = async (
  form: FormData,
  isNonJs: boolean
): Promise<ResolvedStorageFacilitySelection> => {
  let facilityName = "";
  let facilityApprovalNumber = "";
  let facilityAddress: Partial<StorageDocument> = {};
  let matchedEstablishment: Establishment | undefined;
  const submittedFacilityLabel = ((form.get("storageFacility") as string) ?? "").trim();

  if (form.has("storageFacility") && !submittedFacilityLabel) {
    return { facilityName, facilityApprovalNumber, facilityAddress };
  }

  if (isNonJs) {
    const establishments: Establishment[] = await searchEstablishments("storage", "");
    matchedEstablishment = establishments.find((e) => formatEstablishmentLabel(e) === submittedFacilityLabel);

    if (matchedEstablishment) {
      facilityName = matchedEstablishment.tradingName ?? "";
      facilityApprovalNumber = matchedEstablishment.approvalNumber?.content ?? "";
      facilityAddress = mapEstablishmentToFacilityAddress(matchedEstablishment);
    }
  } else {
    facilityName = ((form.get("facilityName") as string) ?? "").trim();
    facilityApprovalNumber = ((form.get("facilityApprovalNumber") as string) ?? "").trim();
    facilityAddress = {
      facilityAddressOne: (form.get("facilityAddressOne") as string) ?? "",
      facilityTownCity: (form.get("facilityTownCity") as string) ?? "",
      facilityPostcode: (form.get("facilityPostcode") as string) ?? "",
      facilityCountry: (form.get("facilityCountry") as string) ?? "",
    };

    const establishments = await getStorageFacilities();
    if (submittedFacilityLabel) {
      matchedEstablishment = establishments.find((e) => formatEstablishmentLabel(e) === submittedFacilityLabel);
    } else if (!isEmpty(facilityName)) {
      matchedEstablishment = matchEstablishment(establishments, facilityName, facilityApprovalNumber);
    }

    if (matchedEstablishment) {
      facilityName = matchedEstablishment.tradingName ?? facilityName;
      facilityApprovalNumber = matchedEstablishment.approvalNumber?.content ?? facilityApprovalNumber;
      facilityAddress = {
        ...mapEstablishmentToFacilityAddress(matchedEstablishment),
        facilityBuildingNumber: "",
        facilitySubBuildingName: "",
        facilityBuildingName: "",
        facilityStreetName: "",
        facilityCounty: "",
      };
    }
  }

  return { facilityName, facilityApprovalNumber, facilityAddress };
};

const handleEmptyStorageFacilitySelection = async (
  bearerToken: string,
  documentNumber: string | undefined,
  nextUri: string,
  submittedFacilityLabel: string
): Promise<Response> => {
  const existingDocument = await getStorageDocument(bearerToken, documentNumber);
  const hasExistingManualAddress =
    !instanceOfUnauthorised(existingDocument) && !isEmpty((existingDocument as StorageDocument).facilityAddressOne);

  if (hasExistingManualAddress && submittedFacilityLabel) {
    return redirect(
      isEmpty(nextUri)
        ? route("/create-non-manipulation-document/:documentNumber/add-storage-facility-details", {
            documentNumber,
          })
        : nextUri
    );
  }

  const errors = getTransformedError([{ key: "storageFacility", message: "sdWhichStorageFacilitySelectError" }]);

  return new Response(JSON.stringify({ errors, submittedFacilityLabel }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { documentNumber } = params;
  const form = await request.formData();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const _action = form.get("_action");

  if (_action === "navigateToManualAddress") {
    return redirect(
      route("/create-non-manipulation-document/:documentNumber/what-storage-facility-address", { documentNumber })
    );
  }

  const isNonJs = form.get("isNonJs") === "true";
  const bearerToken = await getBearerTokenForRequest(request);
  const { facilityName, facilityApprovalNumber, facilityAddress } = await resolveStorageFacilitySelection(
    form,
    isNonJs
  );

  const nextUri = form.get("nextUri") as string;
  const hasSelection = !isEmpty(facilityName) || !isEmpty(facilityAddress.facilityAddressOne);

  if (!hasSelection) {
    return handleEmptyStorageFacilitySelection(
      bearerToken,
      documentNumber,
      nextUri,
      ((form.get("storageFacility") as string) ?? "").trim()
    );
  }

  const errorResponse = await updateStorageDocumentFacility(
    bearerToken,
    documentNumber,
    whichStorageFacilityUri,
    false,
    undefined,
    {
      facilityName,
      facilityApprovalNumber,
      ...facilityAddress,
    }
  );

  if (errorResponse) {
    return errorResponse as Response;
  }

  return redirect(
    isEmpty(nextUri)
      ? route("/create-non-manipulation-document/:documentNumber/add-storage-facility-details", { documentNumber })
      : nextUri
  );
};

const WhichStorageFacility = () => {
  const { t } = useTranslation(["whichStorageFacility", "common"]);
  const { documentNumber, csrf, nextUri, backUrl, savedFacilityOption, savedFacilityDetails, facilityOptionsNoJs } =
    useLoaderData<LoaderData>();
  const actionData = useActionData() ?? {};
  const { errors = {}, submittedFacilityLabel } = actionData;
  const isHydrated = useIsHydrated();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [facilitySearchDefaultValue, setFacilitySearchDefaultValue] = useState(savedFacilityOption ?? "");
  const [facilityResults, setFacilityResults] = useState<StorageFacilitySearchResult[]>(
    savedFacilityDetails ? [savedFacilityDetails] : []
  );
  const [selectedFacility, setSelectedFacility] = useState<StorageFacilitySearchResult | undefined>(
    savedFacilityDetails
  );
  const [facilityBeingChanged, setFacilityBeingChanged] = useState<StorageFacilitySearchResult | undefined>();
  const facilityOptions = facilityResults.map((result) => result.label);
  const showNoResultsMessage =
    isHydrated && searchTerm.trim().length >= minCharsBeforeSearch && facilityResults.length === 0;
  const [noResultsHeading, noResultsSearchHint, noResultsManualEntryHint] = t(
    "sdWhichStorageFacilityNoResultsFound"
  ).split("\n");

  const handleFacilitySelected = (label: string) => {
    const match = facilityResults.find((result) => {
      const option = document.createElement("span");
      option.textContent = result.label;
      return result.label === label || option.innerHTML === label;
    });
    if (match) {
      setSelectedFacility(match);
      setFacilityBeingChanged(undefined);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const searchStorageFacilities = async (): Promise<void> => {
      if (searchTerm.length < minCharsBeforeSearch) {
        setFacilityResults((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      try {
        const response = await fetch(`/get-storage-facilities?search=${encodeURIComponent(searchTerm)}`, {
          signal: controller.signal,
        });
        const facilities: StorageFacilitySearchResult[] = await response.json();
        if (active) setFacilityResults(facilities ?? []);
      } catch (e) {
        if (!active) return;
        logger.info("[ADD-STORAGE-FACILITY][GET-STORAGE-FACILITIES][ERROR]");
        if (e instanceof Error) {
          logger.error(e);
        }

        setFacilityResults((prev) => (prev.length === 0 ? prev : []));
      }
    };

    void searchStorageFacilities();
    return () => {
      active = false;
      controller.abort();
    };
  }, [searchTerm]);

  const getNonJsOptions = () => facilityOptionsNoJs.filter(Boolean);
  const facilityToSubmit = selectedFacility ?? facilityBeingChanged;

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, ["storageFacility"])} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <Title title={t("sdWhichStorageFacilityHeading")} />
          <SecureForm method="post" csrf={csrf} onMouseDown={keepStorageAutocompleteFocusedOnOptionMouseDown}>
            {isHydrated && selectedFacility && !errors?.storageFacility ? (
              <div className="app-establishment-summary govuk-!-margin-bottom-6" data-testid="selected-facility">
                <p className="govuk-body govuk-!-font-weight-bold govuk-!-margin-bottom-1">
                  {selectedFacility.tradingName || selectedFacility.addressLine}
                </p>
                {selectedFacility.approvalNumber && (
                  <p className="govuk-body govuk-!-margin-bottom-1">
                    {t("sdWhichStorageFacilityApprovalNumberLabel")}: {selectedFacility.approvalNumber}
                  </p>
                )}
                {selectedFacility.tradingName && selectedFacility.addressLine && (
                  <p className="govuk-body govuk-!-margin-bottom-1">{selectedFacility.addressLine}</p>
                )}
                {selectedFacility.cityName && (
                  <p className="govuk-body govuk-!-margin-bottom-1">{selectedFacility.cityName}</p>
                )}
                {selectedFacility.postcode && (
                  <p className="govuk-body govuk-!-margin-bottom-1">{selectedFacility.postcode}</p>
                )}
                <button
                  type="button"
                  className="app-change-button"
                  data-testid="change-storage-facility"
                  onClick={() => {
                    setFacilityBeingChanged(undefined);
                    setSelectedFacility(undefined);
                    setFacilitySearchDefaultValue("");
                    setSearchTerm("");
                  }}
                >
                  {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                </button>
              </div>
            ) : (
              <>
                {!isHydrated && !savedFacilityDetails && (
                  <div className="govuk-form-group app-storage-facility-placeholder">
                    <label className="govuk-label govuk-!-font-weight-bold" htmlFor="storageFacility-placeholder">
                      {t("sdWhichStorageFacilityLabel")}
                    </label>
                    <div className="govuk-hint">{t("sdWhichStorageFacilityHint")}</div>
                    <input
                      className="govuk-input govuk-!-width-full"
                      id="storageFacility-placeholder"
                      type="text"
                      disabled
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  </div>
                )}
                <AutocompleteFormField
                  id="storageFacility"
                  name="storageFacility"
                  options={isHydrated ? facilityOptions : getNonJsOptions()}
                  optionsId="storage-facility-option"
                  errorMessageText={
                    errors?.storageFacility ? t(errors?.storageFacility?.message ?? "", { ns: "errorsText" }) : ""
                  }
                  defaultValue={submittedFacilityLabel ?? selectedFacility?.label ?? facilitySearchDefaultValue}
                  labelText={isHydrated ? t("sdWhichStorageFacilityLabel") : undefined}
                  labelClassName="govuk-label govuk-!-font-weight-bold"
                  hintText={isHydrated ? t("sdWhichStorageFacilityHint") : undefined}
                  containerClassName={classNames("govuk-form-group", {
                    "govuk-form-group--error": errors?.storageFacility,
                  })}
                  selectProps={{
                    selectClassName: "govuk-select govuk-!-width-full",
                  }}
                  customNonJSComp={
                    isHydrated ? undefined : (
                      <div className="app-storage-facility-nonjs-only">
                        <label className="govuk-label govuk-!-font-weight-bold" htmlFor="storageFacility">
                          {t("sdWhichStorageFacilityLabel")}
                        </label>
                        <div className="govuk-hint">{t("sdWhichStorageFacilityHint")}</div>
                        <FormSelect
                          name="storageFacility"
                          id="storageFacility"
                          options={getNonJsOptions()}
                          defaultValue={submittedFacilityLabel ?? savedFacilityOption ?? ""}
                          nullOption={t("sdWhichStorageFacilitySelectPlaceholder")}
                          selectClassName="govuk-select govuk-!-width-full app-storage-facility-non-js-select"
                        />
                      </div>
                    )
                  }
                  inputProps={{
                    id: "storageFacility",
                    className: classNames("govuk-input govuk-!-width-full", {
                      "govuk-input--error": errors?.storageFacility,
                    }),
                    onInput: (event) => {
                      if (!event.currentTarget.value.trim()) {
                        setSearchTerm("");
                        setFacilityBeingChanged(undefined);
                        setFacilitySearchDefaultValue("");
                      }
                    },
                    onFocus: (event) => {
                      if (facilitySearchDefaultValue) {
                        event.currentTarget.select();
                      }
                    },
                  }}
                  onChange={(value) => {
                    setSearchTerm(value);
                    setFacilityBeingChanged(undefined);
                    setFacilitySearchDefaultValue("");
                  }}
                  onSelected={handleFacilitySelected}
                  minCharsBeforeSearch={minCharsBeforeSearch}
                  notFoundText=""
                />
                <div role="status" aria-live="polite" aria-atomic="true">
                  {showNoResultsMessage && (
                    <p className="govuk-body" data-testid="no-storage-facility-results">
                      <strong className="govuk-!-font-weight-bold">{noResultsHeading}</strong>
                      <br />
                      {noResultsSearchHint}
                      <br />
                      {noResultsManualEntryHint}
                    </p>
                  )}
                </div>
              </>
            )}
            {facilityToSubmit && (
              <>
                <input type="hidden" name="facilityName" value={facilityToSubmit.tradingName} />
                <input type="hidden" name="facilityApprovalNumber" value={facilityToSubmit.approvalNumber} />
                <input type="hidden" name="facilityAddressOne" value={facilityToSubmit.addressLine} />
                <input type="hidden" name="facilityTownCity" value={facilityToSubmit.cityName} />
                <input type="hidden" name="facilityPostcode" value={facilityToSubmit.postcode} />
              </>
            )}
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
                label={t("sdWhichStorageFacilityManualButton")}
                className="govuk-button govuk-button--secondary"
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
            progressUri="/create-non-manipulation-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default WhichStorageFacility;
