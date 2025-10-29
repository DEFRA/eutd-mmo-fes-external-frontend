import type { IError, Journey } from "~/types";
import { SAVE_AND_VALIDATE_URL } from "~/urls.server";
import { post } from "~/communication.server";

interface IJourneySelection {
  journeySelection?: Journey;
  errors?: IError[];
}

export const journeySelectionSubmission = async (
  bearerToken: string,
  journeySelection: FormDataEntryValue
): Promise<IJourneySelection> => {
  const response: Response = await post(bearerToken, SAVE_AND_VALIDATE_URL, undefined, {
    journeySelection,
  });

  return await response.json();
};
