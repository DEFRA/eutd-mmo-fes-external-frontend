import { getEnv } from "~/env.server";
import type { Journey } from "~/types";
import querystring from "querystring";

const ENV = getEnv();
const serviceUrl = ENV.DYNAMICS_RESOURCEURL + ENV.DYNAMICS_ENDPOINTBASE;

export const LANDINGS_TYPE_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/landings-type`;
export const ADD_YOUR_REFERENCE_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/userReference`;
export const NOTIFICATION_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/notification`;
export const SAVE_AND_VALIDATE_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/home/saveAndValidate`;
export const CONFIRM_DOCUMENT_DELETE_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/confirm-document-delete`;
export const CONFIRM_CHANGE_LANDINGS_TYPE_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/confirm-change-landings-type`;
export const MANUAL_EXPORTER_ADDRESS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/exporter-validate`;
export const CONSERVATION_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/conservation`;
export const COUNTRIES_URL = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/countries`;
export const EXPORT_LOCATION_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-location`;
export const EXPORT_LOCATION_DRAFT_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-location/saveAsDraft`;
export const GET_TRANSPORTATIONS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transportations`;
export const SAVE_TRANSPORT_DETAILS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/transport/add`;
export const ADD_TRANSPORT_DETAILS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport/add`;
export const SAVE_TRUCK_CMR_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/transport/truck/cmr`;
export const CHECK_ADDITIONAL_TYPES_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport/check`;
export const CONFIRM_COPY_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/confirm-copy-certificate`;
export const CHECK_COPY_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/check-copy-certificate`;
export const VOID_CERTIFICATE_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/void-certificate`;
export const GET_CLIENT_IP_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/client-ip`;
export const ADDED_SPECIES_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/fish/added`;
export const ADD_SPECIES_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/fish/add`;
export const SPECIES_URL = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/species`;
export const FAVOURITES_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/favourites`;
export const SPECIES_STATE_LOOK_UP = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/speciesStateLookup`;
export const COMMODITY_CODE_LOOK_UP = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/commodities/search`;
export const COMMODITY_CODES = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/commodities`;
export const GET_CERTIFICATE_SUMMARY = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/certificate/catchCertificate`;
export const UPLOAD_LANDINGS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v2/uploads/landings`;
export const EXPORT_PAYLOAD_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/export-payload`;
export const GET_DIRECT_LANDINGS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/export-payload/direct-landings`;
export const VALIDATE_DIRECT_LANDINGS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/direct-landing/validate`;
export const VALIDATE_LANDINGS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/landing/validate`;
export const SAVE_LANDINGS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v2/save/landings`;
export const CLEAR_LANDINGS_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v2/clear/landings`;
export const SAVE_AND_VALIDATE_EXPORT_URL = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/export-payload/validate`;
export const CREATE_EXPORT_CERTIFICATE = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/create`;
export const GET_PROCESSING_STATEMENT = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/processingStatement`;
export const GET_STORAGE_DOCUMENT = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/storageNotes`;
export const USER_ATTRIBUTES = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/userAttributes`;
export const GET_GEAR_CATEGORIES_URL = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/gear-categories`;
export const GET_RFMO_AREAS_URL = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/rfmo-areas`;

export const getAddProcessingStatementUrl = (currentUrl: string, saveToRedisIfErrors: boolean) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/processingStatement/saveAndValidate?c=${currentUrl}&saveToRedisIfErrors=${
    saveToRedisIfErrors ? "true" : "false"
  }`;

export const getAddStorageDocumentUrl = (currentUrl: string, saveToRedisIfErrors: boolean) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/storageNotes/saveAndValidate?c=${currentUrl}&saveToRedisIfErrors=${
    saveToRedisIfErrors ? "true" : "false"
  }`;

export const getIdmUserDetailsUrl = (claims: any) => {
  let params = {};

  if (claims?.sub) {
    params = {
      $filter: `defra_b2cobjectid eq '${claims.sub}'`,
      $select:
        "contactid,defra_b2cobjectid,defra_addrcoruprn,defra_addrcorbuildingnumber,defra_addrcorbuildingname," +
        "defra_addrcorsubbuildingname,defra_addrcorlocality,defra_addrcordependentlocality," +
        "defra_addrcorpostcode,defra_addrcorinternationalpostalcode,defra_addrcortown,defra_addrcorcounty," +
        "_defra_addrcorcountry_value,defra_addrcorstreet,firstname,lastname,emailaddress1,telephone1," +
        "defra_tacsacceptedversion,defra_tacsacceptedon",
    };
  }

  return serviceUrl + "contacts?" + querystring.stringify(params);
};

export const getIdmAddressDetailsUrl = (contactId: string, accountId?: string) => {
  const params = {
    $filter: accountId
      ? `defra_addresstype eq 1 and statecode eq 0 and _defra_customer_value eq '${accountId}'`
      : `defra_addresstype eq 3 and statecode eq 0 and _defra_customer_value eq '${contactId}'`,
    $select: "_defra_address_value,_defra_customer_value",
    $expand:
      "defra_Address($select=defra_uprn,defra_buildingname,defra_subbuildingname,defra_premises," +
      "defra_street,defra_locality,defra_dependentlocality,defra_towntext,defra_county,defra_postcode," +
      "_defra_country_value,defra_internationalpostalcode,defra_fromcompanieshouse)",
  };

  return serviceUrl + "defra_addressdetailses?" + querystring.stringify(params);
};

