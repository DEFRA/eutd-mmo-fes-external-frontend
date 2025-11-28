import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { route } from "routes-gen";
import {
  getBearerTokenForRequest,
  validateCSRFToken,
  postCodeLookUp,
  createCSRFToken,
  getCountries,
  isCancelAddAddress,
  getProcessingStatement,
  validateResponseData,
  isGetAddress,
  updateProcessingStatement,
  handleManualAddressErrors,
  addManualExporterAddress,
  hasLookUpAddressError,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import { displayErrorTransformedMessages, getAddressOne, getCountryData } from "~/helpers";
import { ButtonGroup, WhatExportersAddress } from "~/composite-components";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { apiCallFailed, json } from "~/communication.server";
import type {
  ErrorResponse,
  ExporterAddressButtonType,
  ExporterAddressStep,
  ICountry,
  ILookUpAddress,
  ILookUpAddressDetails,
  ProcessingStatement,
  IUnauthorised,
  IErrorsTransformed,
  IError,
  IExporter,
  Exporter,
} from "~/types";
import setApiMock from "tests/msw/helpers/setApiMock";
import { ensureCSRFInSession } from "~/helpers/session";
import { createResponseData } from "~/helpers/addressLookup";

type loaderPlantAddress = {
  documentNumber: string;
  plantAddressOne?: string;
  plantBuildingNumber?: string;
  plantSubBuildingName?: string;
  plantBuildingName?: string;
  plantStreetName?: string;
  plantCounty?: string;
  plantCountry?: string;
  plantTownCity?: string;
  plantPostcode: string;
  nextUri?: string;
  csrf: string;
  currentStep?: ExporterAddressStep;
  postcode?: string;
  postcodeaddress?: ILookUpAddressDetails;
  postcodeaddresses?: ILookUpAddressDetails[];
  countries?: ICountry[];
};

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;

  const plantAddressBearerToken = await getBearerTokenForRequest(request);
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    plantAddressBearerToken,
    documentNumber
  );

  validateResponseData(processingStatement);

  const session = await getSessionFromRequest(request);
  const updateSession = !session.has("csrf");
  const csrf = await createCSRFToken(request);
  ensureCSRFInSession(session, updateSession, csrf);

  if (updateSession) {
    session.set("csrf", await createCSRFToken(request));
  }

  const currentStep = session.get("currentStep");
  const postcode = session.get("postcode");
  const addressOne = session.get("addressOne");
  const countries: ICountry[] = await getCountries();
  const processingStatementData = processingStatement as ProcessingStatement;

  let responseData;

  if (!isEmpty(postcode)) {
    const response: ILookUpAddress = await postCodeLookUp(postcode);
    const postcodeaddresses: ILookUpAddressDetails[] = Array.isArray(response.data) ? response.data : [];
    const postcodeaddress: ILookUpAddressDetails | undefined = postcodeaddresses.find(
      (address: ILookUpAddressDetails) => address.address_line === addressOne
    );

    responseData = createResponseData(documentNumber!, session, countries, processingStatementData, {
      postcode,
      currentStep,
      postcodeaddress,
      postcodeaddresses,
    });
  } else {
    responseData = createResponseData(documentNumber!, session, countries, processingStatementData);
  }

  return updateSession
    ? json(responseData, session)
    : new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
};

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const plantAddressBearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const session = await getSessionFromRequest(request);
  const buttonClicked = form.get("_action") as ExporterAddressButtonType;
  const plantAddressFormData = {
    plantSubBuildingName: form.get("subBuildingName") as string,
    plantBuildingName: form.get("buildingName") as string,
    plantBuildingNumber: form.get("buildingNumber") as string,
    plantAddressOne: form.get("selectaddress") as string,
    plantStreetName: form.get("streetName") as string,
    plantTownCity: form.get("townCity") as string,
    plantPostcode: form.get("postcode") as string,
    plantCounty: form.get("county") as string,
    plantCountry: form.get("country") as string,
  };

  const isValidToken = await validateCSRFToken(request, form);
  if (!isValidToken) return redirect("/forbidden");

  const csrf = await createCSRFToken(request);
  let plantAddressCurrentStep: ExporterAddressStep = "searchPostCode";

  // Handle findaddress action
  if (buttonClicked === "findaddress") {
    plantAddressCurrentStep = "selectedAddress";
    const updatedSession = await updateSessionAndCommit(
      session,
      { currentStep: plantAddressCurrentStep, postcode: plantAddressFormData.plantPostcode, csrf },
      ["currentStep", "postcode", "addressOne"]
    );

    const { response, postcodeaddresses } = await handlePostcodeLookup(plantAddressFormData.plantPostcode);

    if (hasLookUpAddressError(response)) {
      return apiCallFailed(response.errors);
    }

    return createJsonResponse(
      {
        postcodeaddresses,
        plantAddressCurrentStep,
        postcode: plantAddressFormData.plantPostcode,
        csrf,
      },
      { "Set-Cookie": updatedSession }
    );
  }

  // Handle address selection error
  if (isGetAddress(buttonClicked, plantAddressFormData.plantAddressOne)) {
    plantAddressCurrentStep = "selectedAddress";
    const updatedSession = await updateSessionAndCommit(
      session,
      { currentStep: plantAddressCurrentStep, postcode: plantAddressFormData.plantPostcode, csrf },
      ["currentStep", "postcode", "addressOne"]
    );

    const errors: IErrorsTransformed = {
      addressError: {
        key: "addressError",
        message: "commonLookupAddressPageErrorSelectedAddress",
      },
    };
    const { postcodeaddresses } = await handlePostcodeLookup(plantAddressFormData.plantPostcode);

    return createJsonResponse(
      {
        errors,
        plantAddressCurrentStep,
        postcode: plantAddressFormData.plantPostcode,
        postcodeaddresses,
        csrf,
      },
      { "Set-Cookie": updatedSession }
    );
  }

  // Handle getaddress action
  if (buttonClicked === "getaddress") {
    plantAddressCurrentStep = "manualAddress";
    const updatedSession = await updateSessionAndCommit(
      session,
      {
        currentStep: plantAddressCurrentStep,
        postcode: plantAddressFormData.plantPostcode,
        addressOne: plantAddressFormData.plantPostcode,
        csrf,
      },
      ["currentStep", "postcode", "addressOne"]
    );

    const countries: ICountry[] = await getCountries();
    const { postcodeaddress } = await handlePostcodeLookup(
      plantAddressFormData.plantPostcode,
      plantAddressFormData.plantAddressOne
    );

    return createJsonResponse(
      {
        plantAddressCurrentStep,
        postcode: plantAddressFormData.plantAddressOne,
        postcodeaddress,
        countries,
        csrf,
      },
      { "Set-Cookie": updatedSession }
    );
  }

  // Handle changelink action
  if (buttonClicked === "changelink") {
    const updatedSession = await updateSessionAndCommit(session, {
      currentStep: plantAddressCurrentStep,
      postcode: plantAddressFormData.plantPostcode,
      csrf,
    });

    return createJsonResponse(
      {
        postcode: plantAddressFormData.plantPostcode,
        plantAddressCurrentStep,
      },
      { "Set-Cookie": updatedSession }
    );
  }

  // Handle cancel action
  if (isCancelAddAddress(buttonClicked)) {
    const updatedSession = await updateSessionAndCommit(session, { currentStep: plantAddressCurrentStep, csrf }, [
      "postcode",
    ]);

    return redirect(route("/create-processing-statement/:documentNumber/progress", { documentNumber }), {
      headers: { "Set-Cookie": updatedSession },
    });
  }

  // Handle navigate to manual address
  if (buttonClicked === "navigateToManualAddress") {
    plantAddressCurrentStep = "manualAddress";
    const updatedSession = await updateSessionAndCommit(session, { currentStep: plantAddressCurrentStep, csrf }, [
      "postcode",
    ]);

    const countries: ICountry[] = await getCountries();
    return createJsonResponse(
      {
        plantAddressCurrentStep,
        postcodeaddress: {},
        countries,
      },
      { "Set-Cookie": updatedSession }
    );
  }

  // Handle continue manual address
  if (buttonClicked === "continueManualAddress") {
    return await handleContinueManualAddress(
      session,
      form,
      plantAddressFormData,
      plantAddressBearerToken,
      documentNumber!,
      csrf
    );
  }

  // Handle go to add address
  if (form.get("_action") === "goToAddAddress") {
    const updatedSession = await updateSessionAndCommit(session, {}, ["currentStep", "postcode"]);
    return redirect(
      route("/create-processing-statement/:documentNumber/what-processing-plant-address", { documentNumber }),
      { headers: { "Set-Cookie": updatedSession } }
    );
  }

  // Handle default actions (save as draft, continue)
  return await handleDefaultActions(form, session, plantAddressBearerToken, documentNumber!);
};

