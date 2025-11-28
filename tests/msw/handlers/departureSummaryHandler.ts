import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  GET_STORAGE_DOCUMENT,
  mockGetAllDocumentsUrl,
  mockGetProgress,
  mockGetTransportByIdUrl,
  mockSaveAndValidateDocument,
  mockTransportDetailsUrl,
  SPECIES_URL,
} from "~/urls.server";
import oneFacilities from "@/fixtures/storageDocumentApi/storageDocumentOneFacilityPlaneDeparture.json";
import noCatches from "@/fixtures/storageDocumentApi/storageDocumentNoCatches.json";
import emptyCatches from "@/fixtures/storageDocumentApi/storageDocumentEmptyCatch.json";
import multiCatches from "@/fixtures/storageDocumentApi/storageDocumentMultiCatches.json";
import singleCatch from "@/fixtures/storageDocumentApi/storageDocumentSingleCatch.json";
import multiCatchesEmptyDepartureWeight from "@/fixtures/storageDocumentApi/storageDocumentMultiCatchesEmptyDepartureWeight.json";
import noTransport from "@/fixtures/storageDocumentApi/storageDocumentAddDocumentType.json";
import planeTransportAllowedDetails from "@/fixtures/transportDetailsApi/planeAllowed.json";
import trainTransportAllowedDetails from "@/fixtures/transportDetailsApi/trainAllowed.json";
import catchCertificatePlane from "@/fixtures/transportDetailsApi/catchCertificatePlane.json";
import catchCertificateTrain from "@/fixtures/transportDetailsApi/catchCertificateTrain.json";
import sdProductAddedValidData from "@/fixtures/storageDocumentApi/storageDocumentProductAddedValidData.json";
import sdProductAddedInvalidWeightData from "@/fixtures/storageDocumentApi/storageDocumentProductWeightAddedInvalidData.json";
import species from "@/fixtures/referenceDataApi/species.json";
import storageDocumentProgress from "@/fixtures/progressApi/sdIncomplete.json";
import sdDrafts from "@/fixtures/dashboardApi/sdDrafts.json";

const departureSummaryHandlerHandler: ITestHandler = {
  [TestCaseId.SDDepartureSummary]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(oneFacilities))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
  ],
  [TestCaseId.SDDepartureSummaryNoTransport]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(noTransport))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
  ],
  [TestCaseId.SDDepartureSummaryNoCatches]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(noCatches))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.SDDepartureSummaryEmptyCatches]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(emptyCatches))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(planeTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificatePlane))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
  ],
  [TestCaseId.SDDepartureSummaryCatches]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(multiCatches))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(sdProductAddedValidData))),
  ],
  [TestCaseId.SDDepartureSummaryCatchesSingleCatch]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(singleCatch))),
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(sdProductAddedValidData))),
  ],
  [TestCaseId.SDDepartureSummaryCatchesEmptyWeights]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(multiCatchesEmptyDepartureWeight))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(storageDocumentProgress))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDrafts))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) => res(ctx.json(sdProductAddedValidData))),
  ],
  [TestCaseId.SDDepartureSummaryCatchesInvalidWeightSave]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(multiCatches))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.status(200), ctx.json(trainTransportAllowedDetails))),
    rest.get(mockGetTransportByIdUrl, (req, res, ctx) => res(ctx.json(catchCertificateTrain))),
    rest.post(mockSaveAndValidateDocument("storageNotes"), (req, res, ctx) =>
      res(ctx.status(400), ctx.json(sdProductAddedInvalidWeightData))
    ),
  ],
  [TestCaseId.SDDepartureSummaryForbidden]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.status(403))),
  ],
};

export default departureSummaryHandlerHandler;
