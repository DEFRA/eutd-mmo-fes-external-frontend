import { redirect, type Session, type SessionData } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  getBearerTokenForRequest,
  getLandingsEntryOption,
  createCSRFToken,
  getAddedSpeciesPerUser,
  getAddSpeciesLoaderData,
  addFish,
  deleteFish,
  getCommodityCode,
  getFavourites,
  postAddedSpeciesPerUser,
  updateFish,
  validateCSRFToken,
  validateValues,
} from "~/.server";
import { apiCallFailed } from "~/communication.server";
import { getEnv } from "~/env.server";
import { getCodeFromLabel } from "~/helpers";
import { getSessionFromRequest, clearSession, commitSession } from "~/sessions.server";
import type { CommodityCode, Fish, IError, Product, Species, ErrorResponse } from "~/types";

// Loader Dependencies starts
function getSessionData(session: Session<SessionData, SessionData>, key: string, defaultValue: any) {
  return session.get(key) ?? defaultValue;
}

function getProductData(product: any, key: string) {
  if (product) {
    return product[key] ?? "";
  } else {
    return "";
  }
}

function getFromSearchParams(url: URL, key: string) {
  return url.searchParams.get(key) ?? "";
}
// Loader Dependencies ends

// Action Dependencies
const getProductDetails = async (values: { [k: string]: string }): Promise<CommodityCode | undefined> => {
  const stateCode: string = values.jsFlag ? values.state : values.stateCode;
  const presentationCode: string = values.jsFlag ? values.presentation : values.presentationCode;
  const commodity: CommodityCode | undefined = await getCommodityCode(
    values.speciesCode,
    stateCode,
    presentationCode,
    values.commodityCode
  );

  return commodity;
};

