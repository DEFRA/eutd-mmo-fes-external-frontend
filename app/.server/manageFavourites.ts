import type { Params } from "@remix-run/router/dist/utils";
import setApiMock from "tests/msw/helpers/setApiMock";
import { getEnv } from "~/env.server";
import { getBearerTokenForRequest } from "./auth";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { getCodeFromLabel } from "~/helpers";
import { apiCallFailed } from "~/communication.server";
import { addProductFavourites, deleteProductFavourites, getAllProductFavourites } from "./favourites";
import { redirect } from "@remix-run/node";
import isEmpty from "lodash/isEmpty";
import type { CommodityCode, ErrorResponse, IError, Species } from "~/types";
import { getCommodityCode, validateValues } from "./whatAreYouExporting";
import { createCSRFToken, validateCSRFToken } from "./csrfToken";

export const manageFavouritesLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const speciesExemptLink = getEnv().SPECIES_EXEMPT_LINK;
  const bearerToken = await getBearerTokenForRequest(request);
  const csrf = createCSRFToken();
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);
  const selectedSpecies = session.get("species") ?? "";
  const selectedState = session.get("state") ?? "";
  const selectedPresentation = session.get("presentation") ?? "";
  const selectedCommodityCode = session.get("commodityCode") ?? "";

  let faoCode = selectedSpecies;
  if (selectedSpecies.includes(")")) faoCode = getCodeFromLabel(selectedSpecies);

  const {
    favourites,
    species,
    stateLookup,
    faoName,
    scientificName,
    stateLabel,
    presentationLabel,
    commodity_code,
    stateCode,
    presentationCode,
    commodityCodes,
  } = await getAllProductFavourites(bearerToken, faoCode, selectedState, selectedPresentation);

  return new Response(
    JSON.stringify({
      key: Date.now(),
      documentNumber,
      csrf,
      favourites,
      species,
      stateLookup,
      faoCode,
      faoName,
      scientificName,
      stateLabel,
      presentationLabel,
      commodity_code,
      stateCode: stateCode ?? selectedState,
      presentationCode: presentationCode ?? selectedPresentation,
      commodityCodes,
      speciesExemptLink,
      commodityCode: selectedCommodityCode,
      loaderSpecies: !isEmpty(faoName) && !isEmpty(faoCode) ? `${faoName} (${faoCode})` : undefined,
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

export const manageFavouritesAction = async (request: Request, pageUrl: string): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const { _action, ...values } = Object.fromEntries(form);
  const session = await getSessionFromRequest(request);

  switch (_action) {
    // Used when JS is disabled
    case "addSpecies": {
      const errors: IError[] = validateValues(["species"], values);
      if (errors.length > 0) {
        return apiCallFailed(errors, values);
      }

      session.set("species", values.species);
      session.unset("state");
      session.unset("presentation");

      return redirect("?#add-state", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Used when JS is disabled
    case "addState": {
      const errors: IError[] = validateValues(["species", "state"], values);
      if (errors.length > 0) {
        return apiCallFailed(errors, values);
      }

      session.set("state", values.state);
      session.unset("presentation");

      return redirect("?#add-presentation", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    // Used when JS is disabled
    case "addPresentation": {
      const errors: IError[] = validateValues(["species", "state", "presentation"], values);
      if (errors.length > 0) {
        return apiCallFailed(errors, values);
      }

      session.set("presentation", values.presentation);

      return redirect("?#addCommodityCode", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    case "cancel": {
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      return redirect(pageUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    case "addProduct": {
      const stateCode: string = values.jsFlag ? (values.state as string) : (values.stateCode as string);
      const presentationCode: string = values.jsFlag
        ? (values.presentation as string)
        : (values.presentationCode as string);
      const commodity: CommodityCode | undefined = await getCommodityCode(
        values.speciesCode as string,
        stateCode,
        presentationCode,
        values.commodityCode as string
      );

      const requestBody: Species = {
        presentation: presentationCode,
        presentationLabel: values.presentationLabel as string,
        species: values.species as string,
        speciesCode: values.speciesCode as string,
        state: stateCode,
        stateLabel: values.stateLabel as string,
        scientificName: values.scientificName as string,
        commodity_code: values.commodityCode as string,
        commodity_code_description: commodity?.description,
        redirect: pageUrl,
      };
      const addFishResponse = await addProductFavourites(bearerToken, requestBody);
      const errors = (addFishResponse.errors as IError[]) || {};
      if (!isEmpty(errors)) {
        return apiCallFailed(errors, values);
      }
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      return redirect(pageUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    case "remove": {
      await deleteProductFavourites(bearerToken, values.favouritesId as string);
      session.unset("species");
      session.unset("state");
      session.unset("presentation");
      return redirect(pageUrl, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  return redirect(pageUrl);
};
