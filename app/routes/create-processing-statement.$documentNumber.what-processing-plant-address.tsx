import * as React from "react";
import { WhatExportersAddress } from "~/composite-components";
import { type ActionFunction, type LoaderFunction, redirect } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { apiCallFailed, json } from "~/communication.server";
import { getAddressOne } from "~/helpers";
import {
  getBearerTokenForRequest,
  getCountries,
  postCodeLookUp,
  getProcessingStatement,
  validateResponseData,
  updateProcessingStatement,
  addManualExporterAddress,
  hasLookUpAddressError,
  isGetAddress,
  isCancelAddAddress,
  createCSRFToken,
  validateCSRFToken,
  handleManualAddressErrors,
} from "~/.server";
import isEmpty from "lodash/isEmpty";
import type {
  ExporterAddressStep,
  ExporterAddressButtonType,
  ILookUpAddress,
  ILookUpAddressDetails,
  IErrorsTransformed,
  ICountry,
  ProcessingStatement,
  IUnauthorised,
  IError,
  Exporter,
  IExporter,
} from "~/types";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import setApiMock from "tests/msw/helpers/setApiMock";

const getCountryData = (countries: ICountry[], selectedCountry: string) =>
  countries.find(
    (c: ICountry) =>
      !isEmpty(c.officialCountryName) &&
      !isEmpty(selectedCountry) &&
      c.officialCountryName.toLowerCase() === selectedCountry.toLowerCase()
  ) ?? { officialCountryName: "" };

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;

  const bearerToken = await getBearerTokenForRequest(request);
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  validateResponseData(processingStatement);

  const session = await getSessionFromRequest(request);
  const shouldUpdateSession = !session.has("csrf");

  if (shouldUpdateSession) {
    session.set("csrf", createCSRFToken());
  }

  const currentStep = session.get("currentStep");
  const postcode = session.get("postcode");
  const addressOne = session.get("addressOne");

  const countries: ICountry[] = await getCountries();

  if (!isEmpty(postcode)) {
    const response: ILookUpAddress = await postCodeLookUp(postcode);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;
    const postcodeaddress: ILookUpAddressDetails | undefined = postcodeaddresses.find(
      (address: ILookUpAddressDetails) => address.address_line === addressOne
    );

    if (shouldUpdateSession) {
      return json(
        {
          documentNumber,
          currentStep,
          postcode,
          postcodeaddress,
          postcodeaddresses,
          countries,
          csrf: session.get("csrf"),
        },
        session
      );
    }

    return new Response(
      JSON.stringify({
        documentNumber,
        currentStep,
        postcode,
        postcodeaddress,
        postcodeaddresses,
        countries,
        csrf: session.get("csrf"),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  if (shouldUpdateSession) {
    return json(
      {
        documentNumber,
        currentStep,
        countries,
        csrf: session.get("csrf"),
      },
      session
    );
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      currentStep,
      countries,
      csrf: session.get("csrf"),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const action: ActionFunction = async ({ request, params }) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const { documentNumber } = params;
  const buttonClicked = form.get("_action") as ExporterAddressButtonType;
  const session = await getSessionFromRequest(request);
  const formData = {
    plantName: session.get("plantName"),
    plantAddressOne: form.get("selectaddress") as string,
    plantBuildingNumber: form.get("buildingNumber") as string,
    plantSubBuildingName: form.get("subBuildingName") as string,
    plantBuildingName: form.get("buildingName") as string,
    plantStreetName: form.get("streetName") as string,
    plantCounty: form.get("county") as string,
    plantCountry: form.get("country") as string,
    plantTownCity: form.get("townCity") as string,
    plantPostcode: form.get("postcode") as string,
  };

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");

  const csrf = createCSRFToken();
  let currentStep: ExporterAddressStep = "searchPostCode";

  if (buttonClicked === "findaddress") {
    currentStep = "selectedAddress";

    session.set("currentStep", currentStep);
    session.set("postcode", formData.plantPostcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    const response: ILookUpAddress = await postCodeLookUp(formData.plantPostcode);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;

    if (hasLookUpAddressError(response)) {
      return apiCallFailed(response.errors);
    }

    return new Response(JSON.stringify({ postcodeaddresses, currentStep, postcode: formData.plantPostcode, csrf }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": updatedSession,
      },
    });
  }

  if (isGetAddress(buttonClicked, formData.plantAddressOne)) {
    currentStep = "selectedAddress";
    session.set("currentStep", currentStep);
    session.set("postcode", formData.plantPostcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    const errors: IErrorsTransformed = {
      addressError: {
        key: "addressError",
        message: "commonLookupAddressPageErrorSelectedAddress",
      },
    };
    const response: ILookUpAddress = await postCodeLookUp(formData.plantPostcode);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;

    return new Response(
      JSON.stringify({ errors, currentStep, postcode: formData.plantPostcode, postcodeaddresses, csrf }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": updatedSession,
        },
      }
    );
  } else if (buttonClicked === "getaddress") {
    currentStep = "manualAddress";

    session.set("currentStep", currentStep);
    session.set("postcode", formData.plantPostcode);
    session.set("addressOne", formData.plantPostcode);
    session.set("csrf", csrf);

    const updatedSession = await commitSession(session);
    const countries: ICountry[] = await getCountries();
    const response: ILookUpAddress = await postCodeLookUp(formData.plantPostcode);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;
    const postcodeaddress: ILookUpAddressDetails | undefined = postcodeaddresses.find(
      (address: ILookUpAddressDetails) => address.address_line === formData.plantAddressOne
    );

    return new Response(
      JSON.stringify({ currentStep, postcode: formData.plantAddressOne, postcodeaddress, countries, csrf }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": updatedSession,
        },
      }
    );
  }

  if (buttonClicked === "changelink") {
    session.set("currentStep", currentStep);
    session.set("postcode", formData.plantPostcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    return new Response(JSON.stringify({ postcode: formData.plantPostcode, currentStep }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": updatedSession,
      },
    });
  }

  if (isCancelAddAddress(buttonClicked)) {
    session.set("currentStep", currentStep);
    session.set("csrf", csrf);
    session.unset("postcode");
    const updatedSession = await commitSession(session);

    return redirect(
      route("/create-processing-statement/:documentNumber/add-processing-plant-address", {
        documentNumber,
      }),
      {
        headers: { "Set-Cookie": updatedSession },
      }
    );
  }

  if (buttonClicked === "navigateToManualAddress") {
    currentStep = "manualAddress";
    session.set("currentStep", currentStep);
    session.set("csrf", csrf);
    session.unset("postcode");
    const updatedSession = await commitSession(session);
    const countries: ICountry[] = await getCountries();
    return new Response(JSON.stringify({ currentStep, postcodeaddress: {}, countries }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": updatedSession,
      },
    });
  }

  if (buttonClicked === "continueManualAddress") {
    currentStep = "manualAddress";
    session.unset("postcode");
    session.set("currentStep", currentStep);
    session.set("csrf", csrf);
    const selectedCountry = form.get("country") as string;
    const countries: ICountry[] = await getCountries();
    const countryData: ICountry = getCountryData(countries, selectedCountry);

    const lookUpAddress: ILookUpAddressDetails = {
      building_number: formData.plantBuildingNumber,
      sub_building_name: formData.plantSubBuildingName,
      building_name: formData.plantBuildingName,
      street_name: formData.plantStreetName,
      city: formData.plantTownCity,
    };

    formData["plantAddressOne"] = getAddressOne(lookUpAddress) ?? "";

    const payload: Exporter = {
      addressOne: formData.plantAddressOne,
      buildingName: formData.plantBuildingName,
      buildingNumber: formData.plantBuildingNumber,
      country: formData.plantCountry,
      county: formData.plantCounty,
      streetName: formData.plantStreetName,
      subBuildingName: formData.plantSubBuildingName,
      townCity: formData.plantTownCity,
      postcode: formData.plantPostcode,
    };

    const manualAddress: IExporter = await addManualExporterAddress(bearerToken, documentNumber, payload, countryData);
    const errors: IError[] = manualAddress.errors as IError[];
    const unauthorised = manualAddress.unauthorised as boolean;

    if (unauthorised) {
      session.unset("currentStep");
      session.unset("postcode");
      session.unset("plantName");
      session.unset("csrf");

      return redirect("/forbidden", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }

    const errorResponse = await handleManualAddressErrors(errors, currentStep, lookUpAddress, csrf, session);
    if (errorResponse) return errorResponse;

    await updateProcessingStatement(
      bearerToken,
      documentNumber,
      {
        ...formData,
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
  }
};

const LookupAddressPage = () => {
  const { t } = useTranslation(["addProcessingPlantAddress", "common"]);

  return (
    <WhatExportersAddress
      journey="processingStatement"
      title={t("psProcessingPlantAddressWhatIsProcessingPlantAddress", { ns: "addProcessingPlantAddress" })}
    />
  );
};

export default LookupAddressPage;