const addSpeciesHandler = async (
  values: { [k: string]: string },
  session: Session<SessionData, SessionData>
): Promise<Response | ErrorResponse> => {
  const errors: IError[] = validateValues(["species"], values);
  if (errors.length > 0) {
    return apiCallFailed(errors, values, false, session);
  }

  if (session.get("isEdit") && session.get("species") != values.species) {
    session.unset("isEdit");
  }

  session.set("species", values.species);
  session.set("speciesCode", getCodeFromLabel(values.species.toString()));
  session.unset("state");
  session.unset("presentation");

  return redirect("?#add-state", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const addStateHandler = async (
  values: { [k: string]: string },
  session: Session<SessionData, SessionData>
): Promise<Response | ErrorResponse> => {
  const errors: IError[] = validateValues(["species", "state"], values);
  if (errors.length > 0) {
    return apiCallFailed(errors, values, false, session);
  }

  session.set("state", values.state);
  session.set("stateCode", values.state);
  session.unset("presentation");

  return redirect("?#add-presentation", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const addPresentationHandler = async (
  values: { [k: string]: string },
  session: Session<SessionData, SessionData>
): Promise<Response | ErrorResponse> => {
  const errors: IError[] = validateValues(["species", "state", "presentation"], values);
  if (errors.length > 0) {
    return apiCallFailed(errors, values, false, session);
  }

  session.set("presentation", values.presentation);
  session.set("presentationCode", values.presentation);
  return redirect("?#addCommodityCode", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const addProductHandler = async (
  values: { [k: string]: string },
  session: Session<SessionData, SessionData>,
  bearerToken: string,
  documentNumber: string | undefined,
  pageUrl: string
): Promise<Response | ErrorResponse> => {
  const commodity: CommodityCode | undefined = await getProductDetails(values);
  const requestBody: Fish = {
    addToFavourites: values.addToFavourites === "Y",
    presentation: values.jsFlag ? values.presentation : values.presentationCode,
    presentationLabel: values.presentationLabel,
    redirect: pageUrl,
    species: values.species,
    speciesCode: values.speciesCode,
    state: values.jsFlag ? values.state : values.stateCode,
    stateLabel: values.stateLabel,
    scientificName: values.scientificName,
    commodity_code: values.commodityCode,
    commodity_code_description: commodity?.description,
  };

  const addFishResponse: Product = await addFish(bearerToken, documentNumber, requestBody);
  const errors: IError[] = (addFishResponse.errors as IError[]) ?? [];
  if (!isEmpty(errors)) {
    session.set("species", requestBody.species);
    session.set("state", requestBody.state);
    session.set("presentation", requestBody.presentation);
    session.set("commodityCode", requestBody.commodity_code);
    session.set("productId", values.productId);
    return apiCallFailed(errors, values, false, session);
  }

  if (addFishResponse.addedToFavourites) {
    session.flash(
      "success",
      `${values.species}, ${values.stateLabel}, ${values.presentationLabel}, ${values.commodityCode}`
    );
  } else if (addFishResponse.addedToFavourites === false) {
    session.flash(
      "failure",
      `${values.species}, ${values.stateLabel}, ${values.presentationLabel}, ${values.commodityCode}`
    );
  }

  session.unset("species");
  session.unset("state");
  session.unset("presentation");
  session.unset("stateCode");
  session.unset("presentationCode");
  session.unset("speciesCode");
  return redirect(pageUrl, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const editProductHandler = async (
  values: { [k: string]: string },
  session: Session<SessionData, SessionData>,
  bearerToken: string,
  documentNumber: string | undefined,
  pageUrl: string
): Promise<Response | ErrorResponse> => {
  const commodity: CommodityCode | undefined = await getProductDetails(values);
  const requestBody: Fish = {
    id: session.get("productId"),
    addToFavourites: values.addToFavourites === "Y",
    presentation: values.jsFlag ? values.presentation : values.presentationCode,
    presentationLabel: values.presentationLabel,
    redirect: pageUrl,
    species: values.species,
    speciesCode: values.speciesCode,
    state: values.jsFlag ? values.state : values.stateCode,
    stateLabel: values.stateLabel,
    scientificName: values.scientificName,
    commodity_code: values.commodityCode,
    commodity_code_description: commodity?.description,
  };

  const addFishResponse = await updateFish(bearerToken, documentNumber, requestBody);

  const errors: IError[] = (addFishResponse.errors as IError[]) ?? [];
  if (!isEmpty(errors)) {
    const { stateLookup, commodityCodes } = await getAddSpeciesLoaderData(
      bearerToken,
      documentNumber,
      getCodeFromLabel(session.get("species")),
      session.get("state"),
      session.get("presentation")
    );
    values["stateLookup"] = stateLookup;
    values["commodityCodes"] = commodityCodes;
    return apiCallFailed(errors, values, false, session);
  }

  if (values.addToFavourites === "Y") {
    session.flash("success", `${values.species}, ${values.state}, ${values.presentation}, ${values.commodityCode}`);
  }
  session.unset("species");
  session.unset("state");
  session.unset("presentation");
  session.unset("productId");
  session.unset("isEdit");
  return redirect(pageUrl, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const addFromFavouritesHandler = async (
  values: { [k: string]: string },
  bearerToken: string,
  documentNumber: string | undefined,
  pageUrl: string
): Promise<Response | ErrorResponse> => {
  const { favourite } = values;
  const favourites: Species[] = await getFavourites(bearerToken);

  const product: Species = favourites.find(
    (f: Species) => `${f.species} ${f.stateLabel},${f.presentationLabel}, ${f.commodity_code}` === favourite
  ) ?? {
    redirect: pageUrl,
  };

  const commodityCode: CommodityCode | undefined = await getCommodityCode(
    product.speciesCode ?? "",
    product.state ?? "",
    product.presentation ?? "",
    product.commodity_code ?? ""
  );

  if (commodityCode) {
    product.commodity_code_description = commodityCode.description;
    product.presentationLabel = commodityCode.presentationLabel;
    product.faoName = commodityCode.faoName;
    product.stateLabel = commodityCode.stateLabel;
  }

  const { id, faoCode, faoName, ...requestBody } = product;
  const addFishResponse = await addFish(bearerToken, documentNumber, {
    ...requestBody,
    isFavourite: true,
    redirect: pageUrl,
  });

  const errors: IError[] = (addFishResponse.errors as IError[]) ?? [];
  if (!isEmpty(errors)) {
    return apiCallFailed(errors, values);
  }

  return redirect(pageUrl);
};

const saveAndContinueHandler = async (
  values: { [k: string]: string },
  bearerToken: string,
  documentNumber?: string
): Promise<Response | ErrorResponse> => {
  const response = await postAddedSpeciesPerUser(bearerToken, documentNumber);
  const isUnauthorised = response.unauthorised;
  if (isUnauthorised) {
    return redirect("/forbidden");
  }

  const errors: IError[] = response.errors;
  if (!isEmpty(errors)) {
    return apiCallFailed(errors, values);
  }

  const { landingsEntryOption } = await getLandingsEntryOption(bearerToken, documentNumber);
  if (landingsEntryOption === "directLanding") {
    return redirect(
      isEmpty(values.nextUri)
        ? route("/create-catch-certificate/:documentNumber/direct-landing", { documentNumber })
        : values.nextUri
    );
  }

  return redirect(
    isEmpty(values.nextUri)
      ? route("/create-catch-certificate/:documentNumber/add-landings", { documentNumber })
      : values.nextUri
  );
};
// Action Dependencies ends

export const WhatAreYouExportingLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const { landingsEntryOption, unauthorised } = await getLandingsEntryOption(bearerToken, documentNumber);

  if (landingsEntryOption === null) {
    return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
  }

  if (unauthorised) {
    return redirect("/forbidden");
  }

  const maxLandingsLimit = getEnv().LIMIT_ADD_LANDINGS;
  const speciesExemptLink = getEnv().SPECIES_EXEMPT_LINK;
  const session = await getSessionFromRequest(request);
  const hasActionExecuted = session.get("actionExecuted");
  const url = new URL(request.url);
  const productId = getFromSearchParams(url, "productId");

  let selectedSpecies = "";
  let selectedState = "";
  let selectedPresentation = "";
  let selectedCommodityCode = "";
  let isEditMode = false;
  let isProductAddSuccess = false;
  let isProductAddFailure = false;
  let nextUri;

  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  if (hasActionExecuted) {
    session.unset("actionExecuted");

    selectedSpecies = getSessionData(session, "species", "");
    selectedState = getSessionData(session, "state", "");
    selectedPresentation = getSessionData(session, "presentation", "");
    selectedCommodityCode = getSessionData(session, "commodityCode", "");
    isEditMode = getSessionData(session, "isEdit", false);
    isProductAddSuccess = session.get("success");
    isProductAddFailure = session.get("failure");
  } else if (!isEmpty(productId)) {
    const { products } = await getAddedSpeciesPerUser(bearerToken, documentNumber);
    const product: Product | undefined = products.find((p: Product) => p.id === productId);

    session.set("productId", productId);
    session.set("species", product?.species);

    selectedSpecies = getProductData(product, "species");
    selectedState = getProductData(product, "state");
    selectedPresentation = getProductData(product, "presentation");
    selectedCommodityCode = getProductData(product, "commodity_code");
    isEditMode = true;
    nextUri = getFromSearchParams(url, "nextUri");
  } else {
    clearSession(session, "what-are-you-exporting");
  }

  let faoCode = selectedSpecies;

  if (selectedSpecies.includes(")")) faoCode = getCodeFromLabel(selectedSpecies);

  if (isEmpty(faoCode)) {
    faoCode = session.get("speciesCode");
  }

  if (isEmpty(selectedState)) {
    selectedState = session.get("stateCode");
  }

  if (isEmpty(selectedPresentation)) {
    selectedPresentation = session.get("presentationCode");
  }

  const {
    products,
    species,
    favourites,
    stateLookup,
    stateCode,
    presentationCode,
    commodityCodes,
    stateLabel,
    presentationLabel,
    faoName,
    scientificName,
    commodity_code,
  } = await getAddSpeciesLoaderData(bearerToken, documentNumber, faoCode, selectedState, selectedPresentation);

  return new Response(
    JSON.stringify({
      key: Date.now(),
      products,
      species,
      favourites,
      stateLookup,
      stateCode: stateCode ?? selectedState,
      presentationCode: presentationCode ?? selectedPresentation,
      commodityCodes,
      stateLabel,
      presentationLabel,
      faoCode,
      scientificName,
      commodity_code,
      documentNumber,
      maxLandingsLimit,
      speciesExemptLink,
      isEditMode,
      isProductAddSuccess,
      isProductAddFailure,
      commodityCode: selectedCommodityCode,
      loaderSpecies: !isEmpty(faoName) && !isEmpty(faoCode) ? `${faoName} (${faoCode})` : undefined,
      nextUri,
      csrf,
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

export const WhatAreYouExportingAction = async (
  request: Request,
  params: Params
): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const { _action, ...rest } = Object.fromEntries(form);
  const values: { [k: string]: string } = {};
  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === "string") {
      values[key] = value;
    }
  }

  const session = await getSessionFromRequest(request);
  const pageUrl = route("/create-catch-certificate/:documentNumber/what-are-you-exporting", { documentNumber });

  session.set("actionExecuted", true);

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  switch (_action) {
    // Used when JS is disabled
    case "addSpecies": {
      return await addSpeciesHandler(values, session);
    }

    // Used when JS is disabled
    case "addState": {
      return await addStateHandler(values, session);
    }

    // Used when JS is disabled
    case "addPresentation": {
      return await addPresentationHandler(values, session);
    }

    case "cancel": {
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      session.unset("isEdit");
      return redirect(pageUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    case "addProduct": {
      return await addProductHandler(values, session, bearerToken, documentNumber, pageUrl);
    }

    case "editProduct": {
      return await editProductHandler(values, session, bearerToken, documentNumber, pageUrl);
    }

    case "addFromFavourite": {
      return await addFromFavouritesHandler(values, bearerToken, documentNumber, pageUrl);
    }

    case "remove": {
      await deleteFish(bearerToken, documentNumber, values.productId);
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      return redirect(pageUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Used when initiating Edit for an item from the product list
    case "edit": {
      const { products } = await getAddedSpeciesPerUser(bearerToken, documentNumber);
      const product: Product | undefined = products.find((p: Product) => p.id === values.productId);

      if (product !== undefined) {
        session.set("species", product.species);
        session.set("state", product.state);
        session.set("presentation", product.presentation);
        session.set("commodityCode", product.commodity_code);
        session.set("productId", values.productId);
      }

      session.set("isEdit", true);

      return redirect(pageUrl + "#productsTab", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    case "saveAsDraft": {
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      return redirect(route("/create-catch-certificate/catch-certificates"), {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    case "saveAndContinue": {
      return await saveAndContinueHandler(values, bearerToken, documentNumber);
    }
  }

  return redirect(pageUrl);
};
