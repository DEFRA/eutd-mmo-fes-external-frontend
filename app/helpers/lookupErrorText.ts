import type { IError, IErrorsTransformed, ErrorLookup } from "../types/errors";

export const getErrorMessage = (key: string): string => {
  const errors: ErrorLookup = {
    "error.landingsEntryOption.string.base": "ccLandingTypeSelectOption",
    "error.landingsEntryOption.string.empty": "ccLandingTypeSelectOption",
    "error.landingsEntryOption.any.invalid": "ccLandingTypeSelectOption",
    "error.userReference.string.max": "commonUserReferencePageErrorMaxChar",
    "error.userReference.string.pattern.base": "commonUserReferenceEnterRefAsACombination",
    "error.documentDelete.string.base": "commonDocumentDraftDeleteError",
    "error.documentDelete.any.required": "commonDocumentDraftDeleteError",
    "error.landingsEntryOption.any.required": "ccLandingTypeSelectOption",
    "error.landingsEntryConfirmation.string.empty": "ccLandingTypeSelectOption",
    "error.exporterFullName.string.empty": "commonAddExporterDetailsPersonResponsibleError",
    "error.exporterFullName.string.max": "commonAddExporterDetailsPersonResponsibleErrorMaxLength",
    "error.exporterFullName.string.pattern.base": "commonAddExporterDetailsPersonResponsibleErrorInvalidCharacters",
    "error.exporterFullName.string.emoji": "emojiCharactersNotPermitted",
    "error.exporterCompanyName.string.empty": "commonAddExporterDetailsErrorCompanyName",
    "error.exporterCompanyName.string.max": "commonAddExporterDetailsErrorCompanyNameMaxLength",
    "error.exporterCompanyName.string.pattern.base": "commonAddExporterDetailsErrorCompanyNameInvalidCharacters",
    "error.exporterCompanyName.string.emoji": "emojiCharactersNotPermitted",
    // FI0-10908: Emoji validation entries for exporter address fields
    "error.subBuildingName.string.emoji": "emojiCharactersNotPermitted",
    "error.buildingName.string.emoji": "emojiCharactersNotPermitted",
    "error.streetName.string.emoji": "emojiCharactersNotPermitted",
    "error.townCity.string.emoji": "emojiCharactersNotPermitted",
    "error.county.string.emoji": "emojiCharactersNotPermitted",
    "error.watersCaughtIn.object.missing": "ccWhoseWatersWereTheyCaughtInErrorRequired",
    "error.otherWaters.any.required": "ccWhoseWatersWereTheyCaughtInErrorOtherWatersRequired",
    "error.otherWaters.string.empty": "ccWhoseWatersWereTheyCaughtInErrorOtherWatersRequired",
    "error.postcode.string.empty": "commonLookupAddressPageErrorPostcodeEmpty",
    "error.postcode.string.pattern.base": "commonLookupAddressPageErrorPostcodeValidation",
    "error.exporterAddress.any.required": "commonAddExporterDetailsAddTheExportersAddress",
    "error.exportDestination.any.invalid": "commonProductDestinationErrorInvalidCountry",
    "error.exportDestination.any.required": "commonProductDestinationErrorInvalidCountry",
    "error.exportDestination.string.empty": "commonProductDestinationErrorInvalidCountry",
    "error.pointOfDestination.string.empty": "ccWhatExportJourneyErrorPointOfDestinationRequired",
    "error.pointOfDestination.any.required": "ccWhatExportJourneyErrorPointOfDestinationRequired",
    "error.pointOfDestination.string.max": "ccWhatExportJourneyErrorPointOfDestinationMaxLength",
    "error.pointOfDestination.string.pattern.base": "ccWhatExportJourneyErrorPointOfDestinationInvalidCharacters",
    "error.addressOne.any.empty": "commonWhatExportersAddressErrorEnterTheBuilding",
    "error.addressOne.any.required": "commonWhatExportersAddressErrorEnterTheBuilding",
    "error.townCity.string.empty": "commonWhatExportersAddressErrorTownCity",
    "error.townCity.any.empty": "commonWhatExportersAddressErrorTownCity",
    "error.townCity.any.required": "commonWhatExportersAddressErrorTownCity",
    "error.postcode.string.base": "commonLookupAddressPageErrorPostcodeEmpty",
    "error.postcode.any.required": "commonLookupAddressPageErrorPostcodeEmpty",
    "error.postcode.string.min": "commonLookupAddressPageErrorPostcodeValidation",
    "error.postcode.string.max": "commonLookupAddressPageErrorPostcodeValidation",
    "error.streetName.any.required": "commonWhatExportersAddressErrorStreetName",
    "error.buildingNumber.any.required": "commonWhatExportersAddressErrorBuildingNumber",
    "error.buildingName.any.required": "commonWhatExportersAddressErrorBuildingName",
    "error.subBuildingName.any.required": "commonWhatExportersAddressErrorSubBuildingName",
    "error.buildingNumber.string.empty": "commonWhatExportersAddressErrorBuildingNumber",
    "error.buildingName.string.empty": "commonWhatExportersAddressErrorBuildingName",
    "error.subBuildingName.string.empty": "commonWhatExportersAddressErrorSubBuildingName",
    "error.country.any.required": "commonWhatExportersAddressErrorCountry",
    "error.country.string.empty": "commonWhatExportersAddressErrorCountry",
    "error.country.string.base": "commonWhatExportersAddressErrorCountry",
    "error.country.any.invalid": "commonWhatExportersAddressErrorCountry",
    "error.streetName.string.empty": "commonWhatExportersAddressErrorStreetName",
    "error.subBuildingName.string.pattern.base": "commonWhatExportersAddressErrorSubBuildingValidation",
    "error.buildingName.string.pattern.base": "commonWhatExportersAddressErrorBuildingNameValidation",
    "error.buildingNumber.string.pattern.base": "commonWhatExportersAddressErrorBuildingNumberValidation",
    "error.streetName.string.pattern.base": "commonWhatExportersAddressErrorStreetNameValidation",
    "error.townCity.string.pattern.base": "commonWhatExportersAddressErrorTownCityValidation",
    "error.county.string.pattern.base": "commonWhatExportersAddressErrorCounty",
    "error.addressFirstPart.any.required": "commonWhatExportersAddressErrorAddressFirstPart",
    "error.vehicle.string.base": "commonTransportSelectionTypeOfTransportErrorNull",
    "error.arrivalVehicle.any.required": "sdArrivalTransportTypeSelectionError",
    "error.voidOriginal.any.required": "commonCopyVoidConfirmationError",
    "error.copyDocumentAcknowledged.any.invalid": "commonCopyAcknowledgementError",
    "error.copyDocumentAcknowledged.any.required": "commonCopyAcknowledgementError",
    "error.documentVoid.any.required": "commonConfirmDocumentVoidPageError",
    "error.documentVoid.string.base": "commonConfirmDocumentVoidPageError",
    "error.cmr.string.base": "commonRoadTransportDocumentError",
    "error.cmr.any.required": "commonRoadTransportDocumentError",
    "error.flightNumber.any.required": "commonAddTransportationDetailsPlaneFlightNumberLabelError",
    "error.flightNumber.any.empty": "commonAddTransportationDetailsPlaneFlightNumberLabelError",
    "error.flightNumber.string.empty": "commonAddTransportationDetailsPlaneFlightNumberLabelError",
    "error.flightNumber.string.max": "commonAddTransportationDetailsPlaneFlightNumberMaxCharError",
    "error.flightNumber.string.alphanum": "commonAddTransportationDetailsPlaneFlightNumberOnlyNumbersError",
    "error.containerNumber.any.empty": "ccContainerVesselContainerNumberRequiredError",
    "error.containerNumber.string.empty": "ccContainerVesselContainerNumberRequiredError",
    "error.containerNumber.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.string.base": "ccAddTransportationDetailsContainerIdentificationNumberOnlyNumLettersError",
    "error.containerNumber.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.plane.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.plane.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.plane.string.pattern.base":
      "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.containerVessel.any.required": "ccContainerVesselContainerNumberRequiredError",
    "error.containerNumber.containerVessel.string.empty": "ccContainerVesselContainerNumberRequiredError",
    "error.containerNumber.containerVessel.array.min": "ccContainerVesselContainerNumberRequiredError",
    "error.containerIdentificationNumber.0.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.containerVessel.0.any.required": "ccContainerVesselContainerNumberRequiredError",
    "error.containerNumber.containerVessel.0.string.empty": "ccContainerVesselContainerNumberRequiredError",
    "error.containerNumber.containerVessel.0.array.min": "ccContainerVesselContainerNumberRequiredError",
    "error.containerNumber.containerVessel.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.0.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.0.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.0.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.0.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.0.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.plane.array.min": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.container-vessel.array.min": "ccContainerVesselContainerNumberLabelError",
    "error.containerNumber.1.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.1.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.1.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.1.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.1.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.2.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.2.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.2.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.2.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.2.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.3.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.3.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.3.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.3.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.3.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.4.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.4.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.4.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.4.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.4.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.5.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.5.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.5.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.5.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.5.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.6.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.6.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.6.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.6.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.6.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.7.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.7.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.7.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.7.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.7.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.8.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.8.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.8.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.8.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.8.string.pattern.base": "ccShippingContainerNumberPatternError",
    "error.containerNumber.9.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.9.string.empty": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.9.string.alphanum": "commonAddTransportationDetailsPlaneContainerOnlyNumLettersError",
    "error.containerNumber.9.string.max": "ccAddTransportationDetailsContainerIdentificationNumberCharExceedError",
    "error.containerNumber.9.string.pattern.base": "ccShippingContainerNumberPatternError",
    commonAddTransportationDetailsPlaneContainerNumberLabelError:
      "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    ccContainerVesselContainerNumberRequiredError: "ccContainerVesselContainerNumberRequiredError",
    ccContainerVesselContainerNumberLabelError: "ccContainerVesselContainerNumberLabelError",
    "error.containerNumber.any.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.array.min": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.nationalityOfVehicle.any.required": "commonTransportationDetailsTruckNationalityError",
    "error.nationalityOfVehicle.any.empty": "commonTransportationDetailsTruckNationalityError",
    "error.nationalityOfVehicle.string.empty": "commonTransportationDetailsTruckNationalityError",
    "error.nationalityOfVehicle.any.invalid": "sdTransportTruckNationalityInvalidError",
    "error.nationalityOfVehicle.string.invalid": "sdTransportTruckNationalityInvalidError",
    "error.registrationNumber.any.required": "commonTransportationDetailsTruckRegNumberError",
    "error.registrationNumber.any.empty": "commonTransportationDetailsTruckRegNumberError",
    "error.registrationNumber.string.empty": "commonTransportationDetailsTruckRegNumberError",
    "error.registrationNumber.string.max": "ccAddTransportationDetailsRegistrationCharExceedError",
    "error.registrationNumber.string.pattern.base": "ccAddTransportationDetailsRegistrationOnlyAlphaNumError",
    "error.departurePlace.any.required": "sdAddTransportationDetailsPlaneDeparturePlaceLabelError",
    "error.departurePlace.any.empty": "sdAddTransportationDetailsPlaneDeparturePlaceLabelError",
    "error.departurePlace.string.empty": "sdAddTransportationDetailsPlaneDeparturePlaceLabelError",
    "error.freightBillNumber.any.required": "ccAddTransportationDetailsFreightBillNumberError",
    "error.freightBillNumber.any.empty": "ccAddTransportationDetailsFreightBillNumberError",
    "error.freightBillNumber.string.empty": "ccAddTransportationDetailsFreightBillNumberError",
    "error.freightBillNumber.string.max": "ccAddTransportationDetailsFreightBillNumberCharExceedError",
    "error.freightBillNumber.string.pattern.base": "ccAddTransportationDetailsFreightBillNumberOnlyNumLettersError",
    "error.containerIdentificationNumber.string.max": "ccContainerIdentificationNumberMaxLength",
    "error.departurePort.string.max": "ccAddTransportationDetailsDeparturePortCharExceedError",
    "error.departurePort.string.pattern.base": "ccAddTransportationDetailsDeparturePortOnlyNumLettersError",
    "error.departurePort.any.required": "sdTransportConsignmentOriginRequiredError",
    "error.departureDate.any.required": "sdTransportDepatureDateRequiredError",
    "error.departureDate.date.format": "sdTransportDepatureDateInvalidError",
    "error.departureDate.date.max": "sdTransportDepatureDateMaxError",
    errorTruckDepartureDateAnyMax: "transportation:errorTruckDepartureDateAnyMax",
    errorPlaneDepartureDateAnyMax: "transportation:errorPlaneDepartureDateAnyMax",
    errorTrainDepartureDateAnyMax: "transportation:errorTrainDepartureDateAnyMax",
    errorContainerVesselDepartureDateAnyMax: "transportation:errorContainerVesselDepartureDateAnyMax",
    "error.departureCountry.any.invalid": "sdTransportDepatureCountryInvalidError",
    "error.departureCountry.any.required": "sdTransportDepatureCountryRequiredError",
    "error.departureCountry.string.empty": "sdTransportDepatureCountryRequiredError",
    "error.departurePort.string.empty": "sdTransportConsignmentOriginRequiredError",
    "error.departurePlace.string.pattern.base": "sdAddTransportationDetailsPlaneDeparturePlaceCharValidationError",
    "error.departurePlace.string.max": "sdAddTransportationDetailsPlaneDeparturePlaceMaxCharError",
    "error.railwayBillNumber.any.empty": "sdTransportDetailsRailwayBillNumberErrorRequired",
    "error.railwayBillNumber.string.empty": "sdTransportDetailsRailwayBillNumberErrorRequired",
    "error.railwayBillNumber.any.required": "sdTransportDetailsRailwayBillNumberErrorRequired",
    "error.railwayBillNumber.string.alphanum": "commonAddTransportationDetailsRailwayBillOnlyNumLettersError",
    "error.railwayBillNumber.string.max": "commonAddTransportationDetailsRailwayBillMaxCharError",
    "error.vesselName.any.required": "commonAddTransportationDetailsVesselNameError",
    "error.vesselName.any.empty": "commonAddTransportationDetailsVesselNameError",
    "error.vesselName.string.empty": "commonAddTransportationDetailsVesselNameError",
    "error.vesselName.string.max": "commonAddTransportationDetailsVesselNameMax",
    "error.vesselName.string.pattern.base": "commonAddTransportationDetailsVesselNameBasePatternError",
    "error.vesselName.string.emoji": "emojiCharactersNotPermitted",
    "error.flagState.any.required": "commonAddTransportationDetailsVesselFlagError",
    "error.flagState.any.empty": "commonAddTransportationDetailsVesselFlagError",
    "error.flagState.string.empty": "commonAddTransportationDetailsVesselFlagError",
    "error.flagState.string.max": "commonAddTransportationDetailsVesselFlagMaxCharError",
    "error.flagState.string.pattern.base": "commonAddTransportationDetailsVesselFlagBasePatternError",
    "error.flagState.string.emoji": "emojiCharactersNotPermitted",
    // FI0-10908: Emoji validation entries for transport and landing text fields
    "error.vessel.vesselName.string.emoji": "emojiCharactersNotPermitted",
    "error.registrationNumber.string.emoji": "emojiCharactersNotPermitted",
    "error.flightNumber.string.emoji": "emojiCharactersNotPermitted",
    "error.railwayBillNumber.string.emoji": "emojiCharactersNotPermitted",
    "error.airwayBillNumber.string.emoji": "emojiCharactersNotPermitted",
    "error.freightBillNumber.string.emoji": "emojiCharactersNotPermitted",
    "error.departurePlace.string.emoji": "emojiCharactersNotPermitted",
    "error.departurePort.string.emoji": "emojiCharactersNotPermitted",
    "error.placeOfUnloading.string.emoji": "emojiCharactersNotPermitted",
    "error.pointOfDestination.string.emoji": "emojiCharactersNotPermitted",
    "error.species.any.empty": "ccProductFavouritesPageErrorSpeciesName",
    "error.state.any.required": "ccProductFavouritesPageErrorState",
    "error.species.any.invalid": "ccProductFavouritesPageErrorSpeciesName",
    "error.presentation.any.required": "ccProductFavouritesPageErrorPresentation",
    "error.species.any.required": "ccProductFavouritesPageErrorSpeciesName",
    "error.species.string.empty": "ccProductFavouritesPageErrorSpeciesName",
    "error.species.string.emoji": "emojiCharactersNotPermitted",
    "error.state.string.empty": "ccProductFavouritesPageErrorState",
    "error.presentation.string.empty": "ccProductFavouritesPageErrorPresentation",
    "error.commodity_code.any.invalid": "ccProductFavouritesPageErrorCommodityCode",
    "error.exporter.incomplete": "commonProgressExporterRequiredError",
    "error.products.incomplete": "commonProgressProductDetailsRequiredError",
    "error.processedProductDetails.incomplete": "commonProgressProductDetailsRequiredError",
    "error.landings.incomplete": "ccProgressLandingDetailsRequiredError",
    "error.conservation.incomplete": "ccProgressCatchWatersRequiredError",
    "error.exportJourney.incomplete": "ccProgressExportJourneyRequiredError",
    "error.transportType.incomplete": "commonProgressTransportTypeRequiredError",
    "error.transportDetails.incomplete": "commonProgressTransportDetailsRequiredError",
    "error.storageFacilities.incomplete": "sdProgressStorageFacilitiesRequiredError",
    "error.commodity_code.any.required": "ccProductFavouritesPageErrorCommodityCode",
    "error.commodity_code.string.empty": "ccProductFavouritesPageErrorCommodityCode",
    "error.commodity_code_description.string.emoji": "emojiCharactersNotPermitted",
    "error.favourite.duplicate": "ccProductFavouritesPageErrorDuplicate",
    "error.favourite.max": "ccProductFavouritesPageErrorLimit",
    "error.favourite.any.required": "ccWhatExportingFromSelectProductFavouriteListError",
    "error.product.string.empty": "ccAddLandingSelectProductFromListError",
    "error.product.any.missing": "ccUploadFilePageTableProductMissingError",
    "error.product.any.exists": "ccUploadFilePageTableProductDoesNotExistError",
    "error.product.any.invalid": "ccUploadFilePageTableProductInvalidError",
    "error.faoArea.any.required": "ccUploadFilePageTableCatchAreaMissingError",
    "error.faoArea.any.missing": "ccUploadFilePageTableCatchAreaMissingError",
    "error.faoArea.any.only": "ccUploadFilePageTableCatchAreaMissingError",
    "error.faoArea.string.empty": "ccUploadFilePageTableCatchAreaMissingError",
    "error.faoArea.any.invalid": "ccUploadFilePageTableCatchAreaInvalidError",
    "error.highSeasArea.any.invalid": "ccUploadFilePageTableHighSeasAreaInvalidError",
    "error.highSeasArea.string.empty": "ccAddLandingHighSeasAreaError",
    "error.exclusiveEconomicZones.any.required": "ccAddLandingEezError",
    "error.exclusiveEconomicZones.string.empty": "ccAddLandingEezError",
    "error.exclusiveEconomicZones.any.invalid": "ccAddLandingEezInvalidError",
    "validation.rfmoCode.string.unknown": "ccUploadFilePageTableRFMONotFoundError",
    "validation.eezCode.string.unknown": "ccUploadFilePageTableEEZUnknownError",
    "validation.eezCode.string.invalid": "ccUploadFilePageTableEEZInvalidError",
    "error.dateLanded.date.max": "ccAddLandingDateLandedFutureDateError",
    "error.dateLanded.date.missing": "ccCommonDateLandedMissingError",
    "error.dateLanded.date.base": "ccCommonDateLandedRealError",
    "error.dateLanded.any.required": "ccCommonDateLandedRequiredError",
    "error.dateLanded.any.empty": "ccCommonDateLandedRequiredError",
    "error.dateLanded.date.isoDate": "ccCommonDateLandedInvalidError",
    // Direct landing specific error mappings (FI0-10238)
    "error.dateLanded.directLanding.any.required": "ccDirectLandingDateLandedRequiredError",
    "error.dateLanded.directLanding.date.invalid": "ccDirectLandingDateLandedInvalidError",
    "error.dateLanded.directLanding.date.base": "ccDirectLandingDateLandedRequiredError", // enter the date landed
    "error.dateLanded.directLanding.date.isoDate": "ccDirectLandingDateLandedInvalidError",
    "error.dateLanded.directLanding.date.max": "ccDirectLandingDateLandedFutureDateError",
    // Direct landing specific vessel error mappings (FI0-10238)
    "error.vessel.vesselName.directLanding.any.required": "ccDirectLandingVesselRequiredError",
    "error.vessel.vesselName.directLanding.string.base": "ccDirectLandingVesselInvalidError",
    "error.vessel.isListed.directLanding.vessel.isListed.base": "ccDirectLandingVesselInvalidError",

    // Direct landing specific export weight error mappings (FI0-10238)
    "error.weights.exportWeight.directLanding.any.required": "ccDirectLandingExportWeightRequiredError",
    "error.weights.exportWeight.directLanding.any.base": "ccDirectLandingExportWeightRequiredError",
    "validation.vessel.license.invalid-date": "ccUploadFilePageTableVesselInvalidLicenseError",
    "validation.product.seasonal.invalid-date": "ccUploadFilePageTableVesselLandingDateSeasonalRestictionError",
    "validation.product.start-date.seasonal.invalid-date":
      "ccUploadFilePageTableVesselStartDateSeasonalRestictionError",
    "error.file.array.min": "ccUploadFilePageErrorEmptyFile",
    "error.file.array.max": "ccUploadFilePageErrorMaxLandings",
    "error.file.any.required": "ccUploadFilePageErrorFileRequired",
    "error.upload.max-file-size": "ccUploadFilePageErrorMaxFileSize",
    "error.upload.invalid-file-type": "ccUploadFilePageErrorInvalidFileType",
    "error.upload.invalid-columns": "ccUploadFilePageErrorInvalidFile",
    "error.upload.av-failed": "ccUploadFilePageErrorAvFailed",
    "error.upload.max-landings": "ccUploadFilePageErrorMaxLandings",
    "error.upload.min-landings": "ccUploadFilePageErrorEmptyFile",
    "error.upload.missing-file": "ccUploadFilePageErrorMissing",
    "error.vesselPln.any.exists": "ccUploadFilePageTableVesselNotFound",
    "error.vesselPln.any.missing": "ccUploadFilePageTableVesselMissingError",
    "error.vesselPln.any.invalid": "ccUploadFilePageTableVesselInvalidLicenseError",
    "validation.gearCode.string.invalid": "ccUploadFilePageTableGearCodeNotFoundError",
    "validation.gearCode.string.unknown": "ccUploadFilePageTableGearCodeNotFoundError",
    "error.vessel.vesselName.any.required": "ccAddLandingVesselNameUnpopulatedError",
    "error.vessel.string.base": "ccAddLandingSelectVesselListNullError",
    "error.vessel.label.any.empty": "ccAddLandingVesselNameUnpopulatedError",
    "error.vessel.vessel.vesselName.any.empty": "ccAddLandingVesselNameUnpopulatedError",
    "error.vessel.any.required": "ccAddLandingVesselNameUnpopulatedError",
    "error.gearCategory.string.empty": "ccAddLandingSelectGearCategoryListNullError",
    "error.gearType.string.empty": "ccAddLandingSelectGearTypeListNullError",
    "error.gearType.invalid": "ccAddLandingGearTypeInvalidError",
    "error.weights.exportWeight.number.base": "ccCommonExportWeightRequiredError",
    "error.weights.exportWeight.number.decimal-places": "ccCommonExportWeightDecimalPlacesError",
    "error.weights.exportWeight.any.required": "ccCommonExportWeightRequiredError",
    "error.weights.exportWeight.any.empty": "ccCommonExportWeightRequiredError",
    "error.weights.exportWeight.any.missing": "ccCommonExportWeightMissingError",
    "error.weights.exportWeight.number.greater": "ccCommonExportWeightGreaterError",
    "error.weights.exportWeight.number.unsafe": "ccDirectLandingTotalWeightExceededError",
    "error.weights.array.totalWeightExceeded": "ccDirectLandingTotalWeightExceededError",
    "error.exportWeight.number.base": "ccCommonExportWeightRequiredError",
    "error.exportWeight.any.missing": "ccCommonExportWeightMissingError",
    "error.exportWeight.number.decimal-places": "ccCommonExportWeightDecimalPlacesError",
    "error.exportWeight.number.greater": "ccCommonExportWeightGreaterError",
    "error.exportWeight.number.unsafe": "ccDirectLandingTotalWeightExceededError",
    "error.dateLanded.any.missing": "ccUploadFileLandingDateMissingError",
    "error.vesselPln.string.required": "ccUploadFilePageTableVesselMissingError",
    "error.vesselPln.string.empty": "ccUploadFilePageTableVesselMissingError",
    "error.product.string.missing": "ccUploadFileProductIdMissingError",
    "error.startDate.any.missing": "ccUploadFileStartDateMissingError",
    "error.startDate.date.missing": "ccUploadFileStartDateMissingError",
    "error.highSeasArea.any.missing": "ccUploadFileHighSeasAreaMissingError",
    "error.rfmoCode.any.missing": "ccUploadFileRfmoCodeMissingError",
    "error.eezCode.any.missing": "ccUploadFileEezCodeMissingError",
    "error.gearCode.any.missing": "ccUploadFileGearCodeMissingError",
    "error.product.landing.missing": "ccAddLandingForSingleProductError",
    "error.products.landing.missing": "ccAddLandingForProductError",
    "error.catches.incomplete": "commonProgressProductDetailsRequiredError",
    "error.consignmentDescription.incomplete": "psProgressConsignmentDescriptionRequiredError",
    "error.processingPlant.incomplete": "psProgressProcessingPlantIdRequiredError",
    "error.processingPlantAddress.incomplete": "psProgressProcessingPlantAddressRequiredError",
    "error.exportHealthCertificate.incomplete": "psProgressHealthCertificateRequiredError",
    "error.exportDestination.incomplete": "commonProgressExportDestinationRequiredError",
    "error.startDate.seasonalFish.invalidate": "ccAddLandingStartDateRestrictedError",
    "error.seasonalFish.invalidate": "ccAddLandingDateLandedRestrictedError",
    "error.exportDate.any.required": "sdTransportExportDateInvalidError",
    "error.exportDate.date.format": "sdTransportExportDateInvalidError",
    "error.exportDate.date.max": "sdTransportCommonExportDateGreaterError",
    "error.startDate.date.base": "ccStartDateInvalidError",
    "error.startDate.date.max": "ccStartDateMaxError",
    "error.startDate.string.empty": "ccAddLandingStartDateUnpopulated",
    "error.startDate.date.format": "ccAddLandingStartDateInvalidFormat",
    "error.addTransportation.any.only": "ccAdditionalTransportType",
    "error.addTransportation.any.required": "ccAdditionalTransportTypeInvalid",
    "error.documents.name.string.empty": "ccAdditionalTransportDocumentNameRequiredError",
    "error.documents.reference.string.empty": "ccAdditionalTransportDocumentReferenceRequiredError",
    "error.documents.array.min": "ccAdditionalTransportDocumentAtleastOneRequiredError",
    "error.documents.name.string.max": "ccAdditionalTransportDocumentNameMaxCharError",
    "error.documents.reference.string.max": "ccAdditionalTransportDocumentReferenceMaxCharError",
    "error.documents.object.and": "ccAdditionalTransportDocumentObjectError",
    "error.exportedTo.any.required": "sdConsignmentDestinationRequiredError",
    "error.airwayBillNumber.string.max": "sdAirwayBillNumberMaxCharError",
    "error.airwayBillNumber.string.pattern.base": "sdAirwayBillNumberMaxPatternError",
    "error.facilityArrivalDate.date.missing": "ccCommonArrivalDateMissingError",
    "error.facilityArrivalDate.date.isoDate": "ccArrivalDateValidationError",
    "error.placeOfUnloading.any.required": "sdAddTransportationDetailsTruckPlaceOfUnloadingError",
    "error.placeOfUnloading.string.max": "sdAddTransportationDetailsPlaceOfUnloadingCharExceedError",
    "error.truck.exportDate.any.min": "sdTruckExportDateMin",
    "error.train.exportDate.any.min": "sdTrainExportDateMin",
    "error.plane.exportDate.any.min": "sdPlaneExportDateMin",
    "error.containerVessel.exportDate.any.min": "sdContainerVesselExportDateMin",
    "error.arrivalTransportationDetails.incomplete": "sdProgressArrivalTransportationDetailsRequiredError",
    "error.containerNumber.array.max": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.containerNumber.array.required": "commonAddTransportationDetailsPlaneContainerNumberLabelError",
    "error.dateLanded.string.empty": "ccCommonDateLandedRequiredError",
    "error.placeOfUnloading.string.pattern.base": "sdAddTransportationDetailsTruckPlaceOfUnloadingAsACombination",
    "validation.eezCode.string.max": "ccUploadFilePageTableEEZMaxCharError",
    "validation.totalExportWeight.number.max": "ccUploadFilePageTableTotalWeightExceededError",
    "error.startDate.any.required": "ccCommonStartDateUnpopulatedError",
    "error.gearCategory.any.required": "ccCommonGearCategoryUnpopulatedError",
    "error.gearType.any.required": "ccCommonGearTypeUnpopulatedError",
    "error.highSeasArea.any.required": "ccCommonHighSeasUnpopulatedError",
    "error.exclusiveEconomicZones.array.min": "ccCommonEEZUnpopulatedError",
    "error.eez.0.any.required": "ccCommonEEZUnpopulatedError",
    "error.eez.1.any.required": "ccCommonEEZUnpopulatedError",
    "error.eez.2.any.required": "ccCommonEEZUnpopulatedError",
    "error.eez.3.any.required": "ccCommonEEZUnpopulatedError",
    "error.eez.4.any.required": "ccCommonEEZUnpopulatedError",
    "error.eez.0.any.invalid": "ccCommonEEZInvalidError",
    "error.eez.1.any.invalid": "ccCommonEEZInvalidError",
    "error.eez.2.any.invalid": "ccCommonEEZInvalidError",
    "error.eez.3.any.invalid": "ccCommonEEZInvalidError",
    "error.eez.4.any.invalid": "ccCommonEEZInvalidError",
  };

  return errors[key] || key;
};