const createJsonResponse = (data: any, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

const updateSessionAndCommit = async (
  session: any,
  updates: { currentStep?: ExporterAddressStep; postcode?: string; addressOne?: string; csrf?: string },
  unsetKeys: string[] = []
) => {
  // Unset specified keys
  unsetKeys.forEach((key) => session.unset(key));

  // Set new values
  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      session.set(key, value);
    }
  });

  return await commitSession(session);
};

const handlePostcodeLookup = async (postcode: string, selectedAddress?: string) => {
  const response: ILookUpAddress = await postCodeLookUp(postcode);
  const postcodeaddresses: ILookUpAddressDetails[] = response.data;
  const postcodeaddress: ILookUpAddressDetails | undefined = selectedAddress
    ? postcodeaddresses.find((address: ILookUpAddressDetails) => address.address_line === selectedAddress)
    : undefined;

  return { response, postcodeaddresses, postcodeaddress };
};

const handleContinueManualAddress = async (
  session: any,
  form: FormData,
  plantAddressFormData: any,
  plantAddressBearerToken: string,
  documentNumber: string,
  csrf: string
) => {
  const plantAddressCurrentStep: ExporterAddressStep = "manualAddress";
  session.unset("postcode");
  session.set("currentStep", plantAddressCurrentStep);
  session.set("csrf", csrf);
  const selectedCountry = form.get("country") as string;
  const countries: ICountry[] = await getCountries();
  const countryData: ICountry = getCountryData(countries, selectedCountry);

  const lookUpAddress: ILookUpAddressDetails = {
    building_number: plantAddressFormData.plantBuildingNumber,
    sub_building_name: plantAddressFormData.plantSubBuildingName,
    building_name: plantAddressFormData.plantBuildingName,
    street_name: plantAddressFormData.plantStreetName,
    city: plantAddressFormData.plantTownCity,
  };

  plantAddressFormData["plantAddressOne"] = getAddressOne(lookUpAddress) ?? "";

  const payload: Exporter = {
    addressOne: plantAddressFormData.plantAddressOne,
    buildingName: plantAddressFormData.plantBuildingName,
    buildingNumber: plantAddressFormData.plantBuildingNumber,
    country: plantAddressFormData.plantCountry,
    county: plantAddressFormData.plantCounty,
    streetName: plantAddressFormData.plantStreetName,
    subBuildingName: plantAddressFormData.plantSubBuildingName,
    townCity: plantAddressFormData.plantTownCity,
    postcode: plantAddressFormData.plantPostcode,
  };

  const manualAddress: IExporter = await addManualExporterAddress(
    plantAddressBearerToken,
    documentNumber,
    payload,
    countryData
  );
  const errors: IError[] = manualAddress.errors as IError[];
  const unauthorised = manualAddress.unauthorised as boolean;

  if (unauthorised) {
    session.unset("currentStep");
    session.unset("postcode");
    session.unset("csrf");

    return redirect("/forbidden", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  const errorResponse = await handleManualAddressErrors(errors, plantAddressCurrentStep, lookUpAddress, csrf, session);
  if (errorResponse) return errorResponse;

  await updateProcessingStatement(
    plantAddressBearerToken,
    documentNumber,
    {
      ...plantAddressFormData,
    },
    route("/create-processing-statement/:documentNumber/what-processing-plant-address", { documentNumber }),
    undefined,
    false
  );

  session.unset("currentStep");
  const updatedSession = await commitSession(session);

  return redirect(
    route("/create-processing-statement/:documentNumber/add-processing-plant-address", {
      documentNumber,
    }),
    {
      headers: { "Set-Cookie": updatedSession },
    }
  );
};

const handleDefaultActions = async (
  form: FormData,
  session: any,
  plantAddressBearerToken: string,
  documentNumber: string
) => {
  const nextUri = form.get("nextUri") as string;
  const isDraft = form.get("_action") === "saveAsDraft";
  const saveToRedisIfErrors = false;

  const errorResponse = await updateProcessingStatement(
    plantAddressBearerToken,
    documentNumber,
    {},
    route("/create-processing-statement/:documentNumber/add-processing-plant-address", { documentNumber }),
    undefined,
    saveToRedisIfErrors
  );

  if (isDraft) {
    return redirect(route("/create-processing-statement/processing-statements"), {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  if (errorResponse) {
    return errorResponse;
  }

  return redirect(
    isEmpty(nextUri)
      ? route("/create-processing-statement/:documentNumber/add-health-certificate", { documentNumber })
      : nextUri,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

const AddProcessingPlantAddress = () => {
  const { t } = useTranslation(["addProcessingPlantAddress", "common"]);
  const { documentNumber, plantAddressOne, plantTownCity, plantPostcode, nextUri, csrf } =
    useLoaderData<loaderPlantAddress>();
  const actionData = useActionData<{ errors: any }>() ?? {};

  const { errors = {} } = actionData;
  const hasAddress = !isEmpty(plantAddressOne) && !isEmpty(plantPostcode);

  return hasAddress ? (
    <Main
      backUrl={route("/create-processing-statement/:documentNumber/add-processing-plant-details", {
        documentNumber,
      })}
    >
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <div className="govuk-grid-column-full">
              <Title title={`${t("psAddProcessingPlantAddressDetailsAddressText")}`} />
              <p>
                {plantAddressOne}
                <br />
                {plantTownCity}
                <br />
                {plantPostcode}
              </p>
            </div>
            <br />
            <div className="govuk-button-group">
              <Button
                id="goToAddAddress"
                label={t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                className="govuk-button govuk-button--secondary"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                //@ts-ignore
                value="goToAddAddress"
                data-testid="goToAddAddress-button"
              />
            </div>
            <br />
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-processing-statement/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  ) : (
    <WhatExportersAddress
      journey="processingStatement"
      title={t("psProcessingPlantAddressWhatIsProcessingPlantAddress", { ns: "addProcessingPlantAddress" })}
    />
  );
};

export default AddProcessingPlantAddress;
