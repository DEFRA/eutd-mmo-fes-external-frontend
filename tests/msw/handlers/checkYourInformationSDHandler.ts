import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  generatePdf,
  GET_CLIENT_IP_URL,
  mockDocumentUrl,
  mockAddExporterDetails,
  GET_STORAGE_DOCUMENT,
  getProgressUrl,
  getTransportDetailsUrl,
  mockGetAllDocumentsUrl,
  SPECIES_URL,
  mockGetAddStoargaDocumentUrl,
  mockGetProgress,
  mockTransportDetailsUrl,
  SAVE_TRANSPORT_DETAILS_URL,
} from "~/urls.server";
import storageDocument from "@/fixtures/storageDocumentApi/storageDocument.json";
import storageDocumentMandatory from "@/fixtures/storageDocumentApi/storageDocumentMandatoryFieldsOnly.json";
import sdExporterDetails from "@/fixtures/addExporterDetails/sdExporterDetails.json";
import storageDocumentNoCatches from "@/fixtures/storageDocumentApi/storageDocumentNoCatches.json";
import storageDocumentOneCatches from "@/fixtures/storageDocumentApi/storageDocumentOneCatchesTrain.json";
import storageDocumentNoFacilities from "@/fixtures/storageDocumentApi/storageDocumentNoFacilities.json";
import storageDocumenOneFacility from "@/fixtures/storageDocumentApi/storageDocumentOneFacility.json";
import sdProgressIncomplete from "@/fixtures/progressApi/sdIncomplete.json";
import sdCreated from "@/fixtures/documentsApi/sdCreated.json";
import sdDocuments from "@/fixtures/dashboardApi/sdDocument.json";
import truckTransport from "@/fixtures/transportDetailsApi/truck.json";
import planeTransport from "@/fixtures/transportDetailsApi/plane.json";
import trainTransport from "@/fixtures/transportDetailsApi/train.json";
import containerVesselTransport from "@/fixtures/transportDetailsApi/containerVessel.json";
import checkYourInformationAllFieldsNotProvided from "@/fixtures/storageDocumentApi/storageDocumentsFieldsNotProvided.json";
import species from "@/fixtures/referenceDataApi/species.json";

const documentNumber = "GBR-2023-SD-DE53D6E7C";

const checkYourInformationSDHandler: ITestHandler = {
  [TestCaseId.SDCheckYourInformationAllFieldsNotProvided]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(checkYourInformationAllFieldsNotProvided))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformation]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationMandatory]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentMandatory))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationTrain]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentOneCatches))),
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
  [TestCaseId.SDCheckYourInformationTruckWithContainers]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumenOneFacility))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
  ],
  [TestCaseId.SDCheckYourInformationTrainWithContainers]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentOneCatches))),
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
  [TestCaseId.SDCheckYourInformationValidationGuard]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.status(403))),
  ],
  [TestCaseId.SDCheckYourInformationValidationProgress]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoCatches))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
  ],
  [TestCaseId.SDCheckYourInformationTruckEdit]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumenOneFacility))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(truckTransport))),
    rest.post(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
  ],
  [TestCaseId.SDCheckYourInformationPlaneEdit]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentNoFacilities))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(planeTransport))),
    rest.post(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
  ],
  [TestCaseId.SDCheckYourInformationTrainEdit]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocumentOneCatches))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(trainTransport))),
    rest.post(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
  ],
  [TestCaseId.SDCheckYourInformationContainerVesselEdit]: () => [
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json(containerVesselTransport))),
    rest.post(getTransportDetailsUrl("storageNotes"), (req, res, ctx) => res(ctx.json({}))),
  ],
  [TestCaseId.SDCheckYourInformationChangeProductNoChange]: () => [
    // Check your information page
    rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
    rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    // Add product page
    rest.get(SPECIES_URL, (req, res, ctx) => res(ctx.json(species))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(sdDocuments))),
    rest.get(mockGetProgress, (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
    rest.get(mockTransportDetailsUrl, (req, res, ctx) => res(ctx.json(truckTransport))),
    // Save product (POST)
    rest.post(mockGetAddStoargaDocumentUrl, (req, res, ctx) => res(ctx.json(storageDocument))),
  ],
  [TestCaseId.SDCheckYourInformationChangeArrivalTransportMode]: () => {
    let postCallCount = 0;
    return [
      // Check your information page
      rest.get(GET_STORAGE_DOCUMENT, (req, res, ctx) => res(ctx.json(storageDocument))),
      rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(sdExporterDetails))),
      rest.get(getProgressUrl("storageNotes"), (req, res, ctx) => res(ctx.json(sdProgressIncomplete))),
      // Transport details endpoint - return truck before POST, plane after POST
      rest.get(getTransportDetailsUrl("storageNotes", true), (req, res, ctx) => {
        // If POST has been called (transport created), return plane; otherwise return truck
        const response = postCallCount > 0 ? planeTransport : truckTransport;
        return res(ctx.json(response));
      }),
      // POST to /v1/transport/add when user changes transport mode (creates new transport)
      rest.post(SAVE_TRANSPORT_DETAILS_URL, (req, res, ctx) => {
        postCallCount++;
        return res(ctx.json(planeTransport));
      }),
    ];
  },
};

export default checkYourInformationSDHandler;
