import isEmpty from "lodash/isEmpty";
import { getFavourites } from "~/.server";
import { getErrorMessage } from "~/helpers";
import { ADDED_SPECIES_URL, COMMODITY_CODE_LOOK_UP, SPECIES_STATE_LOOK_UP, SPECIES_URL } from "~/urls.server";
import { getReferenceData, get, post } from "~/communication.server";
import type { CommodityCode, IError, LabelAndValue, Product, SearchState, Species } from "~/types";
import logger from "~/logger.server";
import moment from "moment";

export const getAddSpeciesLoaderData = async (
  bearerToken: string,
  documentNumber: string | undefined,
  faoCode: string,
  stateCode: string,
  presentationCode: string
): Promise<any> => {
  try {
    const [getAddedSpeciesPerUserData, species, favourites] = await Promise.all([
      getAddedSpeciesPerUser(bearerToken, documentNumber),
      getAllSpecies(true),
      getFavourites(bearerToken),
    ]);

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

    const data = {
      ...getAddedSpeciesPerUserData,
      species,
      favourites,
      stateLookup,
      ...findSpeciesName(faoCode, species),
      stateCode,
      presentationCode,
      commodityCodes,
      stateLabel: stateLabel ?? "",
      presentationLabel: presentationLabel ?? "",
    };

    return data;
  } catch (error) {
    throw new Error(`Unexpected error: ${error}`);
  }
};

export const postAddedSpeciesPerUser = async (
  bearerToken: string,
  documentNumber?: string
): Promise<{ errors: IError[]; unauthorised?: boolean }> => {
  if (!documentNumber) {
    throw new Error("Catch Certificate document number is required");
  }

  const response: Response = await post(bearerToken, ADDED_SPECIES_URL, { documentNumber }, {});
  switch (response.status) {
    case 200:
    case 204:
      return {
        errors: [],
      };
    case 400:
      const data = await response.json();
      const res = {
        errors: Object.keys(data).map((key: string) => ({
          key: key,
          message: getErrorMessage(data[key]),
        })),
      };
      return res;
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const getAddedSpeciesPerUser = async (
  bearerToken: string,
  documentNumber?: string
): Promise<{ products: Product[]; documentNumber: string }> => {
  if (!documentNumber) {
    throw new Error("Catch Certificate document number is required");
  }

  const response: Response = await get(bearerToken, ADDED_SPECIES_URL, { documentNumber });

  const addedSpeciesPerUser: { species: Product[] } = (await response.json()) ?? { species: [] };

  return !isEmpty(addedSpeciesPerUser.species)
    ? {
        products: addedSpeciesPerUser.species,
        documentNumber,
      }
    : {
        products: [],
        documentNumber,
      };
};

export const getAllSpecies = async (ukOnly: boolean = false): Promise<Species[]> => {
  const getAllSpeciesStartTime = moment();
  const response: Response = await getReferenceData(`${SPECIES_URL}${ukOnly ? "?uk=Y" : ""}`);
  const getAllSpeciesEndTime = moment();
  logger.info(
    `Getting all the Species data run time from the blob/container storage for catch certificates - ${getAllSpeciesEndTime.diff(
      getAllSpeciesStartTime,
      "milliseconds"
    )}`
  );
  const species = await response.json();
  return species;
};

export const searchStateLookup = async (fao: string | null): Promise<SearchState[]> => {
  if (!fao) {
    throw new Error("FAO is required");
  }

  const response: Response = await getReferenceData(`${SPECIES_STATE_LOOK_UP}?faoCode=${fao}`);
  const data: SearchState[] = await response.json();
  return data;
};

export const getCommodityCodes = async (
  faoCode: string,
  stateCode: string,
  presentationCode: string
): Promise<LabelAndValue[]> => {
  if (!faoCode || !stateCode || !presentationCode) {
    return [];
  }

  const response: Response = await getReferenceData(
    `${COMMODITY_CODE_LOOK_UP}?speciesCode=${faoCode}&state=${stateCode}&presentation=${presentationCode}`
  );
  const commodityCodes: CommodityCode[] = await response.json();
  return commodityCodes.map((commodityCode: CommodityCode) => ({
    label: `${commodityCode.code} - ${commodityCode.description}`,
    value: commodityCode.code,
    description: commodityCode.description,
  }));
};

export const getCommodityCode = async (
  faoCode: string,
  stateCode: string,
  presentationCode: string,
  commodityCode: string
): Promise<CommodityCode | undefined> => {
  const response: Response = await getReferenceData(
    `${COMMODITY_CODE_LOOK_UP}?speciesCode=${faoCode}&state=${stateCode}&presentation=${presentationCode}`
  );

  const commodityCodes: CommodityCode[] = await response.json();
  return Array.isArray(commodityCodes) && commodityCodes.length > 0
    ? commodityCodes.find((comCode: CommodityCode) => comCode.code === commodityCode)
    : undefined;
};

export const findSpeciesName = (faoCode: string, species: Species[]): Species | undefined => {
  if (!faoCode || !species.length) {
    return undefined;
  }

  return species.find((species: Species) => species.faoCode === faoCode);
};

const validationErrorMessage: { [key: string]: string } = {
  species: "error.species.any.empty",
  state: "error.state.any.required",
  presentation: "error.presentation.any.required",
};

export const validateValues = (validate: string[], values: any): IError[] =>
  validate.reduce((acc: IError[], key: string) => {
    if (!values[key]) {
      return [
        ...acc,
        {
          key,
          message: getErrorMessage(validationErrorMessage[key]),
        },
      ];
    }

    return acc;
  }, []);
