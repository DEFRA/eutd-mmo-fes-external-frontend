import { getErrorMessage, getCodeFromLabel } from "~/helpers";
import { get, post, deleteRequest } from "~/communication.server";
import { FAVOURITES_URL } from "~/urls.server";
import type { IError, LabelAndValue, Product, SearchState, Species } from "~/types";
import {
  findSpeciesName,
  getAllSpecies,
  getBearerTokenForRequest,
  getCommodityCodes,
  searchStateLookup,
} from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { type Params } from "@remix-run/react";
import { getEnv } from "~/env.server";
import { getSessionFromRequest } from "~/sessions.server";
import isEmpty from "lodash/isEmpty";

export const favouritesLoader = async (request: Request, params: Params): Promise<Response> => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const speciesExemptLink = getEnv().SPECIES_EXEMPT_LINK;
  const bearerToken = await getBearerTokenForRequest(request);

  const session = await getSessionFromRequest(request);
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
      },
    }
  );
};

export const getFavourites = async (bearerToken: string): Promise<Species[]> => {
  const response: Response = await get(bearerToken, FAVOURITES_URL);

  return await response.json();
};

export const getAllProductFavourites = async (
  bearerToken: string,
  faoCode: string,
  stateCode: string,
  presentationCode: string
): Promise<any> => {
  try {
    const [favourites, species] = await Promise.all([getFavourites(bearerToken), getAllSpecies(true)]);

    let stateLookup: SearchState[] = [];
    let stateLabel: string | undefined;
    let presentationLabel: string | undefined;
    let commodityCodes: LabelAndValue[] = [];

    if (faoCode) {
      stateLookup = await searchStateLookup(faoCode);
      stateLabel = stateLookup.find((_: SearchState) => _.state.value === stateCode)?.state.label;

      if (stateLabel) {
        presentationLabel = stateLookup
          .find((_: SearchState) => _.state.value === stateCode)
          ?.presentations.find((p: LabelAndValue) => p.value === presentationCode)?.label;

        if (presentationLabel) {
          commodityCodes = await getCommodityCodes(faoCode, stateCode, presentationCode);
        }
      }
    }

    return {
      favourites,
      species,
      stateLookup,
      ...findSpeciesName(faoCode, species),
      stateCode,
      presentationCode,
      commodityCodes,
      stateLabel: stateLabel ?? "",
      presentationLabel: presentationLabel ?? "",
    };
  } catch (error) {
    throw new Error(`Unexpected error: ${error}`);
  }
};

export const addProductFavourites = async (bearerToken: string, fishObj: Species): Promise<Product> => {
  const response: Response = await post(bearerToken, `${FAVOURITES_URL}`, {}, { ...fishObj });

  return onAddFavouriteResponse(response);
};

const onAddFavouriteResponse = async (response: Response): Promise<Product> => {
  switch (response.status) {
    case 200:
    case 204:
      const AddFishResponse: any = await response.json();
      return AddFishResponse;
    case 400:
      const data = await response.json();
      const errors: IError[] = Object.keys(data).map((error: string) =>
        error === "error.favourite.max"
          ? {
              key: data[error]["key"],
              message: getErrorMessage(data[error]["key"]),
              value: { dynamicValue: data[error]["params"]["limit"] },
            }
          : {
              key: error,
              message: getErrorMessage(data[error]),
            }
      );
      return {
        user_id: null,
        id: "",
        errors,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const deleteProductFavourites = async (bearerToken: string, fishId: string): Promise<{ cancel: string }> => {
  const response: Response = await deleteRequest(bearerToken, `${FAVOURITES_URL}/${fishId}`);

  return onDeleteProductFavourites(response);
};

const onDeleteProductFavourites = async (response: Response): Promise<{ cancel: string }> => {
  switch (response.status) {
    case 200:
    case 204:
      const removeFishResponse: any = await response.json();
      return removeFishResponse;
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
