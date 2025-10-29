import { rest } from "msw";
import {
  GET_STORAGE_DOCUMENT,
  MANUAL_EXPORTER_ADDRESS_URL,
  mockFindExporterAddressUrl,
  mockSaveAndValidateDocument,
} from "~/urls.server";
import { type ITestHandler, TestCaseId } from "~/types";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import manualAddressValid from "@/fixtures/exporterApi/manualAddressValid.json";
import manualAddressErrors from "@/fixtures/exporterApi/manualAddressErrors.json";
import manualAddressSubBuildingError from "@/fixtures/exporterApi/manualAddressSubBuildingError.json";
import addressSearchValid from "@/fixtures/referenceDataApi/addressSearchValid.json";
import postcodeEmptyError from "@/fixtures/exporterApi/postcodeEmptyError.json";
import postcodeInvalidError from "@/fixtures/exporterApi/postcodeInvalidError.json";

const whatStorageFacilityAddressHandler: ITestHandler = {
  [TestCaseId.SDStorageFacilityAddress]: () => [
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.json(manualAddressValid))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.json(addressSearchValid))),
  ],
  [TestCaseId.SDStorageFacilityAddressPostcodeEmptyError]: () => [
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(manualAddressErrors))),
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(postcodeEmptyError))),
  ],
  [TestCaseId.SDStorageFacilityAddressWithSubBuildingError]: () => [
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) =>
      res(ctx.status(400), ctx.json(manualAddressSubBuildingError))
    ),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(storageDocument))),
  ],
  [TestCaseId.SDStorageFacilityAddressWith403]: () => [
    rest.post(MANUAL_EXPORTER_ADDRESS_URL, (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
  ],
  [TestCaseId.SDStorageFacilityAddressPostcodeInvalidError]: () => [
    rest.get(mockFindExporterAddressUrl, (req, res, ctx) => res(ctx.status(400), ctx.json(postcodeInvalidError))),
  ],
};

export default whatStorageFacilityAddressHandler;
