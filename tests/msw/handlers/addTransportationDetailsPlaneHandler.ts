import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { mockTransportDetailsUrl } from "~/urls.server";

import flightNumberError from "@/fixtures/transportationApi/flightNumberError.json";
import containerNumberError from "@/fixtures/transportationApi/containerNumberError.json";
import departurePlaceError from "@/fixtures/transportationApi/departurePlaceError.json";

const addTransportationDetailsPlaneHandler: ITestHandler = {
  [TestCaseId.AddTransportationDetailsPlaneFlightNumberLabelError]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(flightNumberError))),
  ],
  [TestCaseId.AddTransportationDetailsPlaneContainerNumberLabelError]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(containerNumberError))),
  ],
  [TestCaseId.AddTransportationDetailsPlaneDeparturePlaceLabelError]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(departurePlaceError))),
  ],
};

export default addTransportationDetailsPlaneHandler;
