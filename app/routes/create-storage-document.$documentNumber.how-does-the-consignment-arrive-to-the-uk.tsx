import * as React from "react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  getBearerTokenForRequest,
  HowDoesTheConsignmentArriveToTheUkAction,
  HowDoesTheConsignmentArriveToTheUkLoader,
} from "~/.server";
import { HowDoesTransportTakesPlaceInTheUkForm } from "~/composite-components";
import type { ErrorResponse, Journey, Vehicle } from "~/types";
import { route } from "routes-gen";
import { arrivalTransportForwardUri, Page } from "~/helpers";

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);
  const journey: Journey = "storageNotes";
  const { documentNumber } = params;

  return HowDoesTheConsignmentArriveToTheUkLoader({ bearerToken, documentNumber, journey, request });
};

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const form = await request.formData();
  const vehicle = form.get("vehicle") as Vehicle;

  return await HowDoesTheConsignmentArriveToTheUkAction({
    request,
    form,
    documentNumber,
    vehicle,
    currentUri: route("/create-storage-document/:documentNumber/how-does-the-consignment-arrive-to-the-uk", {
      documentNumber,
    }),
    saveAsDraftUrl: route("/create-storage-document/storage-documents"),
    completedUrl: `/create-storage-document/${documentNumber}/${arrivalTransportForwardUri(vehicle)}`,
  });
};

const HowDoesTheConsignmentArriveAToTheUk = () => (
  <HowDoesTransportTakesPlaceInTheUkForm
    type={Page.HowDoesTheConsignmentArriveAToTheUk}
    backUrl="/create-storage-document/:documentNumber/you-have-added-a-product"
    progressUri="/create-storage-document/:documentNumber/progress"
  />
);
export default HowDoesTheConsignmentArriveAToTheUk;
