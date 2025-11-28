import * as React from "react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import type { ErrorResponse, Journey, Vehicle } from "~/types";
import { route } from "routes-gen";
import { forwardUri } from "~/helpers/vehicleRouteLookup";
import setApiMock from "tests/msw/helpers/setApiMock";
import { HowDoesTransportTakesPlaceInTheUkForm } from "~/composite-components";
import {
  getBearerTokenForRequest,
  howDoesTheExportLeaveTheUkAction,
  howDoesTheExportLeaveTheUkLoader,
} from "~/.server";
import { Page } from "~/helpers";

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);
  const journey: Journey = "storageNotes";
  const { documentNumber } = params;

  return howDoesTheExportLeaveTheUkLoader({ bearerToken, documentNumber, journey, request });
};

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const form = await request.formData();
  const vehicle = form.get("vehicle") as Vehicle;

  return await howDoesTheExportLeaveTheUkAction({
    request,
    form,
    documentNumber,
    vehicle,
    currentUri: route("/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk", {
      documentNumber,
    }),
    saveAsDraftUrl: route("/create-storage-document/storage-documents"),
    completedUrl: `/create-storage-document/${documentNumber}/${forwardUri(vehicle)}`,
  });
};

const HowDoesTheExportLeaveTheUk = () => (
  <HowDoesTransportTakesPlaceInTheUkForm
    type={Page.HowDoesTheExportLeaveTheUk}
    backUrl="/create-storage-document/:documentNumber/add-storage-facility-approval"
    progressUri="/create-storage-document/:documentNumber/progress"
  />
);

export default HowDoesTheExportLeaveTheUk;
