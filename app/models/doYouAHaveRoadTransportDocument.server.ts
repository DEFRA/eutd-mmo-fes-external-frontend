import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getLandingsEntryOption,
  getTransportById,
  updateTransport,
  validateCSRFToken,
} from "~/.server";
import i18next from "~/i18next.server";
import { apiCallFailed } from "~/communication.server";
import { vehicleToUrlSlug } from "~/helpers";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import type { ITransport, Vehicle, Cmr, IError, IErrorsTransformed, ErrorResponse } from "~/types";

export const DoYouAHaveRoadTransportDocumentLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  let csrf: string;

  if (session.has("csrf")) {
    csrf = session.get("csrf");
  } else {
    csrf = createCSRFToken();
    session.set("csrf", csrf);
  }

  const { documentNumber } = params;

  const splitParams = params["*"]?.split("/");
  const transportId = splitParams ? splitParams[0] : "";

  if (!transportId) {
    return redirect(
      route("/create-catch-certificate/:documentNumber/how-does-the-export-leave-the-uk", { documentNumber })
    );
  }

  const { landingsEntryOption, unauthorised } = await getLandingsEntryOption(bearerToken, documentNumber);

  if (unauthorised || landingsEntryOption === "directLanding") {
    return redirect("/forbidden");
  }

  if (!landingsEntryOption) {
    return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
  }

  const { cmr, vehicle } = await getTransportById(bearerToken, documentNumber, transportId);

  if (vehicle !== "truck") {
    return redirect("/forbidden");
  }

  const t = await i18next.getFixedT(request, ["title"]);
  const pageTitle = t("doYouHaveARoadTransportDocumentTitle", { ns: "title" });
  const commonTitle = t("ccCommonTitle", { ns: "title" });

  return new Response(
    JSON.stringify({
      transportId,
      documentNumber,
      cmr,
      vehicle,
      csrf,
      pageTitle,
      commonTitle,
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

export const DoYouAHaveRoadTransportDocumentAction = async (
  request: Request,
  params: Params
): Promise<Response | ErrorResponse | undefined> => {
  const { documentNumber } = params;
  const splitParams = params["*"]?.split("/");
  const transportId = splitParams ? splitParams[0] : "";

  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const { _action, ...values } = Object.fromEntries(form);

  const payload: ITransport = {
    vehicle: values["vehicle"] as Vehicle,
    cmr: values["cmr"] as Cmr,
  };

  const isSavedAsDraft: boolean = _action === "saveAsDraft";

  const bearerToken = await getBearerTokenForRequest(request);
  const response: ITransport = await updateTransport(bearerToken, documentNumber, transportId, payload, "cmr");
  const errors: IError[] | IErrorsTransformed = (response.errors as IError[]) || [];
  const isUnauthorised = response.unauthorised as boolean;

  if (isUnauthorised) {
    return redirect("/forbidden");
  }

  if (isSavedAsDraft) {
    return redirect(route("/create-catch-certificate/catch-certificates"));
  }

  if (errors.length > 0) {
    const values = Object.fromEntries(form);
    return apiCallFailed(errors, values);
  }

  if (payload.cmr === "true") {
    return redirect(
      route("/create-catch-certificate/:documentNumber/do-you-have-additional-transport-types", { documentNumber })
    );
  }

  return redirect(
    `/create-catch-certificate/${documentNumber}/add-transportation-details-${vehicleToUrlSlug(response.vehicle)}/${response.id}`
  );
};
