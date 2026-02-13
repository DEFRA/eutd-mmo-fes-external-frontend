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
      // Map direct-landing-specific error messages
      const directLandingErrorMap: Record<string, string> = {
        "error.dateLanded.date.max": "ccDirectLandingDateLandedFutureDateError",
        "error.dateLanded.date.base": "ccDirectLandingDateLandedInvalidError",
        "error.dateLanded.any.required": "ccDirectLandingDateLandedRequiredError",
        "error.dateLanded.any.empty": "ccDirectLandingDateLandedRequiredError",
        "error.dateLanded.date.isoDate": "ccDirectLandingDateLandedInvalidError",
        "error.vessel.vesselName.any.required": "ccDirectLandingVesselRequiredError",
        "error.vessel.string.base": "ccDirectLandingVesselRequiredError",
        "error.vessel.label.any.empty": "ccDirectLandingVesselRequiredError",
        "error.vessel.vessel.vesselName.any.empty": "ccDirectLandingVesselRequiredError",
        "error.vessel.any.required": "ccDirectLandingVesselRequiredError",
        "error.weights.exportWeight.number.base": "ccDirectLandingExportWeightRequiredError",
        "error.weights.exportWeight.any.required": "ccDirectLandingExportWeightRequiredError",
        "error.weights.exportWeight.any.empty": "ccDirectLandingExportWeightRequiredError",
      };

      let errorsFormat =
        formatErrors &&
        Object.keys(formatErrors).map((key: string) => {
          const errorKey = formatErrors[key]["key"];
          const errorKeyNormalized = errorKey?.replace(/\.[0-9]+/, "");

          // Use direct-landing-specific error message if available
          const errorMessage =
            directLandingErrorMap[errorKeyNormalized] ||
            (isEmpty(errorKey) ? getErrorMessage(formatErrors[key]) : getErrorMessage(errorKeyNormalized));

          // Handle errors with dynamic values
          if (
            (errorKey && errorKey === "error.weights.exportWeight.number.base") ||
            (errorKey && errorKey === "error.seasonalFish.invalidate") ||
            (errorKey && errorKey === "error.startDate.seasonalFish.invalidate") ||
            (errorKey && errorKey === "error.dateLanded.date.max")
          ) {
            return {
              key: key,
              message: errorMessage,
              value: { dynamicValue: formatErrors[key]["params"] },
            };
          }

          return {
            key: key,
            message: errorMessage,
          };
        });
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
  } else if (errorKey === "dateLanded") {
    // FIO-10474: Handle dateLanded errors separately with landing limit param
    return {
      [errorKey]: {
        key: errors[errorKey],
        params: [landingLimitDaysInTheFuture],
      },
    };
  } else if (errorKey === "vessel.vesselName") {
    // FIO-10474: Handle vessel errors separately without date-related params
    return {
      [errorKey]: {
        key: errors[errorKey],
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