export const landingUrl = (productId: string, landingId: string) =>
  `${EXPORT_PAYLOAD_URL}/product/${productId}/landing/${landingId}`;

export const updateFishUrl = (productId: string) => `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/fish/add/${productId}`;

export const addTransportationDetailsUrl = (transportType: string, saveAsDraft: boolean = false) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/transport/${transportType}/details${saveAsDraft ? "/saveAsDraft" : ""}`;
export const getAllDocumentsUrl = (type: Journey, year: number, month: number) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/documents/${year}/${month}?type=${type}`;

export const createDocumentUrl = (documentType: string) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/document/${documentType}`;

export const getAddExporterDetailsUrl = (type: Journey) => `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/exporter/${type}`;

export const findAddress = (postcode: string | undefined) =>
  `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/addresses/search?postcode=${postcode}`;

export const searchVesselName = (searchTerm: string, date: string) =>
  `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/vessels/search?searchTerm=${searchTerm}&landedDate=${date}`;

export const generatePdf = (journey: Journey) => `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/${journey}/generatePdf`;

export const getTransportDetailsUrl = (journey: Journey, arrival?: boolean) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/transport/details/${journey}?arrival=${arrival}`;

export const getTransportByIdUrl = (transportId: string, subResource?: string) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport/${transportId}${subResource ? `/${subResource}` : ""}`;

export const updateTransportDetailsByIdUrl = (transportId: string, isDraft?: boolean) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport-details/${transportId}${isDraft ? `?draft=${isDraft}` : ""}`;

export const deleteTransportByIdUrl = (transportId: string) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport/${transportId}`;

export const updateTransportDocumentsByIdUrl = (transportId: string, isDraft?: boolean) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport-documents/${transportId}${isDraft ? `?draft=${isDraft}` : ""}`;

export const getProgressUrl = (journey: Journey) => `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/progress/${journey}`;

export const checkProgressUrl = (journey: Journey) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/progress/complete/${journey}`;

export const getCreatedCertificateUrl = (documentNumber: string) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/document/${documentNumber}`;

export const certificatesPdfReference = (uuid: string) =>
  `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/certificates?pdfReference=${uuid}`;

export const getGearTypesByCategoryUrl = (gearCategory: string) =>
  `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/gear-type/${gearCategory}`;

// Mock urls to use with MSW in cases where the URL contains query string parameters (as MSW ignores them)
//   or where the value of url path parameters are irrelevant
export const mockGetAllDocumentsUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/documents/:year/:month`;
export const mockCreateDocumentUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/document/:journey`;
export const mockFindExporterAddressUrl = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/addresses/search`;
export const mockGetProgress = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/progress/:journey`;
export const mockCheckProgressUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/progress/complete/:journey`;
export const mockAddExporterDetails = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/exporter/:journey`;
export const mockDocumentUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/document/:documentNumber`;
export const mockSearchVesselName = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/vessels/search`;
export const mockCertificatesPdfUrl = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/certificates`;
export const mockTransportDetailsUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/transport/details/:journey`;
export const mockGetTransportByIdUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport/:transportId`;
export const mockPutTransportDetailsByIdUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport-details/:transportId`;
export const mockGetAddProcessingStatementUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/processingStatement/saveAndValidate`;
export const mockGetAddStoargaDocumentUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/storageNotes/saveAndValidate`;
export const mockCountriesUrl = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/countries`;
export const mockFavouriteUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/favourites/:id`;
export const mockUpdateFishUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/fish/add/:productId`;
export const mockGetIdmUserDetails = `${ENV.STUB_URL}/dynamix/user-details`;
export const mockGetIdmAddressDetails = `${ENV.STUB_URL}/dynamix/addresses`;
export const mockDeleteLandingUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/export-payload/product/:productId/landing/:landingId`;
export const mockDeleteProductUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/export-certificates/export-payload/product/:productId`;
export const mockEditProductUrl = `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/fish/add/:productId`;
export const mockGetGearCategoriesUrl = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/gear-categories`;
export const mockGetGearTypesByCategoriesUrl = `${ENV.MMO_ECC_REFERENCE_SVC_URL}/v1/gear-type/:gearCategory`;

export const mockSaveAndValidateDocument = (journey: Journey) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/${journey}/saveAndValidate`;

export const mockUpdateTransportDocumentsByIdUrl = (transportId: string) =>
  `${ENV.MMO_ECC_ORCHESTRATION_SVC_URL}/v1/catch-certificate/transport-documents/${transportId}`;

export const MOCK_ADMIN_LOGIN_DISCOVERYURI =
  "https://login.microsoftonline.com/dummy_tenantid/.well-known/openid-configuration";
export const MOCK_ADMIN_LOGIN_TOKENURI = "https://login.microsoftonline.com/dummy_tenantid/oauth2/v2.0/token";
export const MOCK_ADMIN_LOGIN_KEYSURI = "https://login.microsoftonline.com/common/discovery/keys";
