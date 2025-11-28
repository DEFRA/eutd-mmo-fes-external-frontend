import { type Session, type SessionData, redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isNumber from "lodash/isNumber";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getAllGearCategories,
  getAllGearTypesByCategory,
  getBearerTokenForRequest,
  getDirectLandings,
  getGroupedAddLandingErrorFieldIds,
  getLandingsEntryOption,
  getVessels,
  getVesselsNoJs,
  nonJsDateValidation,
  validateCSRFToken,
  validateDirectLandings,
  getRfmos,
  getCountries,
  getSelectedEezInIcountryFormat,
} from "~/.server";
import { getEnv } from "~/env.server";
import { getCodeFromLabel, getErrorMessage, getStartDate, getTransformedError, isValidDate } from "~/helpers";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type {
  IDirectLandings,
  IUnauthorised,
  IGearType,
  IDirectLandingsDetails,
  IError,
  IVessel,
  HighSeasAreaType,
  ICountry,
} from "~/types";

function instanceOfUnauthorised(data: IDirectLandings | IUnauthorised): data is IUnauthorised {
  return "unauthorised" in data;
}

function instanceOfIError(data: IDirectLandings | IError[]): data is IError[] {
  return Array.isArray(data) && "key" in data[0];
}

const saveActionBase: any = async (values: any, landings: IDirectLandings, isNumeric: (i: any) => boolean) => {
  const filterWeights: { [key: string]: string } = Object.keys(values)
    .filter((key) => key.includes("weight"))
    .reduce((cur, key) => Object.assign(cur, { [key.slice(7)]: values[key] }), {});

  const pln =
    (values["vessel"] as string) && (values["vessel"] as string).endsWith(")")
      ? getCodeFromLabel(values["vessel"] as string)
      : values["vessel"];
  const startDate = getStartDate(values);
  const date = `${values["dateLandedYear"]}-${values["dateLandedMonth"]}-${values["dateLandedDay"]}`;
  const gearCategory = isEmpty(values["gearCategory"]) ? undefined : values["gearCategory"];
  const gearType = isEmpty(values["gearType"]) ? undefined : values["gearType"];
  const gearTypes: IGearType[] = await getAllGearTypesByCategory(gearCategory as string);
  const gearTypeWithCode: IGearType | undefined =
    gearTypes.length > 0
      ? gearTypes.find((gType: IGearType) => gearType === `${gType.gearName} (${gType.gearCode})`)
      : undefined;
  const rfmo = isEmpty(values["rfmo"]) ? undefined : values["rfmo"];
  const vessels: IVessel[] = !isEmpty(pln) ? await getVessels(pln.toString(), date) : [];
  const selectedVessel: IVessel | undefined = vessels.find((_: IVessel) => _.pln === pln);
  const previousVessel: IVessel | undefined = {};
  let exclusiveEconomicZones: ICountry[] = [];

  exclusiveEconomicZones = await getSelectedEezInIcountryFormat(values);

  if (selectedVessel) {
    selectedVessel.label = values["vessel"].toString();
    selectedVessel.domId = values["vessel"].toString().replace(" (", "-").replace(")", "");
  } else {
    previousVessel.pln = landings?.vessel?.pln;
    previousVessel.vesselName = landings?.vessel?.vesselName;
    previousVessel.flag = landings?.vessel?.flag;
    previousVessel.cfr = landings?.vessel?.cfr;
    previousVessel.homePort = landings?.vessel?.homePort;
    previousVessel.licenceNumber = landings?.vessel?.licenceNumber;
    previousVessel.imoNumber = landings?.vessel?.imoNumber;
    previousVessel.licenceValidTo = landings?.vessel?.licenceValidTo;
    previousVessel.rssNumber = landings?.vessel?.rssNumber;
    previousVessel.vesselLength = landings?.vessel?.vesselLength;
    previousVessel.licenceHolder = landings?.vessel?.licenceHolder;
    previousVessel.label = landings?.vessel?.label;
    previousVessel.domId = landings?.vessel?.domId;
  }

  const updatedWeights: IDirectLandingsDetails[] = Array.isArray(landings?.weights)
    ? landings?.weights.reduce(
        (acc: IDirectLandingsDetails[], curr: IDirectLandingsDetails) =>
          curr.speciesId && filterWeights[curr.speciesId] && isNumeric(filterWeights[curr.speciesId])
            ? [...acc, { ...curr, exportWeight: filterWeights[curr.speciesId] }]
            : [...acc, { ...curr, exportWeight: null }],
        []
      )
    : [];

  return {
    selectedVessel: selectedVessel ?? previousVessel,
    startDate,
    date: isValidDate(date, ["YYYY-M-D", "YYYY-MM-DD"]) ? date : "",
    updatedWeights,
    gearCategory,
    gearType,
    gearCode: gearTypeWithCode?.gearCode,
    rfmo,
    exclusiveEconomicZones,
  };
};