export const getTransformedError = (errors: IError[], vesselInput?: string): IErrorsTransformed => {
  const errorsTransformed: IErrorsTransformed = {};

  errors.forEach((error: IError) => {
    // Map containerNumber array-level errors to containerNumber.0 so they display under the first field
    let errorKey = error.key;

    // Normalize keys coming from server. Examples:
    // - "error.containerNumber.0.string.empty" -> "containerNumber.0"
    // - "error.railwayBillNumber.any.empty" -> "railwayBillNumber"
    // - "containerNumber" -> "containerNumber"
    if (typeof errorKey === "string") {
      // strip common prefixes
      errorKey = errorKey.replace(/^(?:error\.|validation\.)/, "");

      // remove trailing validation tokens starting at known suffix keywords
      errorKey = errorKey.replace(
        /\.(?:string|any|array|date|number|pattern|alphanum|min|max|base|isoDate|format|required|empty|validation)(?:\..*)?$/i,
        ""
      );

      // if the key ends with a numeric segment, keep it (e.g. containerNumber.0)
      // otherwise, if it's the array-level containerNumber and the message points to container label, map to .0
      if (errorKey === "containerNumber" && error.message?.includes("ContainerNumberLabelError")) {
        errorKey = "containerNumber.0";
      }
    }

    // Vessel fallback: if error is 'ccAddLandingVesselNameUnpopulatedError' but vessel field is not empty, show 'ccAddLandingSelectVesselListNullError'
    let errorMessage = error.message;
    if (
      errorKey === "vessel.vesselName" &&
      error.message === "ccAddLandingVesselNameUnpopulatedError" &&
      vesselInput !== undefined &&
      vesselInput.trim() !== ""
    ) {
      errorMessage = "ccAddLandingSelectVesselListNullError";
    }

    errorsTransformed[errorKey] = {
      key: errorKey,
      message: errorMessage,
      value: error.value,
      fieldId: `${errorKey}-error`,
    };
  });

  return errorsTransformed;
};

