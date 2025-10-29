import type { ITestHandler } from "~/types";
import indexPageHandler from "./indexPageHandler";
import progressPageHandler from "./progressPageHandler";
import addReferenceHandler from "./addReferenceHandler";
import landingsEntryHandler from "./landingsEntryHandler";
import landingsTypeConfirmationHandler from "./landingsTypeConfirmationHandler";
import addCCExporterDetailsHandler from "./addCCExporterDetailsHandler";
import addPSExporterDetailsHandler from "./addPSExporterDetailsHandler";
import addSDExporterDetailsHandler from "./addSDExporterDetailsHandler";
import addPSHealthCertificateHandler from "./addPSHealthCertificateHandler";
import whoseWaterWereTheyCaughtInHandler from "./whoseWaterWereTheyCaughtInHandler";
import howDoesTheExportLeaveTheUkHandler from "./howDoesTheExportLeaveTheUkHandler";
import whatExportersAddressHandler from "./whatExportersAddressHandler";
import pageNotFoundHandler from "./pageNotFoundHandler";
import copyCCPageHandler from "./copyCCPageHandler";
import copyPSSDPageHandler from "./copyPSSDPageHandler";
import checkYourInformationCCHandler from "./checkYourInformationCCHandler";
import whatAreYouExportingHandler from "./whatAreYouExportingHandler";
import transportDetailsHandler from "./transportDetailsHandler";
import addTransportationDetailsContainerVesselHandler from "./addTransportationDetailsContainerVesselHandler";
import doYouHaveARoadTransportDocumentHandler from "./doYouHaveARoadTransportDocumentHandler";
import addTransportationDetailsPlaneHandler from "./addTransportationDetailsPlaneHandler";
import addTransportationAdditionalTypesCheckHandler from "./addTransportationAdditionalTypesCheckHandler";
import deleteThisDocumentHandler from "./deleteThisDraftDocumentHandler";
import manageFavouritesHandler from "./manageFavouritesHandler";
import catchCertificateHandler from "./catchCertificateHandler";
import voidThisDocumentHandler from "./voidThisDocumentHandler";
import whatExportJourneyHandler from "./whatExportJourneyHandler";
import uploadLandingsHandler from "./uploadLandingsHandler";
import directLandingHandler from "./directLandingHandler";
import processingStatementDashboardHandler from "./processingStatementDashboardHandler";
import storageDocumentDashboardHandler from "./storageDocumentDashboardHandler";
import addConsignmentDetailsHandler from "./addConsignmentDetailsHandler";
import addProcessingPlantDetailsHandler from "./addProcessingPlantDetailsHandler";
import addProcessingPlantAddressHandler from "./addProcessingPlantAddressHandler";
import whatStorageFacilityAddressHandler from "./whatStorageFacilityAddressHandler";

import dashboardHandler from "./dashboardHandler";
import pdfCCHandler from "./pdfCCHandler";
import journeyPrivacyPageHandler from "./journeyPrivacyPageHandler";

import catchAddedHandler from "./catchAddedHandler";
import storageProductAddedHandler from "./storageProductAddedHandler";
import checkYourInformationPSHandler from "./checkYourInformationPSHandler";
import checkYourInformationSDHandler from "./checkYourInformationSDHandler";
import psAddCatchDetailsHandler from "./psAddCatchDetailsHandler";
import whatProcessingPlantAddressHandler from "./whatProcessingPlantAddressHandler";
import processingStatementCreatedHandler from "./processingStatementCreatedHandler";
import storageDocumentCreatedHandler from "./storageDocumentCreatedHandler";
import addStorageFacilityHandler from "./addStorageFacilityHandler";
import addLandingsHandler from "./addLandingsHandler";
import youHaveAddedStorageFacility from "./youHaveAddedStorageFacilityHandler";
import addProductToConsignementHandler from "./addProductToConsignementHandler";
import loginHandler from "./loginHandler";
import transportDocumentsHandler from "./transportDocumentsHandler";
import addStorageApprovalHandler from "./addStorageApprovalHandler";
import departureSummaryHandlerHandler from "./departureSummaryHandler";

const rootTestHandler: ITestHandler = {
  ...indexPageHandler,
  ...progressPageHandler,
  ...addReferenceHandler,
  ...landingsEntryHandler,
  ...landingsTypeConfirmationHandler,
  ...addCCExporterDetailsHandler,
  ...addPSExporterDetailsHandler,
  ...addSDExporterDetailsHandler,
  ...whoseWaterWereTheyCaughtInHandler,
  ...howDoesTheExportLeaveTheUkHandler,
  ...whatExportersAddressHandler,
  ...pageNotFoundHandler,
  ...copyCCPageHandler,
  ...copyPSSDPageHandler,
  ...checkYourInformationCCHandler,
  ...whatAreYouExportingHandler,
  ...transportDetailsHandler,
  ...addTransportationDetailsContainerVesselHandler,
  ...doYouHaveARoadTransportDocumentHandler,
  ...deleteThisDocumentHandler,
  ...addTransportationDetailsPlaneHandler,
  ...addTransportationAdditionalTypesCheckHandler,
  ...manageFavouritesHandler,
  ...catchCertificateHandler,
  ...checkYourInformationSDHandler,
  ...voidThisDocumentHandler,
  ...whatExportJourneyHandler,
  ...uploadLandingsHandler,
  ...directLandingHandler,
  ...processingStatementDashboardHandler,
  ...storageDocumentDashboardHandler,
  ...addConsignmentDetailsHandler,
  ...addProcessingPlantDetailsHandler,
  ...addProcessingPlantAddressHandler,
  ...addPSHealthCertificateHandler,
  ...dashboardHandler,
  ...pdfCCHandler,
  ...journeyPrivacyPageHandler,
  ...catchAddedHandler,
  ...storageProductAddedHandler,
  ...checkYourInformationPSHandler,
  ...checkYourInformationSDHandler,
  ...psAddCatchDetailsHandler,
  ...whatProcessingPlantAddressHandler,
  ...processingStatementCreatedHandler,
  ...storageDocumentCreatedHandler,
  ...addStorageFacilityHandler,
  ...addStorageApprovalHandler,
  ...whatStorageFacilityAddressHandler,
  ...addLandingsHandler,
  ...youHaveAddedStorageFacility,
  ...addProductToConsignementHandler,
  ...loginHandler,
  ...transportDocumentsHandler,
  ...departureSummaryHandlerHandler,
};

export default rootTestHandler;
