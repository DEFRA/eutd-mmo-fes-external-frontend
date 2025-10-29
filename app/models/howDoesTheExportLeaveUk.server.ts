import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import i18next from "~/i18next.server";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  addTransport,
  createCSRFToken,
  getBearerTokenForRequest,
  getLandingsEntryOption,
  getTransportById,
  updateTransport,
  validateCSRFToken,
} from "~/.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import isEmpty from "lodash/isEmpty";
import { apiCallFailed } from "~/communication.server";
import { forwardUri } from "~/helpers";
import logger from "~/logger.server";
import type { Vehicle, ITransport, IError, IErrorsTransformed, ErrorResponse } from "~/types";

export const HowDoesTheExportLeaveUkLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);
  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber } = params;
  const splitParams = params["*"]?.split("/");
  const transportId = splitParams?.[0];
  const t = await i18next.getFixedT(request, ["title"]);
  const pageTitle = t("ccTransportSelectionPageTitle", { ns: "title" });
  const commonTitle = t("ccCommonTitle", { ns: "title" });
  const { landingsEntryOption } = await getLandingsEntryOption(bearerToken, documentNumber);

  if (!landingsEntryOption) {
    return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
  }

  if (landingsEntryOption === "directLanding") {
    return redirect(route("/create-catch-certificate/:documentNumber/progress", { documentNumber }));
  }

  if (transportId) {
    const { vehicle } = await getTransportById(bearerToken, documentNumber, transportId);

    return new Response(
      JSON.stringify({
        documentNumber,
        vehicle,
        transportId,
        pageTitle,
        commonTitle,
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
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      pageTitle,
      commonTitle,
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

export const HowDoesTheExportLeaveUkAction = async (
  request: Request,
  params: Params
): Promise<Response | ErrorResponse> => {
  const form = await request.formData();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const { documentNumber } = params;
  const splitParams = params["*"]?.split("/");
  const transportId = splitParams?.[0];
  const vehicle = form.get("vehicle") as Vehicle;
  let payload: ITransport = {
    vehicle: vehicle,
  };

  const bearerToken = await getBearerTokenForRequest(request);

  if (transportId) {
    const transport: ITransport = await getTransportById(bearerToken, documentNumber, transportId).catch((e) => {
      logger.error(e);
      return payload;
    });

    if (transport.vehicle === payload.vehicle) {
      payload = {
        ...payload,
        ...transport,
      };
    }
  }

  const buttonClicked = form.get("_action") as string;
  const isSavedAsDraft: boolean = buttonClicked === "saveAsDraft";
  const response: ITransport = isEmpty(transportId)
    ? await addTransport(bearerToken, documentNumber, payload)
    : await updateTransport(bearerToken, documentNumber, transportId, payload);

  if (isSavedAsDraft) {
    return redirect(route("/create-catch-certificate/catch-certificates"));
  }

  const errors: IError[] | IErrorsTransformed = (response.errors as IError[]) || [];
  const isUnauthorised = response.unauthorised as boolean;

  if (isUnauthorised) {
    return redirect("/forbidden");
  }

  if (errors.length > 0) {
    const values = Object.fromEntries(form);
    return apiCallFailed(errors, values);
  }

  return redirect(`/create-catch-certificate/${documentNumber}/${forwardUri(response.vehicle)}/${response.id}`);
};