const saveAsDraftAction = async (
  values: any,
  bearerToken: string,
  session: any,
  isNumeric: (i: any) => boolean,
  documentNumber?: string
) => {
  const landings: IDirectLandings | IUnauthorised = await getDirectLandings(bearerToken, documentNumber);

  if (instanceOfUnauthorised(landings)) {
    return redirect("/forbidden");
  }
  const {
    selectedVessel,
    startDate,
    date,
    updatedWeights,
    gearCategory,
    gearType,
    gearCode,
    rfmo,
    exclusiveEconomicZones,
  } = await saveActionBase(values, landings, isNumeric);

  const responseBody = {
    vessel: selectedVessel,
    startDate: startDate,
    dateLanded: date,
    faoArea: values["faoArea"] as string,
    highSeasArea: values["highSeasArea"] as HighSeasAreaType,
    weights: updatedWeights,
    gearCategory,
    gearType,
    gearCode,
    rfmo,
    exclusiveEconomicZones,
  };

  await validateDirectLandings(bearerToken, documentNumber, responseBody);

  session.unset("selectedDate");

  return redirect(route("/create-catch-certificate/catch-certificates"), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const saveAndContinueAction = async (
  values: any,
  session: any,
  bearerToken: string,
  isNumeric: (i: any) => boolean,
  nextUri: string,
  documentNumber?: string
) => {
  const landings: IDirectLandings | IUnauthorised = await getDirectLandings(bearerToken, documentNumber);

  if (instanceOfUnauthorised(landings)) {
    return redirect("/forbidden");
  }
  const {
    selectedVessel,
    startDate,
    date,
    updatedWeights,
    gearCategory,
    gearType,
    gearCode,
    rfmo,
    exclusiveEconomicZones,
  } = await saveActionBase(values, landings, isNumeric);

  const responseBody = {
    vessel: selectedVessel,
    startDate: startDate,
    dateLanded: date,
    faoArea: values["faoArea"] as string,
    highSeasArea: values["highSeasArea"] as HighSeasAreaType,
    weights: updatedWeights,
    gearCategory,
    gearType,
    gearCode,
    rfmo,
    exclusiveEconomicZones,
  };

  const submitForm = await validateDirectLandings(bearerToken, documentNumber, responseBody);
  if (Array.isArray(submitForm) && submitForm.length > 0) {
    const errors = getTransformedError(submitForm);
    return new Response(
      JSON.stringify({
        values,
        errors,
        groupedErrorIds: getGroupedAddLandingErrorFieldIds(errors),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    session.unset("selectedDate");

    return redirect(
      isEmpty(nextUri)
        ? route("/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in", { documentNumber })
        : nextUri,
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }
};

const addGearCategoryAction = async (values: any, session: any) => {
  if (!values?.gearCategory) {
    const errors = getTransformedError([
      {
        key: "gearCategory",
        message: getErrorMessage("ccAddLandingGearCategoryAddButtonError"),
      },
    ]);
    return new Response(
      JSON.stringify({
        values,
        errors,
        groupedErrorIds: getGroupedAddLandingErrorFieldIds(errors),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  return redirect("?#gearType", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
const getSessionData = (session: Session<SessionData, SessionData>, key: string) => session.get(key) ?? "";

export const DirectLandingsLoader = async (params: Params, request: Request) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const { landingsEntryOption, unauthorised } = await getLandingsEntryOption(bearerToken, documentNumber);
  const directLandings: IDirectLandings | IUnauthorised = await getDirectLandings(bearerToken, documentNumber);
  const gearCategories = await getAllGearCategories();
  const rfmos = await getRfmos();
  const availableExclusiveEconomicZones: ICountry[] = await getCountries();
  const maximumEezPerLanding = getEnv().EU_CATCH_MAX_EEZ;

  if (
    unauthorised ||
    instanceOfUnauthorised(directLandings) ||
    landingsEntryOption !== "directLanding" ||
    instanceOfIError(directLandings)
  ) {
    return redirect("/forbidden");
  }

  const landingLimitDaysInFuture = getEnv().LANDING_LIMIT_DAYS_FUTURE;
  const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";

  const session = await getSessionFromRequest(request);
  let selectedDate = session.get("selectedDate");

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";

  let vesselSelected = "";

  if (isEmpty(selectedDate)) {
    selectedDate = directLandings?.dateLanded;
  }

  if (!isEmpty(directLandings?.vessel?.vesselName)) {
    vesselSelected = `${directLandings?.vessel?.vesselName} (${directLandings?.vessel?.pln})`;
  }

  let isAddGearCategoryButtonClicked = session.get("addGearCategoryClicked");
  let gearCategory;
  let fallbackGearTypes: IGearType[] | undefined;
  if (isAddGearCategoryButtonClicked) {
    gearCategory = session.get("gearCategory");
    vesselSelected = session.get("selectedVessel");
    directLandings.rfmo = session.get("selectedRfmo");
    fallbackGearTypes = await getAllGearTypesByCategory(gearCategory as string);
    session.unset("gearCategory");
    session.unset("addGearCategoryClicked");
  } else {
    gearCategory = directLandings?.gearCategory;
  }

  const isAddAnotherEEZButtonClicked = session.get("addAnotherEEZClicked");
  const isRemoveEEZClicked = session.get("removeEEZClicked");
  const selectedEEZCountry = session.get("selectedEEZCountry");

  if (isAddAnotherEEZButtonClicked || isAddGearCategoryButtonClicked) {
    directLandings.exclusiveEconomicZones = [...selectedEEZCountry];
    session.unset("addAnotherEEZClicked");
    session.unset("selectedEEZCountry");
  }

  if (isRemoveEEZClicked) {
    directLandings.exclusiveEconomicZones = [...selectedEEZCountry];
    directLandings.exclusiveEconomicZones.pop();
    session.unset("removeEEZClicked");
    session.unset("selectedEEZCountry");
  }

  const totalWeight = Array.isArray(directLandings?.weights)
    ? directLandings.weights.reduce(
        (totals: number, weight: IDirectLandingsDetails) =>
          weight.exportWeight === undefined || weight.exportWeight === null || !isNumber(weight.exportWeight)
            ? totals
            : totals + parseFloat(weight.exportWeight),
        0
      )
    : 0;
  if (directLandings?.gearType) {
    fallbackGearTypes = await getAllGearTypesByCategory(gearCategory as string);
  }

  const normalize = (s?: string | null) => (s?.trim() === "" ? undefined : s);
  const selectedHighSeasArea =
    normalize(getSessionData(session, "selectedHighSeasArea")) ?? normalize(directLandings?.highSeasArea);
  const selectedStartDate =
    normalize(getSessionData(session, "selectedStartDate")) ?? normalize(directLandings?.startDate);

  return new Response(
    JSON.stringify({
      documentNumber,
      landingLimitDaysInFuture,
      selectedStartDate: selectedStartDate,
      displayOptionalSuffix,
      selectedDate,
      selectedGearCategory: gearCategory,
      selectedGearType: directLandings?.gearType,
      getAllVesselNames: isValidDate(selectedDate, ["YYYY-M-D", "YYYY-MM-DD"])
        ? await getVesselsNoJs(selectedDate)
        : undefined,
      directLandings,
      vesselSelected,
      nextUri,
      totalWeight,
      minCharsBeforeSearch: 2,
      gearCategories,
      fallbackGearTypes,
      csrf,
      selectedHighSeasArea: selectedHighSeasArea,
      rfmos,
      selectedRfmo: directLandings?.rfmo,
      availableExclusiveEconomicZones,
      selectedExclusiveEconomicZones: directLandings?.exclusiveEconomicZones,
      maximumEezPerLanding: parseInt(maximumEezPerLanding, 10),
      isAddAnotherEEZButtonClicked: isAddAnotherEEZButtonClicked,
      faoArea: getSessionData(session, "selectedFaoArea"),
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

export const DirectLandingsAction = async (params: Params, request: Request): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();

  const { _action, ...values } = Object.fromEntries(form);
  const session = await getSessionFromRequest(request);
  const nextUri = form.get("nextUri") as string;
  const pageUrl = route("/create-catch-certificate/:documentNumber/direct-landing", { documentNumber });

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const saveToSession = (data: any) => Object.keys(data).forEach((k) => session.set(k, data[k]));
  // helper function to ensure form number is actually a number
  function isNumeric(str: string | number) {
    return (
      /^-?[\d.]+$/.test(str as string) && // ensure only numbers and dots(negative numbers will be caught later validation)
      !isNaN(str as number) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str as string))
    ); // ...and ensure strings of whitespace fail
  }
  const {
    dateLandedDay,
    dateLandedMonth,
    dateLandedYear,
    startDateDay,
    startDateMonth,
    startDateYear,
    faoArea: selectedFaoArea,
    highSeasArea: selectedHighSeasArea,
    weight: selectedWeight,
    vessel: selectedVessel,
    gearCategory: selectedGearCategory,
    gearType: selectedGearType,
    rfmo,
  } = values;
  const selectedRfmo = isEmpty(rfmo) ? undefined : rfmo;
  const selectedDate = `${dateLandedYear}-${dateLandedMonth}-${dateLandedDay}`;
  const selectedStartDate = `${startDateYear}-${startDateMonth}-${startDateDay}`;

  session.set("actionExecuted", true);
  const nonJsActions = ["add-dateLanded", "add-startDate", "addGearCategory", "add-zone-button"];

  const isPartialSubmit = nonJsActions.includes(_action as string);
  if (isPartialSubmit) {
    // capture the form state as-is
    saveToSession({
      selectedStartDate,
      selectedDate,
      selectedFaoArea,
      selectedHighSeasArea,
      selectedWeight,
      selectedVessel,
      gearCategory: selectedGearCategory,
      gearType: selectedGearType,
      selectedRfmo,
    });
  }
  switch (_action) {
    // Used when JS is disabled
    case "add-startDate": {
      const result = await nonJsDateValidation(request, values, selectedStartDate, "startDate");
      if (result !== null) {
        return result;
      }

      session.set("selectedStartDate", selectedStartDate);
      return redirect("?#dateLanded", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
    case "add-dateLanded": {
      const result = await nonJsDateValidation(request, values, selectedDate, "dateLanded");
      if (result !== null) {
        return result;
      }

      session.set("selectedDate", selectedDate);
      return redirect("?#vessels", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
    case "saveAsDraft": {
      return saveAsDraftAction(values, bearerToken, session, isNumeric, documentNumber);
    }
    case "saveAndContinue": {
      session.set("gearType", selectedGearType);
      return saveAndContinueAction(values, session, bearerToken, isNumeric, nextUri, documentNumber);
    }
    case "addGearCategory": {
      session.set("addGearCategoryClicked", true);
      let exclusiveEconomicZones: ICountry[] = [];
      exclusiveEconomicZones = await getSelectedEezInIcountryFormat(values);
      session.set("selectedEEZCountry", exclusiveEconomicZones);
      session.set("gearCategory", values?.gearCategory);
      values.gearType = "";
      return addGearCategoryAction(values, session);
    }
    case "add-zone-button": {
      session.set("addAnotherEEZClicked", true);
      let exclusiveEconomicZones: ICountry[] = [];
      exclusiveEconomicZones = await getSelectedEezInIcountryFormat(values);
      session.set("selectedEEZCountry", exclusiveEconomicZones);
      return redirect("?#eez-0-label", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
    case "remove-zone-button": {
      session.set("removeEEZClicked", true);
      let exclusiveEconomicZones: ICountry[] = [];
      exclusiveEconomicZones = await getSelectedEezInIcountryFormat(values);
      session.set("selectedEEZCountry", exclusiveEconomicZones);
      return redirect("?#eez-0-label", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }
  return redirect(pageUrl);
};
