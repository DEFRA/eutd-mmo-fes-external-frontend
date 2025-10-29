import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { addTransportationDetailsUrl, mockTransportDetailsUrl } from "~/urls.server";

import containerVesselResponse from "@/fixtures/transportDetailsApi/containerVessel.json";

const addTransportationDetailsContainerVesselHandler: ITestHandler = {
  [TestCaseId.AddTransportationDetailsContainerVessel]: () => [
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(containerVesselResponse))),
    rest.post(addTransportationDetailsUrl("containerVessel"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          vesselName: "error.vesselName.string.empty",
        })
      )
    ),
  ],
};

export default addTransportationDetailsContainerVesselHandler;
