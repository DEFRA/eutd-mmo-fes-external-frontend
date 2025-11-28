import type {
  IDirectLandings,
  IDirectLandingsResponse,
  ILandings,
  IError,
  ErrorLookup,
  IUnauthorised,
  IDirectLandingsResponseDetails,
  landingsDetails,
  ICountry,
} from "~/types";

import { getErrorMessage } from "~/helpers";
import { GET_DIRECT_LANDINGS_URL, VALIDATE_DIRECT_LANDINGS_URL, GET_RFMO_AREAS_URL } from "~/urls.server";
import { get, post, getReferenceData } from "~/communication.server";
import { getCountries } from "./countries";

import { getEnv } from "~/env.server";
import isEmpty from "lodash/isEmpty";
import { onGetResponse } from "~/helpers/http-utils";

export const getDirectLandings = async (
  bearerToken: string,
  documentNumber?: string
): Promise<IDirectLandings | IUnauthorised> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  try {
    const response: Response = await get(bearerToken, GET_DIRECT_LANDINGS_URL, {
      documentNumber,
    });

    return onGetResponse(response);
  } catch (error) {
    throw new Error(`Unexpected error: ${error}`);
  }
};

export const validateDirectLandings = async (
  bearerToken: string,
  documentNumber: string | undefined,
  requestBody: ILandings
): Promise<IDirectLandingsResponse | IError[] | IUnauthorised> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    VALIDATE_DIRECT_LANDINGS_URL,
    {
      documentnumber: documentNumber,
    },
    {
      ...requestBody,
    }
  );

  return onValidateDirectLandingsResponse(response);
};

const transformAllErrors = (
  errors: ErrorLookup,
  products: IDirectLandingsResponse,
  landingLimitDaysInTheFuture: number
) => {
  const reduceFn = (acc: any, errorKey: string) => ({
    ...acc,
    ...transformError(errors, errorKey, products, landingLimitDaysInTheFuture),
  });
  return Object.keys(errors).reduce(reduceFn, {});
};

const onValidateDirectLandingsResponse = async (
  response: Response
): Promise<IDirectLandingsResponse | IError[] | IUnauthorised> => {
  switch (response.status) {
    case 200:
      const res = await response.text();
      return JSON.parse(res);
    case 400:
      const errorResponse = await response.json();
      const formatErrors = transformAllErrors(
        errorResponse.errors,
        errorResponse,
        getEnv().LANDING_LIMIT_DAYS_FUTURE as number
      );
      let errorsFormat =
        formatErrors &&
        Object.keys(formatErrors).map((key: string) =>
          (formatErrors[key]["key"] && formatErrors[key]["key"] === "error.weights.exportWeight.number.base") ||
          (formatErrors[key]["key"] && formatErrors[key]["key"] === "error.seasonalFish.invalidate") ||
          (formatErrors[key]["key"] && formatErrors[key]["key"] === "error.startDate.seasonalFish.invalidate") ||
          (formatErrors[key]["key"] && formatErrors[key]["key"] === "error.dateLanded.date.max")
            ? {
                key: key,
                message: getErrorMessage(formatErrors[key]["key"].replace(/\.[0-9]+/, "")),
                value: { dynamicValue: formatErrors[key]["params"] },
              }
            : {
                key: key,
                message: isEmpty(formatErrors[key]["key"])
                  ? getErrorMessage(formatErrors[key])
                  : getErrorMessage(formatErrors[key]["key"].replace(/\.[0-9]+/, "")),
              }
        );
      return errorsFormat;
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const transformError = (
  errors: ErrorLookup,
  errorKey: string,
  products: IDirectLandingsResponse,
  landingLimitDaysInTheFuture: number
) => {
  if (errors[errorKey] === "error.seasonalFish.invalidate") {
    const product: string =
      products.items.find((value: IDirectLandingsResponseDetails) =>
        value.landings.some(
          (landing: landingsDetails) => landing.error === "invalid" && landing.errors["dateLanded"] === errors[errorKey]
        )
      )?.product.species.label ?? "";

    return {
      [errorKey]: {
        key: errors[errorKey],
        params: [product],
      },
    };
  } else if (errors[errorKey] === "error.startDate.seasonalFish.invalidate") {
    const product: string =
      products.items.find((value: IDirectLandingsResponseDetails) =>
        value.landings.some(
          (landing: landingsDetails) => landing.error === "invalid" && landing.errors["startDate"] === errors[errorKey]
        )
      )?.product.species.label ?? "";

    return {
      [errorKey]: {
        key: errors[errorKey],
        params: [product],
      },
    };
  } else if (errorKey === "dateLanded" || errorKey === "vessel.vesselName") {
    return {
      [errorKey]: {
        key: errors[errorKey],
        params: [landingLimitDaysInTheFuture],
      },
    };
  } else if (errorKey.includes("exportWeight")) {
    const index: number = parseInt(errorKey.split(".")[1]);
    const product = products.items[index].product;

    return {
      [errorKey]: {
        key: errors[errorKey],
        params: [product.species.label, product.state.label, product.presentation.label, product.commodityCode],
      },
    };
  } else {
    return {
      [errorKey]: errors[errorKey],
    };
  }
};

export const getRfmos = async (): Promise<string[]> => {
  const response: Response = await getReferenceData(GET_RFMO_AREAS_URL);
  return response.json();
};

/**
 * Transforms form values containing EEZ (Exclusive Economic Zone) country names
 * into an array of ICountry objects
 * @param values - form values object containing keys that start with "eez"
 * @returns Promise<ICountry[]> - array of country objects matching the EEZ values
 */
export const getSelectedEezInIcountryFormat = async (values: any): Promise<ICountry[]> => {
  const eezCountries = Object.keys(values)
    .filter((key) => key.startsWith("eez"))
    .map((key) => values[key]);

  if (!eezCountries) return [];

  const countries: ICountry[] = await getCountries();

  return eezCountries.reduce((acc: ICountry[], countryName: string) => {
    const country = countries.find((c: ICountry) => c.officialCountryName === countryName);
    if (country) {
      acc.push(country);
    } else {
      acc.push({ officialCountryName: countryName });
    }
    return acc;
  }, []);
};
