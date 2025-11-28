import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getLandingsEntryOption,
  getConservation,
  getAddedSpeciesPerUser,
  saveConservation,
  validateCSRFToken,
} from "~/.server";
import { apiCallFailed } from "~/communication.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type { conservationProps, IBase, IConservation, IError, IErrorsTransformed, ErrorResponse } from "~/types";

export const WhoseWatersWereTheyCaughtInLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber } = params;
  const { landingsEntryOption } = await getLandingsEntryOption(bearerToken, documentNumber);
  if (landingsEntryOption === null) {
    return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
  }

  const conservation: IConservation = await getConservation(bearerToken, documentNumber);
  if (conservation?.unauthorised) {
    return redirect("/forbidden");
  }

  const { products } = await getAddedSpeciesPerUser(bearerToken, documentNumber);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const ccContext = "/create-catch-certificate/:documentNumber";
  const page = landingsEntryOption === "directLanding" ? "direct-landing" : "add-landings";
  const backUri =
    products.length === 0
      ? route("/create-catch-certificate/:documentNumber/what-are-you-exporting", { documentNumber })
      : `${ccContext}/${page}`.replace(":documentNumber", documentNumber);

  return new Response(
    JSON.stringify({
      ...conservation,
      documentNumber,
      landingsEntryOption,
      nextUri,
      backUri,
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

export const WhoseWatersWereTheyCaughtInAction = async (
  request: Request,
  params: Params
): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const buttonClicked = form.get("_action") as string;
  const caughtInUKWaters = form.get("caughtInUKWaters") as string;
  const caughtInEUWaters = form.get("caughtInEUWaters") as string;
  const caughtInOtherWaters = form.get("caughtInOtherWaters") as string;
  const otherWaters = form.get("otherWaters") as string;

  let conservation: conservationProps = {};
  if (caughtInUKWaters === "Y") conservation.caughtInUKWaters = caughtInUKWaters;
  if (caughtInEUWaters === "Y") conservation.caughtInEUWaters = caughtInEUWaters;
  if (caughtInOtherWaters === "Y") {
    conservation.caughtInOtherWaters = caughtInOtherWaters;
    conservation.otherWaters = otherWaters;
  }

  const currentUri = route("/create-catch-certificate/:documentNumber/whose-waters-were-they-caught-in", {
    documentNumber,
  });
  const nextUri = isEmpty(form.get("nextUri"))
    ? route("/create-catch-certificate/:documentNumber/what-export-journey", { documentNumber })
    : (form.get("nextUri") as string);
  const isConservationSavedAsDraft: boolean = buttonClicked === "saveAsDraft";

  if (buttonClicked === "saveAndContinue" || buttonClicked === "saveAsDraft") {
    const conservationResponse: IBase = await saveConservation(
      bearerToken,
      documentNumber,
      { ...conservation },
      currentUri,
      nextUri,
      isConservationSavedAsDraft
    );
    const errors: IError[] | IErrorsTransformed = (conservationResponse.errors as IError[]) || [];
    const unauthorised = conservationResponse.unauthorised as boolean;

    const isValid = await validateCSRFToken(request, form);
    if (!isValid) return redirect("/forbidden");

    if (unauthorised) {
      return redirect("/forbidden");
    }

    if (buttonClicked === "saveAndContinue" && errors.length > 0) {
      const values = Object.fromEntries(form);
      return apiCallFailed(errors, values);
    }
  }

  return buttonClicked === "saveAsDraft"
    ? redirect(route("/create-catch-certificate/catch-certificates"))
    : redirect(nextUri);
};
