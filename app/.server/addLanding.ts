import { redirect, type Session, type SessionData, type TypedResponse } from "@remix-run/node";
import { getErrorMessage, getTransformedError } from "~/helpers";
import { commitSession } from "~/sessions.server";
import type { ErrorResponse, IError, IErrorsTransformed, IUnauthorised, ProductsLanded } from "~/types";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import { getGroupedAddLandingErrorFieldIds, nonJsDateValidation, saveAddLandingsDetails } from "~/.server";
import { apiCallFailed } from "~/communication.server";

export const addLandingSessionKeys = [
  "selectedProduct",
  "selectedStartDate",
  "selectedDate",
  "selectedFaoArea",
  "selectedWeight",
  "selectedVessel",
  "gearCategory",
  "gearType",
  "selectedHighSeasArea",
  "selectedExclusiveEconomiceZones",
  "selectedRfmo",
  "landingId",
  "editLanding",
  "hasLandingError",
];

function instanceOfUnauthorised(data: ProductsLanded | IUnauthorised): data is IUnauthorised {
  return "unauthorised" in data;
}

const getSaveAndContinueErrors: (addLandingsResp: ProductsLanded) => IError[] = (addLandingsResp: ProductsLanded) =>
  addLandingsResp.errors ?? [];

const clearSessionKeys = (session: Session<SessionData, SessionData>, keys: string[]) =>
  keys?.forEach((k) => session.unset(k));

export const addDateLandedAction = async (
  dateLanded: string,
  request: Request,
  formData: Record<string, FormDataEntryValue>,
  session: Session<SessionData, SessionData>
) => {
  const result = await nonJsDateValidation(request, formData, dateLanded, "dateLanded");
  if (result !== null) {
    return result;
  }

  return redirect("?#vessels", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const addGearCategoryAction = async (
  gearCategory: string,
  formData: Record<string, FormDataEntryValue>,
  session: Session<SessionData, SessionData>
) => {
  if (gearCategory === "") {
    const errors = getTransformedError([
      {
        key: "gearCategory",
        message: getErrorMessage("error.gearCategory.string.empty"),
      },
    ]);
    return new Response(
      JSON.stringify({
        values: formData,
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
  // clear old gear type selection when the category is changed
  session.set("gearType", "");
  return redirect("?#gearType", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const saveAndContinueAction = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<TypedResponse<any> | Response | ErrorResponse | undefined> => {
  const addLandingsResp: ProductsLanded | IUnauthorised = await saveAddLandingsDetails(bearerToken, documentNumber);

  if (instanceOfUnauthorised(addLandingsResp)) {
    return redirect(route("/forbidden"));
  }

  const errors: IError[] | IErrorsTransformed = getSaveAndContinueErrors(addLandingsResp);
  if (!isEmpty(errors)) {
    return apiCallFailed(errors);
  }
};

export const okActionResponse = async (
  payload: any,
  session: Session<SessionData, SessionData>,
  sessionKeysToClear: string[] = addLandingSessionKeys
) => {
  clearSessionKeys(session, sessionKeysToClear);
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};
