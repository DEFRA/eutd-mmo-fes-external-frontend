import * as React from "react";
import { useEffect, useState } from "react";
import { route } from "routes-gen";
import { useLoaderData, redirect, type LoaderFunction, type ActionFunction, useActionData } from "react-router";
import { useTranslation } from "react-i18next";
import { BUTTON_TYPE, Button } from "@capgeminiuk/dcx-react-library";
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
  const [establishments, facilityOptionsNoJs] = await Promise.all([getStorageFacilities(), getStorageFacilitiesNoJs()]);

  const matched = matchEstablishment(establishments, sd.facilityName, sd.facilityApprovalNumber);
  // The facility name is optional here - a manual address can be saved (via "Enter facility
  // details manually") before a name is collected on the following add-storage-facility-approval page.
  const hasManualAddress = !isEmpty(sd.facilityAddressOne);

  let savedFacilityOption: string | undefined;
  let savedFacilityDetails: StorageFacilitySearchResult | undefined;

  if (matched) {
    savedFacilityOption = formatEstablishmentLabel(matched);
    savedFacilityDetails = {
      label: savedFacilityOption,
      tradingName: matched.tradingName ?? "",
      approvalNumber: matched.approvalNumber?.content ?? "",
      addressLine: matched.address?.line1 ?? "",
      cityName: matched.address?.cityName ?? "",
      postcode: matched.address?.postCode?.code ?? "",
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

  let facilityName = "";
  let facilityApprovalNumber = "";
  let facilityAddress: Partial<StorageDocument> = {};

  if (isNonJs) {
    const selectedLabel = ((form.get("storageFacility") as string) ?? "").trim();
    const establishments: Establishment[] = await getStorageFacilities();
    const matched = establishments.find((e) => formatEstablishmentLabel(e) === selectedLabel);

    if (matched) {
      facilityName = matched.tradingName ?? "";
      facilityApprovalNumber = matched.approvalNumber?.content ?? "";
      facilityAddress = mapEstablishmentToFacilityAddress(matched);
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

    // The submitted hidden fields can't tell a fresh registry match apart from a continuing
    // manual entry, so re-resolve against the registry here. On a match, use its address as the
    // source of truth and blank the manual-only sub-fields (building/sub-building/street/county)
    // so a stale manual entry from BEFORE this facility was matched can't leak back in later via
    // "Enter the address manually" - mirrors add-processing-plant.tsx's equivalent payload.
    const establishments = await getStorageFacilities();
    const matched = !isEmpty(facilityName)
      ? matchEstablishment(establishments, facilityName, facilityApprovalNumber)
      : undefined;

    if (matched) {
      facilityApprovalNumber = matched.approvalNumber?.content ?? facilityApprovalNumber;
      facilityAddress = {
        ...mapEstablishmentToFacilityAddress(matched),
        facilityBuildingNumber: "",
        facilitySubBuildingName: "",
        facilityBuildingName: "",
        facilityStreetName: "",
        facilityCounty: "",
      };
    }
  }

  const nextUri = form.get("nextUri") as string;
  const hasSelection = !isEmpty(facilityName) || !isEmpty(facilityAddress.facilityAddressOne);

  if (!hasSelection) {
    // Non-JS users (and a defensive fallback for JS) can reach here with nothing submitted even
    // though a manual address was already saved for this document on a previous visit - in that
    // case the facility name is simply still pending on the next page, not a validation error.
    const existingDocument = await getStorageDocument(bearerToken, documentNumber);
    const hasExistingManualAddress =
      !instanceOfUnauthorised(existingDocument) && !isEmpty((existingDocument as StorageDocument).facilityAddressOne);

    if (hasExistingManualAddress) {
      return redirect(
        isEmpty(nextUri)
          ? route("/create-non-manipulation-document/:documentNumber/add-storage-facility-approval", {
              documentNumber,
            })
          : nextUri
      );
    }

    const errors = getTransformedError([{ key: "storageFacility", message: "sdWhichStorageFacilitySelectError" }]);

    return new Response(JSON.stringify({ errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
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
      ? route("/create-non-manipulation-document/:documentNumber/add-storage-facility-approval", { documentNumber })
      : nextUri
  );
};

const WhichStorageFacility = () => {
  const { t } = useTranslation(["whichStorageFacility", "common"]);
  const { documentNumber, csrf, nextUri, backUrl, savedFacilityOption, savedFacilityDetails, facilityOptionsNoJs } =
    useLoaderData<LoaderData>();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const isHydrated = useIsHydrated();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [facilityResults, setFacilityResults] = useState<StorageFacilitySearchResult[]>(
    savedFacilityDetails ? [savedFacilityDetails] : []
  );
  const [selectedFacility, setSelectedFacility] = useState<StorageFacilitySearchResult | undefined>(
    savedFacilityDetails
  );
  const facilityOptions = facilityResults.map((result) => result.label);

  const handleFacilitySelected = (label: string) => {
    const match = facilityResults.find((result) => result.label === label);
    if (match) {
      setSelectedFacility(match);
    }
  };

  useEffect(() => {
    const searchStorageFacilities = async (): Promise<void> => {
      if (searchTerm.length < minCharsBeforeSearch) {
        setFacilityResults((prev) => (prev.length === 0 ? prev : []));
        return;
      }

      try {
        const response = await fetch(`/get-storage-facilities?search=${searchTerm}`);
        const facilities: StorageFacilitySearchResult[] = await response.json();
        setFacilityResults(facilities ?? []);
      } catch (e) {
        logger.info("[ADD-STORAGE-FACILITY][GET-STORAGE-FACILITIES][ERROR]");
        if (e instanceof Error) {
          logger.error(e);
        }

        setFacilityResults((prev) => (prev.length === 0 ? prev : []));
      }
    };

    void searchStorageFacilities();
  }, [searchTerm]);

  const getNonJsOptions = () => (!isEmpty(facilityOptionsNoJs) ? facilityOptionsNoJs : [""]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, ["storageFacility"])} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <Title title={t("sdWhichStorageFacilityHeading")} />
          <SecureForm method="post" csrf={csrf}>
            {isHydrated && selectedFacility ? (
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
                <p className="govuk-body govuk-!-margin-bottom-3">
                  {[selectedFacility.cityName, selectedFacility.postcode].filter(Boolean).join(", ")}
                </p>
                <button
                  type="button"
                  className="app-change-button"
                  data-testid="change-storage-facility"
                  onClick={() => {
                    setSelectedFacility(undefined);
                    setSearchTerm("");
                  }}
                >
                  {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                </button>
                <input type="hidden" name="facilityName" value={selectedFacility.tradingName} />
                <input type="hidden" name="facilityApprovalNumber" value={selectedFacility.approvalNumber} />
                <input type="hidden" name="facilityAddressOne" value={selectedFacility.addressLine} />
                <input type="hidden" name="facilityTownCity" value={selectedFacility.cityName} />
                <input type="hidden" name="facilityPostcode" value={selectedFacility.postcode} />
              </div>
            ) : (
              <AutocompleteFormField
                id="storageFacility"
                name="storageFacility"
                options={isHydrated ? facilityOptions : getNonJsOptions()}
                optionsId="storage-facility-option"
                errorMessageText={
                  errors?.storageFacility ? t(errors?.storageFacility?.message ?? "", { ns: "errorsText" }) : ""
                }
                defaultValue={savedFacilityOption ?? ""}
                labelText={t("sdWhichStorageFacilityLabel")}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                hintText={t("sdWhichStorageFacilityHint")}
                containerClassName={classNames("govuk-form-group", {
                  "govuk-form-group--error": errors?.storageFacility,
                })}
                selectProps={{
                  selectClassName: "govuk-select govuk-!-width-full",
                }}
                inputProps={{
                  id: "storageFacility",
                  className: classNames("govuk-input govuk-!-width-full", {
                    "govuk-input--error": errors?.storageFacility,
                  }),
                }}
                onChange={setSearchTerm}
                onSelected={handleFacilitySelected}
                minCharsBeforeSearch={minCharsBeforeSearch}
                notFoundText={
                  searchTerm.trim().length >= minCharsBeforeSearch ? t("sdWhichStorageFacilityNoResultsFound") : ""
                }
              />
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
