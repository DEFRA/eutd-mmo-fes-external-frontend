import { type Session, type SessionData, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import moment from "moment";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  addDateLandedAction,
  addGearCategoryAction,
  addLanding,
  addLandingSessionKeys,
  createCSRFToken,
  getAllGearCategories,
  getAllGearTypesByCategory,
  getBearerTokenForRequest,
  getExportPayload,
  getGroupedAddLandingErrorFieldIds,
  getLandingData,
  getLandingsData,
  getLandingsEntryOption,
  getVessels,
  getVesselsNoJs,
  isMaxLandingsExceeded,
  okActionResponse,
  removeLanding,
  removeProduct,
  saveAndContinueAction,
  validateCSRFToken,
  getRfmos,
  type ManualEntryLandingsData,
  getCountries,
} from "~/.server";
import { getEnv } from "~/env.server";
import { getCodeFromLabel, getStrOrDefault, getTransformedError, isValidDate, toISODateFormat } from "~/helpers";
import { clearSession, commitSession, getSessionFromRequest } from "~/sessions.server";
import type { IBase, IGearType, IUnauthorised, IVessel, Landing, ErrorResponse, ProductsLanded } from "~/types";

function instanceOfUnauthorised(data: ProductsLanded | IUnauthorised): data is IUnauthorised {
  return "unauthorised" in data;
}

function instanceOfUnauthorisedWithSupportId(
  data: ProductsLanded | { unauthorised: boolean; supportId?: string } | IBase
): data is IUnauthorised {
  return "unauthorised" in data;
}

const getSessionData = (session: Session<SessionData, SessionData>, key: string) => session.get(key) ?? "";

