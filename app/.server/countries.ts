import type { ICountry } from "~/types";
import { COUNTRIES_URL } from "~/urls.server";
import { getReferenceData } from "~/communication.server";
import serverLogger from "~/logger.server";
import { getCached } from "./referenceDataCache";

export const getCountries = async (): Promise<ICountry[]> =>
  getCached("countries", async () => {
    try {
      const response: Response = await getReferenceData(COUNTRIES_URL);
      return onGetCountriesResponse(response);
    } catch (e) {
      if (e instanceof Error) {
        serverLogger.error(`[GET-COUNTRIES][FAIL][ERROR][${e.stack ?? e}]`);
      }
      return [];
    }
  });

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
