import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  getBearerTokenForRequest,
  getLandingsEntryOption,
  createCSRFToken,
  addLandingsEntryOption,
  validateCSRFToken,
} from "~/.server";
import { getTransformedError } from "~/helpers";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type {
  IError,
  IErrorsTransformed,
  ILandingsEntryOptionGet,
  ILandingsEntryOptionPost,
  LandingEntryType,
} from "~/types";

export const LandingEntryLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber } = params;
  const { landingsEntryOption, generatedByContent, unauthorised }: ILandingsEntryOptionGet =
    await getLandingsEntryOption(bearerToken, documentNumber);

  if (unauthorised) {
    return redirect("/forbidden");
  }

  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const session = await getSessionFromRequest(request);

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  const copyDocumentAcknowledged = session.get(`copyDocumentAcknowledged-${documentNumber}`) === "Y";
  const copyDocumentNumber = session.get(`documentNumber-${documentNumber}`);
  const voidDocumentConfirm = session.get(`voidOriginal-${documentNumber}`)
    ? session.get(`voidOriginal-${documentNumber}`) == true
    : session.get(`copyVoidDocument-${documentNumber}`) === "voidDocumentConfirm";

  return new Response(
    JSON.stringify({
      landingsEntryOption,
      generatedByContent,
      documentNumber: copyDocumentNumber,
      copyDocumentAcknowledged,
      voidDocumentConfirm,
      nextUri,
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

export const LandingEntryAction = async (request: Request, params: Params): Promise<Response> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const form = await request.formData();
  const oldLanding = form.get("currentLanding") as LandingEntryType;
  const newLanding = form.get("landingsEntry") as LandingEntryType;
  const nextUri = form.get("nextUri") as string;
  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);

  const nonDirectLandings: LandingEntryType[] = ["manualEntry", "uploadEntry"];

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  // Redirect to confirmation if changing from direct to a non-direct landing (or vice versa)
  const redirectToLandingConfirmationPage =
    (oldLanding === "directLanding" && nonDirectLandings.includes(newLanding)) ||
    (nonDirectLandings.includes(oldLanding) && newLanding === "directLanding");

  if (redirectToLandingConfirmationPage) {
    const redirectUrl = route(`/create-catch-certificate/:documentNumber/landings-type-confirmation`, {
      documentNumber: documentNumber,
    });

    session.set("newLanding", newLanding);

    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const landingsEntryOption: ILandingsEntryOptionPost = await addLandingsEntryOption(
    bearerToken,
    documentNumber,
    newLanding
  );
  const errors: IError[] | IErrorsTransformed = (landingsEntryOption.errors as IError[]) || [];
  const unauthorised = landingsEntryOption.unauthorised as boolean;

  if (unauthorised) {
    return redirect("/forbidden", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (Array.isArray(errors) && errors.length > 0) {
    return new Response(
      JSON.stringify({
        errors: getTransformedError(errors),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return redirect(
    isEmpty(nextUri) ? route("/create-catch-certificate/:documentNumber/progress", { documentNumber }) : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
