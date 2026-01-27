import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "react-router";
import {
  doYouHaveRoadTransportDocumentAction,
  doYouHaveRoadTransportDocumentLoader,
  getBearerTokenForRequest,
  getTransportDetails,
} from "~/.server";
import type { ErrorResponse, Journey } from "~/types";
import setApiMock from "tests/msw/helpers/setApiMock";
import { route } from "routes-gen";
import { DoYouHaveARoadTransportDocumentForm } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const journey: Journey = "storageNotes";
  const { cmr, vehicle } = await getTransportDetails(bearerToken, journey, documentNumber);

  return doYouHaveRoadTransportDocumentLoader({ documentNumber, cmr, vehicle, request });
};

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse | undefined> =>
  doYouHaveRoadTransportDocumentAction({
    request,
    params,
    journey: "storageNotes",
    saveAsDraftReturnUrl: route("/create-non-manipulation-document/non-manipulation-documents"),
  });

const DoYouHaveARoadTransportDocument = () => (
  <DoYouHaveARoadTransportDocumentForm
    backUrl="/create-non-manipulation-document/:documentNumber/how-does-the-consignment-leave-the-uk"
    progressUri="/create-non-manipulation-document/:documentNumber/progress"
  />
);

export default DoYouHaveARoadTransportDocument;
