import * as React from "react";
import { type ActionFunction, type LoaderFunction } from "react-router";
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
    currentUri: route("/create-non-manipulation-document/:documentNumber/how-does-the-consignment-leave-the-uk", {
      documentNumber,
    }),
    saveAsDraftUrl: route("/create-non-manipulation-document/non-manipulation-documents"),
    completedUrl: `/create-non-manipulation-document/${documentNumber}/${forwardUri(vehicle)}`,
  });
};

const HowDoesTheExportLeaveTheUk = () => (
  <HowDoesTransportTakesPlaceInTheUkForm
    type={Page.StorageDocumentHowDoesTheExportLeaveTheUk}
    backUrl="/create-non-manipulation-document/:documentNumber/add-storage-facility-approval"
    progressUri="/create-non-manipulation-document/:documentNumber/progress"
  />
);

export default HowDoesTheExportLeaveTheUk;
