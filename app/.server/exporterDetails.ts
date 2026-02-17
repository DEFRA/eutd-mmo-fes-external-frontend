import jwt from "jsonwebtoken";
import isEmpty from "lodash/isEmpty";
import { getEnv } from "~/env.server";

// Import cross-fetch for test mode (MSW v1.3.1 cannot intercept Node 18+ native fetch)
/* istanbul ignore next */
import crossFetch from "cross-fetch";

// Use cross-fetch in test mode, native fetch otherwise
/* istanbul ignore next */
const fetchImpl = process.env.NODE_ENV === "test" ? crossFetch : fetch;

import type {
  AddressDetails,
  ErrorResponse,
  Exporter,
  IError,
  IExporter,
  IUnauthorised,
  Journey,
  ProcessingStatement,
  UserDetails,
} from "~/types";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getDynamicsContactAccountLinks,
  getDynamicsHeader,
  getDynamicsToken,
  getLandingsEntryOption,
  getProcessingStatement,
  instanceOfUnauthorised,
  shouldLoadFromIdm,
  validateCSRFToken,
} from "~/.server";
import { getIdmUserDetailsUrl, getIdmAddressDetailsUrl, getAddExporterDetailsUrl } from "~/urls.server";
import { apiCallFailed, get, post } from "~/communication.server";
import serverLogger from "~/logger.server";
import { redirect, type Params } from "react-router";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { getErrorMessage } from "~/helpers";
import { loadIdmData } from "~/loadIdmData.server";

const ENV = getEnv();

export const getContactAccountLinks = async (contactId: string, dynamicToken: string) => {
  let contactAccountLinks = [];

  if (contactId) {
    contactAccountLinks = await getDynamicsContactAccountLinks(contactId, dynamicToken);
  }

  return contactAccountLinks;
};

export const getExporterDetailsFromMongo = async (
  bearerToken: string,
  documentNumber: string | undefined,
  journey: Journey
): Promise<IExporter> => {
  if (!documentNumber) {
    throw new Error("document number is required");
  }

  const response: Response = await get(bearerToken, getAddExporterDetailsUrl(journey), {
    documentnumber: documentNumber,
  });

  return onGetExporterDetailsResponse(response);
};

export const getUserDetails = async (bearerToken: string): Promise<IExporter> => {
  if (ENV.DISABLE_IDM) {
    return await onGetIDMUserDetailsResponse(await fetchImpl(`${ENV.STUB_URL}/dynamix/user-details`));
  }

  const dynamicsToken = await getDynamicsToken();
  const response: Response = await fetchImpl(
    getIdmUserDetailsUrl(jwt.decode(bearerToken)),
    getDynamicsHeader(dynamicsToken)
  );

  return onGetIDMUserDetailsResponse(response);
};

export const getAccountDetailsFromClaims = (claims: any) => {
  const { currentRelationshipId, relationships } = claims;

  const relationshipWithId = relationships.find((str: string) => str.includes(currentRelationshipId));

  const relationshipIdTokens = relationshipWithId.split`:`;
  // tokens come in the form [relationshipId, accountId, exporterCompanyName, <number>, (Employee, Agent, Citizen), <number>]

  const [, accountId, exporterCompanyName] = relationshipIdTokens; // we will take only what we need

  return { accountId, exporterCompanyName };
};

export const getAddresses = async (bearerToken: string): Promise<IExporter> => {
  if (ENV.DISABLE_IDM) {
    return await onGetIDMAddressDetailsResponse(await fetchImpl(`${ENV.STUB_URL}/dynamix/addresses`));
  }

  const claims: any = jwt.decode(bearerToken);
  const { contactId } = claims;

  const { accountId } = getAccountDetailsFromClaims(claims);

  const dynamicsToken = await getDynamicsToken();
  const response: Response = await fetchImpl(
    getIdmAddressDetailsUrl(contactId, accountId),
    getDynamicsHeader(dynamicsToken)
  );

  return onGetIDMAddressDetailsResponse(response);
};