export const AddLandingsLoader = async (request: Request, params: Params): Promise<Response> => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const csrf = createCSRFToken();
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  const { landingsEntryOption } = await getLandingsEntryOption(bearerToken, documentNumber);
  const rfmos = await getRfmos();
  const availableExclusiveEconomicZones = await getCountries();
  if (landingsEntryOption === "directLanding") {
    return redirect(route("/create-catch-certificate/catch-certificates"));
  }

  const exportPayload: ProductsLanded | IUnauthorised = await getExportPayload(bearerToken, documentNumber);

  if (instanceOfUnauthorised(exportPayload)) {
    return redirect(route("/forbidden"));
  }

  const maxAddLandingsLimit = getEnv().LIMIT_ADD_LANDINGS;
  const landingLimitDaysInFuture = getEnv().LANDING_LIMIT_DAYS_FUTURE;
  const offlineValidationTime = getEnv().OFFLINE_PROCESSING_TIME_IN_MINUTES;
  const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";
  const maximumEezPerLanding = getEnv().EU_CATCH_MAX_EEZ;
  const hasActionExecuted = session.get("actionExecuted");
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId") ?? "";

  let selectedStartDate;
  let selectedDate;
  let selectedProduct;
  let selectedFaoArea;
  let selectedWeight;
  let selectedVessel;
  let gearCategory;
  let gearType;
  let selectedHighSeasArea;
  let selectedRfmo;
  let landingId = url.searchParams.get("landingId") ?? "";
  let editLanding = false;
  let nextUri;
  let selectedExclusiveEconomicZones: string[] = [];

  if (hasActionExecuted) {
    session.unset("actionExecuted");
    const hasLandingExecuted = session.get("landingExecuted");
    if (hasLandingExecuted) {
      session.set("hasLandingError", false);
      session.set("selectedWeight", "");
      session.set("landingExecuted", false);
    }
    selectedStartDate = getSessionData(session, "selectedStartDate");
    selectedDate = getSessionData(session, "selectedDate");
    selectedProduct = getSessionData(session, "selectedProduct");
    selectedFaoArea = getSessionData(session, "selectedFaoArea");
    selectedHighSeasArea = getSessionData(session, "selectedHighSeasArea");
    selectedRfmo = getSessionData(session, "selectedRfmo");
    selectedWeight = getSessionData(session, "selectedWeight");
    selectedVessel = getSessionData(session, "selectedVessel");
    gearCategory = getSessionData(session, "gearCategory");
    gearType = getSessionData(session, "gearType");
    selectedExclusiveEconomicZones = session.get("selectedExclusiveEconomicZones") ?? [];
    landingId = session.get("landingId") ?? "";
    editLanding = session.get("editLanding") ?? false;
    nextUri = url.searchParams.get("nextUri") ?? "";
  } else if (!isEmpty(productId) && !isEmpty(landingId)) {
    const landing: Landing | undefined = getLandingData(exportPayload, productId, landingId);

    session.set("selectedProduct", productId);
    session.set("landingId", landing?.id);
    session.set("editLanding", true);

    selectedStartDate = landing?.startDate;
    selectedDate = landing?.dateLanded;
    selectedProduct = productId;
    selectedFaoArea = landing?.faoArea;
    selectedHighSeasArea = landing?.highSeasArea;
    selectedRfmo = landing?.rfmo;
    selectedWeight = landing?.exportWeight;
    selectedVessel = `${landing?.vessel?.vesselName} (${landing?.vessel?.pln})`;
    gearCategory = landing?.gearCategory;
    gearType = landing?.gearType;
    editLanding = true;
    selectedExclusiveEconomicZones = landing?.exclusiveEconomicZones?.map((item) => item.officialCountryName) ?? [];
    nextUri = url.searchParams.get("nextUri") ?? "";
  } else {
    clearSession(session, "add-landings");
  }

  const landingsData: ManualEntryLandingsData = getLandingsData(exportPayload);
  const gearCategories = await getAllGearCategories();
  // if we have a gear category selected, then pre-load the available gear types
  let availableGearTypes: IGearType[] | undefined;
  if (gearCategory) {
    availableGearTypes = await getAllGearTypesByCategory(gearCategory);
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      csrf,
      landingLimitDaysInFuture,
      offlineValidationTime,
      maxAddLandingsLimit,
      maximumEezPerLanding: parseInt(maximumEezPerLanding, 10),
      landingsData,
      vesselsNoJs: isValidDate(selectedDate, ["YYYY-M-D", "YYYY-MM-DD"])
        ? await getVesselsNoJs(selectedDate)
        : undefined,
      selectedStartDate,
      displayOptionalSuffix,
      selectedDate,
      selectedProduct,
      selectedFaoArea,
      selectedWeight,
      selectedVessel,
      gearCategory,
      gearType,
      landingId,
      editLanding,
      rfmos,
      availableExclusiveEconomicZones,
      selectedExclusiveEconomicZones,
      canAddLanding: landingsData.landingsTableData.length < Number(maxAddLandingsLimit) || editLanding,
      nextUri,
      minCharsBeforeSearch: 2,
      maxLandingExceeded: isMaxLandingsExceeded(exportPayload, landingsData.landingsTableData.length),
      gearCategories,
      availableGearTypes,
      selectedHighSeasArea,
      selectedRfmo,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const addLandingActionName = "submit";
const cancelActionName = "cancel";

const addLandingAction = async (
  values: Record<string, FormDataEntryValue>,
  bearerToken: string,
  session: Session<SessionData, SessionData>,
  documentNumber: string | undefined
) => {
  const {
    product,
    dateLandedDay,
    dateLandedMonth,
    dateLandedYear,
    startDateDay,
    startDateMonth,
    startDateYear,
    faoArea,
    highSeasArea,
    weight,
    vessel,
    landingId,
    gearCategory,
    gearType,
    rfmo,
  } = values;

  const isDateLandedProvided = Boolean(dateLandedDay || dateLandedMonth || dateLandedYear);
  let selectedDate: string | undefined;
  if (isDateLandedProvided) {
    selectedDate = toISODateFormat(
      getStrOrDefault(dateLandedDay as string),
      getStrOrDefault(dateLandedMonth as string),
      getStrOrDefault(dateLandedYear as string)
    );
  }
  const isDateLandedValid = isDateLandedProvided && isValidDate(selectedDate, ["YYYY-M-D", "YYYY-MM-DD"]);

  const isStartDateProvided = Boolean(startDateYear || startDateMonth || startDateDay);
  let selectedStartDate: string | undefined;
  if (isStartDateProvided) {
    selectedStartDate = toISODateFormat(
      getStrOrDefault(startDateDay as string),
      getStrOrDefault(startDateMonth as string),
      getStrOrDefault(startDateYear as string)
    );
  }

  let selectedVessel: IVessel | undefined;
  if (isDateLandedValid) {
    selectedVessel = await getVesselDetails(
      vessel as string,
      selectedDate as string,
      bearerToken,
      documentNumber,
      product as string,
      landingId as string
    );
    if (!selectedVessel) {
      return redirect(route("/forbidden"));
    }
  } else if (isDateLandedProvided) {
    selectedVessel = await getVesselDetails(
      vessel as string,
      moment().format("YYYY-MM-DD"),
      bearerToken,
      documentNumber,
      product as string,
      landingId as string
    );
  }

  const selectedRfmo = isEmpty(rfmo) ? undefined : (rfmo as string);
  const countries = await getCountries();
  const exclusiveEconomicZones = Object.entries(values)
    .filter(([key, eez_value]) => key.startsWith("eez") && !isEmpty(eez_value))
    .map(([, value]) => countries.find((item) => item.officialCountryName == value));

  const gearTypes: IGearType[] = await getAllGearTypesByCategory(gearCategory as string);
  const gearTypeWithCode: IGearType | undefined =
    gearTypes.length > 0
      ? gearTypes.find((gType: IGearType) => gearType === `${gType.gearName} (${gType.gearCode})`)
      : undefined;
  const response: ProductsLanded | { unauthorised: boolean; supportId?: string } | IBase = await addLanding(
    bearerToken,
    documentNumber,
    {
      startDate: selectedStartDate,
      dateLanded: selectedDate ?? "",
    },
    weight as string,
    faoArea as string,
    highSeasArea as string,
    product as string,
    landingId as string,
    {
      gearCategory: gearCategory as string,
      gearType: gearType as string,
      gearCode: gearTypeWithCode?.gearCode,
    },
    selectedRfmo,
    selectedVessel,
    exclusiveEconomicZones
  );

  if (instanceOfUnauthorisedWithSupportId(response)) {
    return response.supportId
      ? redirect(route("/forbidden/:supportId", { supportId: response.supportId }))
      : redirect("/forbidden");
  }

  if (Array.isArray(response.errors) && response.errors.length > 0) {
    session.set("selectedStartDate", selectedStartDate);
    session.set("selectedDate", selectedDate);
    session.set("selectedProduct", product);
    session.set("selectedFaoArea", faoArea);
    session.set("selectedHighSeasArea", highSeasArea);
    session.set("selectedWeight", weight);
    session.set("selectedVessel", vessel);
    session.set("gearCategory", gearCategory);
    session.set("gearType", gearType);
    session.set("selectexclusiveEconomicZones", exclusiveEconomicZones);
    session.set("selectedRfmo", selectedRfmo);
    session.set("hasLandingError", true);

    const errors = getTransformedError(response.errors);
    return new Response(
      JSON.stringify({
        errors,
        groupedErrorIds: getGroupedAddLandingErrorFieldIds(errors),
        ...values,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  const reload = session.has("hasLandingError") && JSON.parse(session.get("hasLandingError")) === true;
  return okActionResponse({ actionExecuted: "submit", product: values.product, reload }, session);
};

const cancelLandingAction = async (values: any, session: any) => {
  const reload = session.has("hasLandingError") && JSON.parse(session.get("hasLandingError")) === true;

  let sessionKeysToClear = addLandingSessionKeys;
  if (values.productToAdd) {
    session.set("selectedProduct", values.productToAdd);
    sessionKeysToClear = sessionKeysToClear.filter((k) => k !== "selectedProduct");
  }

  return okActionResponse({ actionExecuted: "cancel", reload }, session, sessionKeysToClear);
};

const editLandingAction = async (
  bearerToken: string,
  documentNumber: string | undefined,
  values: any,
  session: any,
  pageUrl: string
) => {
  const exportPayload: ProductsLanded | IUnauthorised = await getExportPayload(bearerToken, documentNumber);
  if (instanceOfUnauthorised(exportPayload)) {
    return redirect("/forbidden");
  }

  const landingResponse: Landing | undefined = getLandingData(
    exportPayload,
    values.productId as string,
    values.landingId as string
  );
  session.set("selectedStartDate", landingResponse?.startDate);
  session.set("selectedDate", landingResponse?.dateLanded);
  session.set("selectedProduct", values.productId);
  session.set("selectedFaoArea", landingResponse?.faoArea);
  session.set("selectedHighSeasArea", landingResponse?.highSeasArea);
  session.set("selectedWeight", landingResponse?.exportWeight);
  session.set("selectedVessel", `${landingResponse?.vessel?.vesselName} (${landingResponse?.vessel?.pln})`);
  session.set("gearCategory", landingResponse?.gearCategory);
  session.set("gearType", landingResponse?.gearType);
  session.set("selectedRfmo", landingResponse?.rfmo);
  session.set(
    "selectedExclusiveEconomicZones",
    landingResponse?.exclusiveEconomicZones?.map((item) => item.officialCountryName) ?? []
  );
  session.set("landingId", landingResponse?.id);
  session.set("editLanding", true);
  return redirect(pageUrl, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const getRedirectUrl: (values: any, documentNumber?: string) => string = (values: any, documentNumber?: string) =>
  isEmpty(values.nextUri)
    ? route("/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in", { documentNumber })
    : values.nextUri;

const buildPreviousVessel = (landingResponse?: Landing): IVessel => ({
  pln: landingResponse?.vessel?.pln,
  vesselName: landingResponse?.vessel?.vesselName,
  flag: landingResponse?.vessel?.flag,
  cfr: landingResponse?.vessel?.cfr,
  homePort: landingResponse?.vessel?.homePort,
  licenceNumber: landingResponse?.vessel?.licenceNumber,
  imoNumber: landingResponse?.vessel?.imoNumber !== undefined ? parseInt(landingResponse?.vessel?.imoNumber) : null,
  licenceValidTo: landingResponse?.vessel?.licenceValidTo,
  rssNumber: landingResponse?.vessel?.rssNumber,
  vesselLength: landingResponse?.vessel?.vesselLength,
  licenceHolder: landingResponse?.vessel?.licenceHolder,
  label: landingResponse?.vessel?.label,
  domId: landingResponse?.vessel?.domId,
});

const getVesselDetails = async (
  vessel: string,
  date: string,
  bearerToken: string,
  documentNumber: string | undefined,
  product: string,
  landingId: string
): Promise<IVessel | undefined> => {
  const pln = String(vessel).endsWith(")") ? getCodeFromLabel(vessel) : vessel;
  const vessels: IVessel[] = !isEmpty(pln) ? await getVessels(pln.toString(), date) : [];
  const selectedVessel: IVessel | undefined = vessels.find((_: IVessel) => _.pln === pln);

  if (selectedVessel) {
    selectedVessel.label = vessel;
    selectedVessel.domId = vessel.replace(" (", "-").replace(")", "");
    return selectedVessel;
  }
  const exportPayload: ProductsLanded | IUnauthorised = await getExportPayload(bearerToken, documentNumber);
  if (instanceOfUnauthorised(exportPayload)) return undefined;

  const landingResponse: Landing | undefined = getLandingData(exportPayload, product, landingId);
  return buildPreviousVessel(landingResponse);
};

export const AddLandingsAction = async (request: Request, params: Params): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const countries = await getCountries();
  const selectedExclusiveEconomicZones = Object.entries(values)
    .filter(([key]) => key.startsWith("eez"))
    .map(([, value]) => countries.find((item) => item.officialCountryName == value));
  const session = await getSessionFromRequest(request);
  const saveToSession = (data: any) => Object.keys(data).forEach((k) => session.set(k, data[k]));

  // get form values
  const {
    dateLandedDay,
    dateLandedMonth,
    dateLandedYear,
    startDateDay,
    startDateMonth,
    startDateYear,
    product: selectedProduct,
    faoArea: selectedFaoArea,
    highSeasArea: selectedHighSeasArea,
    weight: selectedWeight,
    vessel: selectedVessel,
    gearCategory: selectedGearCategory,
    gearType: selectedGearType,
    rfmo,
  } = values;
  const selectedDate = toISODateFormat(
    getStrOrDefault(dateLandedDay as string),
    getStrOrDefault(dateLandedMonth as string),
    getStrOrDefault(dateLandedYear as string)
  );
  let selectedStartDate: string | undefined;
  const isStartDateProvided = Boolean(startDateDay || startDateMonth || startDateYear);
  if (isStartDateProvided) {
    selectedStartDate = toISODateFormat(
      getStrOrDefault(startDateDay as string),
      getStrOrDefault(startDateMonth as string),
      getStrOrDefault(startDateYear as string)
    );
  }
  const selectedRfmo = isEmpty(rfmo) ? undefined : rfmo;

  session.set("actionExecuted", true);
  const nonJsActions = ["add-dateLanded", "addGearCategory", "add-zone-button"];

  const isPartialSubmit = nonJsActions.includes(_action as string);
  if (isPartialSubmit) {
    // capture the form state as-is
    saveToSession({
      selectedStartDate,
      selectedDate,
      selectedProduct,
      selectedFaoArea,
      selectedHighSeasArea,
      selectedWeight,
      selectedVessel,
      // TODO: we should just rename these for consistency?
      gearCategory: selectedGearCategory,
      gearType: selectedGearType,
      selectedRfmo,
      selectedExclusiveEconomicZones,
    });
  }
  const pageUrl = route("/create-catch-certificate/:documentNumber/add-landings", { documentNumber });
  switch (_action) {
    case "add-dateLanded":
      return await addDateLandedAction(selectedDate, request, values, session);
    case "addGearCategory":
      session.set("selectedExclusiveEconomicZones", [
        ...Object.entries(values)
          .filter(([key]) => key.startsWith("eez"))
          .map(([, value]) => value as string),
      ]);
      return await addGearCategoryAction(selectedGearCategory as string, values, session);
    case addLandingActionName: {
      const isValid = await validateCSRFToken(request, form);
      if (!isValid) return redirect("/forbidden");
      session.set("landingExecuted", true);
      return await addLandingAction(values, bearerToken, session, documentNumber);
    }
    case "edit-landing":
      return await editLandingAction(bearerToken, documentNumber, values, session, pageUrl);
    case "delete-landing": {
      await removeLanding(bearerToken, values.productId as string, values.landingId as string, documentNumber);
      return redirect(pageUrl);
    }
    case cancelActionName:
      return await cancelLandingAction(values, session);
    case "delete-product": {
      await removeProduct(bearerToken, values.productId as string, documentNumber);
      return redirect(pageUrl);
    }
    case "add-zone-button":
      session.set("selectedExclusiveEconomicZones", [
        ...Object.entries(values)
          .filter(([key]) => key.startsWith("eez"))
          .map(([, value]) => value as string),
        "",
      ]);
      return redirect(pageUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    case "remove-zone-button":
      session.set(
        "selectedExclusiveEconomicZones",
        Object.entries(values)
          .filter(([key]) => key.startsWith("eez"))
          .map(([, value]) => value as string)
          .slice(0, -1)
      );
      return redirect(pageUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    case "uploadProductAndLanding":
      return redirect(route("/create-catch-certificate/:documentNumber/upload-file", { documentNumber }));
    case "saveAsDraft":
      return redirect(route("/create-catch-certificate/catch-certificates"));
    case "saveAndContinue": {
      const addLandingResp = await saveAndContinueAction(bearerToken, documentNumber);
      if (addLandingResp) {
        return addLandingResp;
      }
    }
  }

  // clear the session before redirect
  addLandingSessionKeys.forEach((k) => session.unset(k));

  return redirect(getRedirectUrl(values, documentNumber), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
