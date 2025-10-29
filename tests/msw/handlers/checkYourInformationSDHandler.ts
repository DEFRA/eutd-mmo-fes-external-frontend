import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  generatePdf,
  GET_CLIENT_IP_URL,
  mockDocumentUrl,
  mockAddExporterDetails,
  GET_STORAGE_DOCUMENT,
} from "~/urls.server";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import storageDocumentMandatory from "@/fixtures/storageDocumentApi/storageDocumentMandatoryFieldsOnly.json";
import sdExporterDetails from "@/fixtures/addExporterDetails/sdExporterDetails.json";
import storageDocumentNoCatches from "@/fixtures/storageDocumentApi/storageDocumentNoCatches.json";
import storageDocumentNoFacilities from "@/fixtures/storageDocumentApi/storageDocumentNoFacilities.json";
import storageDocumenOneFacility from "@/fixtures/storageDocumentApi/storageDocumentOneFacility.json";
import sdCreated from "@/fixtures/documentsApi/sdCreated.json";

const documentNumber = "GBR-2023-SD-DE53D6E7C";

const checkYourInformationSDHandler: ITestHandler = {
  [TestCaseId.SDCheckYourInformation]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationMandatory]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentMandatory))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationTrain]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoCatches))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationPlane]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoFacilities))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationTruckCmr]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumenOneFacility))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationValidationSuccess]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("storageNotes"), (req, res, ctx) =>
      res(
        ctx.status(200),
        ctx.json({
          documentNumber,
          uri: "_382462d9-ea63-4125-9e11-bb1bc474d8a1.pdf",
        })
      )
    ),
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(sdCreated))),
  ],
  [TestCaseId.SDCheckYourInformationValidationFailure]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("storageNotes"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          validationErrors: [
            {
              message: "sdAddCatchDetailsErrorUKDocumentInvalid",
              key: "validationError",
              certificateNumber: "GBR-2023-SD-A46E23603",
              product: "Peacock sole (ADJ)",
            },
          ],
        })
      )
    ),
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json(sdCreated))),
  ],
};

export default checkYourInformationSDHandler;
