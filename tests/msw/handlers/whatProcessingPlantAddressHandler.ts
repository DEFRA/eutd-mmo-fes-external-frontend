import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  GET_PROCESSING_STATEMENT,
  MANUAL_EXPORTER_ADDRESS_URL,
  mockAddExporterDetails,
  mockFindExporterAddressUrl,
  mockSaveAndValidateDocument,
} from "~/urls.server";

import manualAddressValid from "@/fixtures/exporterApi/manualAddressValid.json";
import manualAddressErrors from "@/fixtures/exporterApi/manualAddressErrors.json";
import manualAddressSubBuildingError from "@/fixtures/exporterApi/manualAddressSubBuildingError.json";
import postcodeEmptyError from "@/fixtures/exporterApi/postcodeEmptyError.json";
import postcodeInvalidError from "@/fixtures/exporterApi/postcodeInvalidError.json";
import addressSearchValid from "@/fixtures/referenceDataApi/addressSearchValid.json";
import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";

const whatProcessingPlantAddressHandler: ITestHandler = {
  [TestCaseId.PSExporterManualAddressValid]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.json(manualAddressValid))),
    rest.post(mockSaveAndValidateDocument("processingStatement"), (req, res, ctx) =>
      res(ctx.json(processingStatement))
    ),
  ],
  [TestCaseId.PSExporterManualAddressWithErrors]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(manualAddressErrors))),
  ],
  [TestCaseId.PSExporterManualAddressWithSubBuildingError]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(manualAddressSubBuildingError))
    ),
  ],
  [TestCaseId.PSExporterManualAddressWith403]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
  ],
  [TestCaseId.PSExporterSelectAddress]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.json(addressSearchValid))),
  ],
  [TestCaseId.PSExporterSelectAddressPostcodeEmptyError]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(postcodeEmptyError))),
  ],
  [TestCaseId.PSExporterSelectAddressPostcodeInvalidError]: () => [
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(postcodeInvalidError))),
  ],
};

export default whatProcessingPlantAddressHandler;
