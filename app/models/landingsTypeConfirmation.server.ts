import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  getBearerTokenForRequest,
  getLandingsEntryOption,
  createCSRFToken,
  confirmChangeLandingsType,
  validateCSRFToken,
} from "~/.server";
import { apiCallFailed } from "~/communication.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type { LandingEntryType, ErrorResponse, IError, IErrorsTransformed, ILandingsEntryChange } from "~/types";

export const LandingsTypeConfirmationLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber } = params;
  const session = await getSessionFromRequest(request);
  const newLanding = session.get("newLanding");
  const { landingsEntryOption, unauthorised } = await getLandingsEntryOption(bearerToken, documentNumber);

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  const landingTypes: LandingEntryType[] = ["manualEntry", "uploadEntry", "directLanding"];
  const isLandingEntryOption = landingTypes.includes(newLanding);

  if (isEmpty(newLanding) || !isLandingEntryOption || landingsEntryOption === newLanding || unauthorised) {
    return redirect("/forbidden");
  }

  return new Response(JSON.stringify({ documentNumber, newLanding, csrf }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const LandingsTypeConfirmationAction = async (
  request: Request,
  params: Params
): Promise<Response | ErrorResponse> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const confirmationAnswer = form.get("confirmLandingsChange") ?? "";
  const previousLandings = form.get("newLanding") as LandingEntryType;
  const buttonClicked = form.get("_action") as string;
  const landingsEntryOption = previousLandings;
  const currentUri = `/create-catch-certificate/${documentNumber}/landings-type-confirmation`;
  const journey = "catchCertificate";

  const session = await getSessionFromRequest(request);
  session.unset("newLanding");

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const updatedSession = await commitSession(session);

  if ((confirmationAnswer === "No" && buttonClicked === "continue") || buttonClicked === "cancel") {
    return redirect(
      route("/create-catch-certificate/:documentNumber/landings-entry", {
        documentNumber,
      }),
      {
        headers: {
          "Set-Cookie": updatedSession,
        },
      }
    );
  }

  if (buttonClicked === "continue") {
    const confirmChangeLandingsTypeResponse: ILandingsEntryChange = await confirmChangeLandingsType(
      bearerToken,
      documentNumber,
      currentUri,
      journey,
      confirmationAnswer as string,
      landingsEntryOption
    );
    const errors: IError[] | IErrorsTransformed = (confirmChangeLandingsTypeResponse.errors as IError[]) || [];
    const unauthorised = confirmChangeLandingsTypeResponse.unauthorised as boolean;

    if (unauthorised) {
      return redirect("/forbidden", {
        headers: {
          "Set-Cookie": updatedSession,
        },
      });
    }

    if (errors.length > 0) {
      return apiCallFailed(errors);
    }
  }

  return redirect(
    route("/create-catch-certificate/:documentNumber/progress", {
      documentNumber,
    }),
    {
      headers: {
        "Set-Cookie": updatedSession,
      },
    }
  );
};