export const displayErrorMessages = (errors: IErrorsTransformed): IError[] =>
  Object.keys(errors).flatMap((key: string) => errors[key]);

export const displayErrorMessagesInOrder = (
  errors: IErrorsTransformed,
  errorKeysInOrder: string[],
  // When true use strict matching (exact key or numeric-index suffix) — intended for NMD journeys.
  // When false (default) fall back to the previous behaviour which matches by prefix (startsWith).
  strictForNmd = false
): Array<IErrorsTransformed[keyof IErrorsTransformed]> => {
  const remainingKeys = new Set(Object.keys(errors));

  const result: Array<IErrorsTransformed[keyof IErrorsTransformed]> = [];

  const sortMatchingKeys = (orderKey: string, keys: string[]) => {
    if (strictForNmd) {
      return keys.sort((a, b) => {
        const suffixA = a.slice(orderKey.length).replace(/^\.+/, "");
        const suffixB = b.slice(orderKey.length).replace(/^\.+/, "");

        const numA = /^\d+/.exec(suffixA);
        const numB = /^\d+/.exec(suffixB);

        if (numA && numB) {
          return Number(numA[0]) - Number(numB[0]);
        }

        if (numA && !numB) return -1;
        if (!numA && numB) return 1;

        return a.localeCompare(b);
      });
    }

    // Non-strict fallback: simple lexicographic order for keys that start with the orderKey
    return keys.sort((a, b) => a.localeCompare(b));
  };

  errorKeysInOrder.forEach((orderKey) => {
    const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    let matchingKeys: string[];

    if (strictForNmd) {
      // match either the exact key, or the key followed by a numeric index (e.g. containerNumber or containerNumber.0)
      const keyRegex = new RegExp(`^${escapeRegExp(orderKey)}(?:\\.(\\d+))?$`);
      matchingKeys = Object.keys(errors).filter((objKey) => keyRegex.test(objKey));
    } else {
      // legacy behaviour: match any key that starts with the orderKey
      matchingKeys = Object.keys(errors).filter((objKey) => objKey.startsWith(orderKey));
    }

    if (matchingKeys.length === 0) return;

    const sortedKeys = sortMatchingKeys(orderKey, matchingKeys);
    sortedKeys.forEach((k) => {
      if (remainingKeys.has(k)) {
        result.push(errors[k]);
        remainingKeys.delete(k);
      }
    });
  });

  return result;
};

