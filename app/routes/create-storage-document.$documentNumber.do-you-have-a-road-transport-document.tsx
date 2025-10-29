import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
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
    saveAsDraftReturnUrl: route("/create-storage-document/storage-documents"),
  });

const DoYouHaveARoadTransportDocument = () => (
  <DoYouHaveARoadTransportDocumentForm
    backUrl="/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk"
    progressUri="/create-storage-document/:documentNumber/progress"
  />
);

export default DoYouHaveARoadTransportDocument;
