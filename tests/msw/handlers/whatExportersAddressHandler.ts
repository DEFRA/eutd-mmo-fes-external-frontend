import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { MANUAL_EXPORTER_ADDRESS_URL, mockAddExporterDetails, mockFindExporterAddressUrl } from "~/urls.server";

import manualAddressValid from "@/fixtures/exporterApi/manualAddressValid.json";
import manualAddressErrors from "@/fixtures/exporterApi/manualAddressErrors.json";
import manualAddressSubBuildingError from "@/fixtures/exporterApi/manualAddressSubBuildingError.json";
import postcodeEmptyError from "@/fixtures/exporterApi/postcodeEmptyError.json";
import postcodeInvalidError from "@/fixtures/exporterApi/postcodeInvalidError.json";
import addressSearchValid from "@/fixtures/referenceDataApi/addressSearchValid.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";

const whatExportersAddressHandler: ITestHandler = {
  [TestCaseId.CCExporterManualAddressValid]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.json(manualAddressValid))),
  ],
  [TestCaseId.CCExporterManualAddressWithErrors]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(manualAddressErrors))),
  ],
  [TestCaseId.CCExporterManualAddressWithSubBuildingError]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(manualAddressSubBuildingError))
    ),
  ],
  [TestCaseId.CCExporterManualAddressWith403]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
  ],
  [TestCaseId.CCExporterSelectAddress]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.json(addressSearchValid))),
  ],
  [TestCaseId.CCExporterSelectAddressPostcodeEmptyError]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(postcodeEmptyError))),
  ],
  [TestCaseId.CCExporterSelectAddressPostcodeInvalidError]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(postcodeInvalidError))),
  ],
};

export default whatExportersAddressHandler;
