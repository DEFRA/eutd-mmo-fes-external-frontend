import type { ICountry } from "~/types";
import { COUNTRIES_URL } from "~/urls.server";
import { getReferenceData } from "~/communication.server";
import serverLogger from "~/logger.server";
import { cacheGet, cacheSet } from "./referenceDataCache";

const COUNTRIES_CACHE_KEY = "ref:countries";

export const getCountries = async (): Promise<ICountry[]> => {
  const cached = cacheGet<ICountry[]>(COUNTRIES_CACHE_KEY);
  if (cached) {
    return cached;
  }

  try {
    const response: Response = await getReferenceData(COUNTRIES_URL);
    const countries = await onGetCountriesResponse(response);
    if (countries.length > 0) {
      cacheSet(COUNTRIES_CACHE_KEY, countries);
    }
    return countries;
  } catch (e) {
    if (e instanceof Error) {
      serverLogger.error(`[GET-COUNTRIES][FAIL][ERROR][${e.stack ?? e}]`);
    }

    return [];
  }
};

/**
 * Returns a Map keyed by lowercase `officialCountryName` for O(1) lookups.
 * All callers that do `.find(c => c.officialCountryName === x)` should prefer
 * this over iterating the full array on every request.
 */
export const getCountriesByName = async (): Promise<Map<string, ICountry>> => {
  const countries = await getCountries();
  const map = new Map<string, ICountry>();
  for (const country of countries) {
    if (country.officialCountryName) {
      map.set(country.officialCountryName.toLowerCase(), country);
    }
  }
  return map;
};

const onGetCountriesResponse = async (response: Response): Promise<ICountry[]> => {
  switch (response.status) {
    case 200:
      return await response.json();
    case 204:
    case 400:
    case 500:
      return [];
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