export const getErrorKeysInOrderForTransport = (transportType: string, isArrival = false): string[] => {
  const t = (transportType || "").toLowerCase();

  switch (t) {
    case "train":
      if (isArrival) {
        // On arrival the page shows railway bill first — match visual field order
        return [
          "railwayBillNumber",
          "freightBillNumber",
          "departureCountry",
          "departurePort",
          "placeOfUnloading",
          "departureDate",
          "containerNumber",
        ];
      }
      return [
        "departureCountry",
        "departurePort",
        "containerNumber",
        "exportDate",
        "railwayBillNumber",
        "freightBillNumber",
      ];

    case "truck":
      if (isArrival) {
        // On truck arrival the departure date field is visually last — place it last in order
        return [
          "nationalityOfVehicle",
          "registrationNumber",
          "departurePlace",
          "freightBillNumber",
          "containerNumber",
          "departureCountry",
          "departurePort",
          "placeOfUnloading",
          "departureDate",
        ];
      }
      // Departure (non-arrival) page order: consignment destination/point/leave-from (handled by commonOrder), then
      // container numbers, export date, nationality, registration, freight
      return ["containerNumber", "exportDate", "nationalityOfVehicle", "registrationNumber", "freightBillNumber"];

    case "plane":
      if (isArrival) {
        // Arrival page order: flight number, airway bill, containers, freight,
        // departure country/port, place of unloading, then departure date
        return [
          "flightNumber",
          "airwayBillNumber",
          "containerNumber",
          "freightBillNumber",
          "departureCountry",
          "departurePort",
          "placeOfUnloading",
          "departureDate",
        ];
      }

      return ["flightNumber", "departurePlace", "exportDate", "containerNumber", "airwayBillNumber"];

    case "containervessel":
    case "container-vessel":
    case "container_vessel":
      if (isArrival) {
        // Match visual order on arrival page: vessel name, flag, containers, freight, country/port/place, departure date
        return [
          "vesselName",
          "flagState",
          "containerNumber",
          "freightBillNumber",
          "departureCountry",
          "departurePort",
          "placeOfUnloading",
          "departureDate",
        ];
      }
      return ["exportDate", "vesselName", "flagState", "containerNumber", "freightBillNumber"];

    default:
      return ["containerNumber", "freightBillNumber", "railwayBillNumber"];
  }
};

export const displayErrorTransformedMessages = (errors: IErrorsTransformed): IError[] => {
  const allErrors = Object.keys(errors).map((key: string) => errors[key]);

  // Deduplicate errors with the same message (for addressFirstPart composite validation)
  // Keep only the first occurrence (buildingNumber) so error summary shows it once
  const seen = new Set<string>();
  return allErrors.filter((error) => {
    if (seen.has(error.message)) {
      return false;
    }
    seen.add(error.message);
    return true;
  });
};