export const getAccounts = (bearerToken: string): IExporter => {
  if (ENV.DISABLE_IDM) {
    return {
      error: "",
      errors: [],
      model: { accountId: ENV.MOCK_ORG_ACCOUNT_ID, exporterCompanyName: ENV.MOCK_ORG_COMPANY_NAME },
    };
  }

  const claims: any = jwt.decode(bearerToken);
  const { accountId, exporterCompanyName } = getAccountDetailsFromClaims(claims);

  const isAnOrganisation: boolean = !!accountId;

  if (!isAnOrganisation) {
    return {
      error: "",
      errors: [],
    };
  }

  const exporter: IExporter = {
    error: "",
    errors: [],
    model: {
      exporterCompanyName,
      accountId,
    },
  };

  return exporter;
};

const onGetExporterDetailsResponse = async (response: Response): Promise<IExporter> => {
  switch (response.status) {
    case 200:
      return {
        ...(await response.json()),
        error: "",
        errors: [],
      };
    case 500:
    case 204:
      return {
        error: "",
        errors: [],
      };
    case 403:
      return {
        error: "",
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const onGetIDMUserDetailsResponse = async (response: Response): Promise<IExporter> => {
  switch (response.status) {
    case 200: {
      try {
        return parseContactsResponse(await response.json());
      } catch (e) {
        serverLogger.error(`[DYNAMICS][GET-USER-DETAILS][FAILED][${e}]`);

        return {
          error: "",
          errors: [],
        };
      }
    }
    case 204:
    case 403:
    case 404:
    case 500:
      return {
        error: "",
        errors: [],
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

const onGetIDMAddressDetailsResponse = async (response: Response): Promise<IExporter> => {
  switch (response.status) {
    case 200: {
      try {
        return parseAddressResponse(await response.json());
      } catch (e) {
        serverLogger.error(`[DYNAMICS][GET-ADDRESS-DETAILS][FAILED][${e}]`);

        return {
          error: "",
          errors: [],
        };
      }
    }
    case 204:
    case 403:
    case 404:
    case 500:
      return {
        error: "",
        errors: [],
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const parseAddressResponse: (data: any) => IExporter = (data: any) => {
  data = Array.isArray(data.value) ? data.value : [data];
  const databuckets: AddressDetails[] = data.map((d: any) => {
    let prem = d.defra_Address.defra_premises;
    if (prem && prem === "null") {
      prem = null;
    }

    let newKeyName;
    Object.keys(d.defra_Address).forEach((keyName) => {
      newKeyName = keyName.replace(/\.|@/g, "_");
      d.defra_Address[newKeyName] = d.defra_Address[keyName];
      if (keyName !== newKeyName) delete d.defra_Address[keyName];
    });

    return {
      uprn: d.defra_Address.defra_uprn,
      buildingname: d.defra_Address.defra_buildingname,
      subbuildingname: d.defra_Address.defra_subbuildingname,
      premises: prem,
      street: d.defra_Address.defra_street,
      locality: d.defra_Address.defra_locality,
      dependentlocality: d.defra_Address.defra_dependentlocality,
      towntext: d.defra_Address.defra_towntext,
      county: d.defra_Address.defra_county,
      postcode: d.defra_Address.defra_postcode,
      countryId: d.defra_Address._defra_country_value,
      country: d.defra_Address._defra_country_value_OData_Community_Display_V1_FormattedValue,
      internationalpostalcode: d.defra_Address.defra_internationalpostalcode,
      fromcompanieshouse: d.defra_Address.defra_fromcompanieshouse,
      _dynamicsAddress: d.defra_Address,
    };
  });

  return getAddressModelFromDynamicsResponse(databuckets);
};

export const parseContactsResponse: (data: any) => IExporter = function (data: any) {
  data = Array.isArray(data.value) ? data.value : [data];
  const databuckets: UserDetails[] = data.map((d: any) => ({
    contactId: d.contactid,
    firstName: d.firstname,
    lastName: d.lastname,
  }));

  return getUserModelFromDynamicsResponse(databuckets);
};

const getAddressArrayFromDynamicsResponse = (dynamicsResponse: AddressDetails) => {
  let addressArray = [];
  let addrOne = "";

  if (dynamicsResponse.premises && dynamicsResponse.premises !== null && dynamicsResponse.premises.length > 0) {
    addrOne += dynamicsResponse.premises;
    addrOne += ", ";
  }

  if (
    dynamicsResponse.subbuildingname &&
    dynamicsResponse.subbuildingname !== null &&
    dynamicsResponse.subbuildingname.length > 0
  ) {
    addrOne += dynamicsResponse.subbuildingname;
    addrOne += ", ";
  }

  if (
    dynamicsResponse.buildingname &&
    dynamicsResponse.buildingname !== null &&
    dynamicsResponse.buildingname.length > 0
  ) {
    addrOne += dynamicsResponse.buildingname;
    addrOne += ", ";
  }

  if (dynamicsResponse.street && dynamicsResponse.street !== null && dynamicsResponse.street.length > 0) {
    let partsOfStr = dynamicsResponse.street.split(",");
    if (partsOfStr.length > 1) {
      addrOne += partsOfStr[0].trim();
      addressArray.push(addrOne);
      addressArray.push(dynamicsResponse.street.slice(partsOfStr[0].length + 1).trim());
    } else {
      addrOne += dynamicsResponse.street;
      addressArray.push(addrOne);
    }
  } else {
    addressArray.push(addrOne);
  }

  if (dynamicsResponse.locality && dynamicsResponse.locality != null && dynamicsResponse.locality.length > 0) {
    addressArray.push(dynamicsResponse.locality);
  }
  if (
    dynamicsResponse.dependantLocality &&
    dynamicsResponse.dependantLocality != null &&
    dynamicsResponse.dependantLocality.length > 0
  ) {
    addressArray.push(dynamicsResponse.dependantLocality);
  }
  if (dynamicsResponse.towntext && dynamicsResponse.towntext != null && dynamicsResponse.towntext.length > 0) {
    addressArray.push(dynamicsResponse.towntext);
  }
  if (dynamicsResponse.county && dynamicsResponse.county != null && dynamicsResponse.county.length > 0) {
    addressArray.push(dynamicsResponse.county);
  }

  return addressArray;
};

const getAddressModelFromDynamicsResponse: (response: AddressDetails[]) => IExporter = (response: AddressDetails[]) => {
  let addressArray = getAddressArrayFromDynamicsResponse(response[0]);
  let model: Exporter = {};
  let dynamicsResponse = response[0];
  model.addressOne = addressArray[0];

  if (dynamicsResponse.postcode && dynamicsResponse.postcode != null && dynamicsResponse.postcode.length > 0) {
    model.postcode = dynamicsResponse.postcode;
  } else if (
    dynamicsResponse.internationalpostalcode &&
    dynamicsResponse.internationalpostalcode != null &&
    dynamicsResponse.internationalpostalcode.length > 0
  ) {
    model.postcode = dynamicsResponse.internationalpostalcode;
  }

  model._dynamicsAddress = dynamicsResponse._dynamicsAddress;

  let arrLength = addressArray.length;
  if (arrLength > 1) {
    model.townCity = addressArray[arrLength - 1];
    arrLength = arrLength - 1;
  }

  let addrTwo = "";
  if (arrLength > 1) {
    for (let idx = 1; idx < arrLength; idx++) {
      addrTwo += addressArray[idx];
      if (idx < arrLength - 1) {
        addrTwo += ", ";
      }
    }
  }
  model.addressTwo = addrTwo;
  model.buildingNumber = dynamicsResponse.premises;
  model.subBuildingName = dynamicsResponse.subbuildingname;
  model.buildingName = dynamicsResponse.buildingname;
  model.streetName = dynamicsResponse.street;
  model.townCity = dynamicsResponse.towntext || dynamicsResponse.locality;
  model.county = dynamicsResponse.county;
  model.country = dynamicsResponse.country;
  let addressobj: IExporter = {
    error: "",
    errors: [],
  };
  addressobj["model"] = model;
  return addressobj;
};

const getUserModelFromDynamicsResponse: (userDetails: UserDetails[]) => IExporter = (response: UserDetails[]) => {
  let model: Exporter = {};
  model.exporterFullName =
    !isEmpty(response[0].firstName) && !isEmpty(response[0].lastName)
      ? `${response[0].firstName} ${response[0].lastName}`
      : undefined;
  model.contactId = response[0].contactId;
  model._dynamicsUser = {
    firstName: !isEmpty(response[0].firstName) ? response[0].firstName : undefined,
    lastName: !isEmpty(response[0].lastName) ? response[0].lastName : undefined,
  };

  let userObject: IExporter = {
    error: "",
    errors: [],
  };
  userObject["model"] = model;
  return userObject;
};

export const addExporterDetails = async (
  bearerToken: string,
  documentNumber: string | undefined,
  payload: Exporter,
  journey: Journey
): Promise<IExporter> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const response: Response = await post(
    bearerToken,
    getAddExporterDetailsUrl(journey),
    {
      documentnumber: documentNumber,
    },
    payload
  );

  return onAddExporterDetailsResponse(response);
};

const onAddExporterDetailsResponse = async (response: Response): Promise<IExporter> => {
  switch (response.status) {
    case 200:
    case 204:
      return await response.json();
    case 400: {
      const data = await response.json();
      // Handle both array (frontend validation) and object (backend API) error formats
      let normalizedErrors: IError[] = [];

      if (Array.isArray(data.errors)) {
        // Frontend validation already returns IError[] format
        normalizedErrors = data.errors;
      } else if (data?.errors && typeof data.errors === "object") {
        // Backend API returns object format - convert to IError[]
        normalizedErrors = Object.keys(data.errors).map((key: string) => ({
          key: key,
          message: getErrorMessage(data.errors[key]),
        }));
      }

      return {
        ...data,
        errors: normalizedErrors,
      };
    }
    case 403:
      return {
        ...(await response.json()),
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const exporterDetailsLoader = async (request: Request, params: Params, journey: Journey) => {
  /* istanbul ignore next */
  setApiMock(request.url);
  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  if (journey === "processingStatement") {
    session.unset(`documentNumber-${documentNumber}`);
    session.unset(`copyDocumentAcknowledged-${documentNumber}`);
    session.unset(`copyDocument-${documentNumber}`);
    session.unset("exporterCompanyName");
  }

  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const exporter: IExporter = await getExporterDetailsFromMongo(bearerToken, documentNumber, journey);
  const unauthorised: boolean = exporter.unauthorised ?? false;
  if (unauthorised) {
    return redirect("/forbidden");
  }

  const isCatchCertificate: boolean = journey === "catchCertificate";

  const exporterFullName = session.get("exporterFullName") ?? exporter.model?.exporterFullName;
  const exporterCompanyName = session.get("exporterCompanyName") ?? exporter.model?.exporterCompanyName;

  if (shouldLoadFromIdm(bearerToken, exporter)) {
    const { userDetails, addresses, accounts } = await loadIdmData(bearerToken);
    return new Response(
      JSON.stringify({
        model: {
          contactId: userDetails.model?.contactId,
          accountId: accounts.model?.accountId,
          ...(isCatchCertificate && { exporterFullName: userDetails.model?.exporterFullName }),
          exporterCompanyName: accounts.model?.exporterCompanyName,
          ...addresses.model,
        },
        documentNumber,
        nextUri,
        csrf,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      model: { ...exporter.model, ...(isCatchCertificate && { exporterFullName }), exporterCompanyName },
      documentNumber,
      nextUri,
      csrf,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const exporterDetailsAction = async (
  request: Request,
  params: Params,
  journey: Journey
): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");
  const exporterFullName = form.get("exporterFullName") as string;
  const exporterCompanyName = form.get("exporterCompanyName") as string;
  const nextUri = form.get("nextUri") as string;
  const session = await getSessionFromRequest(request);
  const isCatchCertificate: boolean = journey === "catchCertificate";
  const isProcessingStatement: boolean = journey === "processingStatement";
  let processingStatementProductSuffix = "";

  if (isProcessingStatement) {
    const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
      bearerToken,
      documentNumber
    );

    if (instanceOfUnauthorised(processingStatement)) {
      return redirect("/forbidden");
    }

    if (
      processingStatement.products &&
      Array.isArray(processingStatement.products) &&
      processingStatement.products.length > 0
    ) {
      const products = processingStatement.products;
      const lastProduct = products[products.length - 1];
      const lastProductId = lastProduct?.id;
      if (lastProductId) {
        processingStatementProductSuffix = `/${lastProductId}`;
      }
    }
  }

  const routes = {
    catchCertificate: {
      change: route("/create-catch-certificate/:documentNumber/what-exporters-address", { documentNumber }),
      currentUri: route("/create-catch-certificate/:documentNumber/add-exporter-details", { documentNumber }),
      nextUri: route("/create-catch-certificate/:documentNumber/what-are-you-exporting", { documentNumber }),
      saveAsDraft: route("/create-catch-certificate/catch-certificates"),
    },
    processingStatement: {
      change: route("/create-processing-statement/:documentNumber/what-exporters-address", { documentNumber }),
      currentUri: route("/create-processing-statement/:documentNumber/add-exporter-details", { documentNumber }),
      nextUri: `/create-processing-statement/${documentNumber}/add-consignment-details${processingStatementProductSuffix}`,
      saveAsDraft: route("/create-processing-statement/processing-statements"),
    },
    storageNotes: {
      change: route("/create-non-manipulation-document/:documentNumber/what-exporters-address", { documentNumber }),
      currentUri: route("/create-non-manipulation-document/:documentNumber/add-exporter-details", { documentNumber }),
      nextUri: `/create-non-manipulation-document/${documentNumber}/add-product-to-this-consignment`,
      saveAsDraft: route("/create-non-manipulation-document/non-manipulation-documents"),
    },
  };

  if (form.get("_action") === "change") {
    if (isCatchCertificate) session.set("exporterFullName", exporterFullName);
    session.set("exporterCompanyName", exporterCompanyName);
    session.unset("currentStep");
    session.unset("postcode");

    return redirect(routes[journey]["change"], {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  const exporter: IExporter = await getExporterDetailsFromMongo(bearerToken, documentNumber, journey);
  let payload: Exporter;

  if (shouldLoadFromIdm(bearerToken, exporter)) {
    const { userDetails, addresses, accounts } = await loadIdmData(bearerToken);

    payload = {
      ...userDetails.model,
      ...addresses.model,
      ...accounts.model,
    };
  } else {
    payload = {
      ...exporter.model,
    };
  }

  if (isCatchCertificate) {
    payload.exporterFullName = exporterFullName;
  }
  payload.exporterCompanyName = exporterCompanyName;
  payload.journey = journey;
  payload.currentUri = routes[journey]["currentUri"];
  payload.nextUri = routes[journey]["nextUri"];

  const isSaveAsDraft: boolean = form.get("_action") === "saveAsDraft";

  // Validate required fields before submitting to backend
  if (!isSaveAsDraft) {
    const validationErrors: IError[] = [];

    // Validate full name for catch certificate journey
    if (isCatchCertificate && (!payload.exporterFullName || payload.exporterFullName.trim().length === 0)) {
      validationErrors.push({
        key: "exporterFullName",
        message: "commonAddExporterDetailsPersonResponsibleError",
      });
    }

    // Validate company name
    if (!payload.exporterCompanyName || payload.exporterCompanyName.trim().length === 0) {
      validationErrors.push({
        key: "exporterCompanyName",
        message: "commonAddExporterDetailsErrorCompanyName",
      });
    }

    // Validate address presence - check if addressOne and postcode exist and have values
    const hasAddressData =
      payload.addressOne &&
      payload.postcode &&
      typeof payload.addressOne === "string" &&
      typeof payload.postcode === "string" &&
      payload.addressOne.trim().length > 0 &&
      payload.postcode.trim().length > 0;

    if (!hasAddressData) {
      validationErrors.push({
        key: "exporterAddress",
        message: "commonAddExporterDetailsAddTheExportersAddress",
      });
    }

    // Return all validation errors if any found
    if (validationErrors.length > 0) {
      return apiCallFailed(validationErrors, {
        model: payload,
        error: "invalid",
      });
    }
  }

  const response: IExporter = await addExporterDetails(bearerToken, documentNumber, payload, journey);
  const unauthorised = response.unauthorised;

  if (unauthorised) {
    return redirect("/forbidden");
  }

  if (isSaveAsDraft) {
    if (isCatchCertificate) session.unset("exporterFullName");
    session.unset("exporterCompanyName");
    return redirect(routes[journey]["saveAsDraft"], {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  const errors: IError[] = (response.errors as IError[]) || [];
  if (errors.length > 0) {
    return apiCallFailed(errors, {
      model: response.model,
      error: response.error,
    });
  }

  if (isCatchCertificate) session.unset("exporterFullName");
  session.unset("exporterCompanyName");

  const isLandingsEntryUploadFile =
    isCatchCertificate &&
    (await getLandingsEntryOption(bearerToken, documentNumber)).landingsEntryOption === "uploadEntry";
  const latestSession = await commitSession(session);

  return redirect(
    isEmpty(nextUri)
      ? isLandingsEntryUploadFile
        ? `/create-catch-certificate/${documentNumber}/upload-file`
        : routes[journey]["nextUri"]
      : nextUri,
    { headers: { "Set-Cookie": latestSession } }
  );
};
