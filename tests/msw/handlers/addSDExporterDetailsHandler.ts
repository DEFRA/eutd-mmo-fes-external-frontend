import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  getAddExporterDetailsUrl,
  SPECIES_URL,
  mockGetAllDocumentsUrl,
  mockGetIdmUserDetails,
  mockGetIdmAddressDetails,
  GET_STORAGE_DOCUMENT,
} from "~/urls.server";
import exporterDetails from "@/fixtures/addExporterDetails/sdExporterDetails.json";
import exporterErrorResponse from "@/fixtures/addExporterDetails/exporterErrorResponse.json";
import species from "@/fixtures/referenceDataApi/species.json";
import sdDrafts from "@/fixtures/dashboardApi/sdDrafts.json";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";

const addSDExporterDetailsHandler: ITestHandler = {
  [TestCaseId.SDAddExporterDetails]: () => [
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(exporterDetails))),
  ],
  [TestCaseId.SDAddExporterDetailsFromIdm]: () => [
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
    rest.post(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
  ],
  [TestCaseId.SDAddExporterDetailsFromAdmin]: () => [
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetIdmUserDetails, (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetIdmAddressDetails, (req, res, ctx) => res(ctx.json({}))),
    rest.post(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.SDAddExporterDetailsSaveAsDraft]: () => [
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
  ],
  [TestCaseId.SDAddExporterDetailsFailsWith403]: () => [
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
  ],
  [TestCaseId.SDAddExporterDetailsFailsWithErrors]: () => [
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.post(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(exporterErrorResponse))
    ),
  ],
  [TestCaseId.SDAddExporterDetails403]: () => [
    rest.get(getAddExporterDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.status(403), ctx.json({}))),
  ],
};

export default addSDExporterDetailsHandler;
