import * as React from "react";
import { type ActionFunction, redirect, type LoaderFunction } from "@remix-run/node";
import { type Params, useActionData, useLoaderData } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import setApiMock from "tests/msw/helpers/setApiMock";
import { BackToProgressLink, ErrorSummary, Main, Title } from "~/components";
import { AddAddressForm, ExporterPostcodeLookUp, SelectAddress } from "~/composite-components";
import { apiCallFailed, json } from "~/communication.server";
import { displayErrorTransformedMessages, getStorageFacilityAddressOne, scrollToId } from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";
import {
  addManualExporterAddress,
  createCSRFToken,
  getBearerTokenForRequest,
  getCountries,
  handleManualAddressErrors,
  hasLookUpAddressError,
  isCancelAddAddress,
  isGetAddress,
  postCodeLookUp,
  updateStorageDocumentFacility,
  validateCSRFToken,
} from "~/.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import type {
  Exporter,
  ExporterAddressButtonType,
  ExporterAddressProps,
  ExporterAddressStep,
  IActionData,
  ICountry,
  IError,
  IErrorsTransformed,
  IExporter,
  ILookUpAddress,
  ILookUpAddressDetails,
  StorageFacility,
} from "~/types";

function getFacilityIndex(params: Params): number {
  return parseInt(params["*"] ?? "") || 0;
}

function getFacilityUrlFragment(facilityIndex: number): string {
  return facilityIndex >= 0 ? `/${facilityIndex}` : "";
}

function matchesSelectedCountry(c: ICountry, selectedCountry: string): boolean {
  return (
    !isEmpty(c.officialCountryName) &&
    !isEmpty(selectedCountry) &&
    c.officialCountryName.toLowerCase() === selectedCountry.toLowerCase()
  );
}

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const facilityIndex = parseInt(params["*"] ?? "") || 0;
  const session = await getSessionFromRequest(request);
  const shouldUpdateSession = !session.has("csrf");

  if (shouldUpdateSession) {
    session.set("csrf", createCSRFToken());
  }

  const currentStep = session.get("currentStep");
  const postcode = session.get("postcode");
  const addressOne = session.get("addressOne");

  const countries: ICountry[] = await getCountries();
  const actionUri = `/create-storage-document/${documentNumber}/what-storage-facility-address/${facilityIndex}`;
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
          actionUri,
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
        actionUri,
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
        csrf: session.get("csrf"),
        currentStep,
        countries,
        actionUri,
      },
      session
    );
  }

  return new Response(
    JSON.stringify({
      documentNumber,
      csrf: session.get("csrf"),
      currentStep,
      countries,
      actionUri,
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
  const facilityIndex = getFacilityIndex(params);
  const facilityIndexUrlFragment = getFacilityUrlFragment(facilityIndex);

  const buttonClicked = form.get("_action") as ExporterAddressButtonType;
  const session = await getSessionFromRequest(request);
  const formData: StorageFacility = {
    facilityName: session.get("facilityName"),
    facilityAddressOne: form.get("selectaddress") as string,
    facilityBuildingNumber: form.get("buildingNumber") as string,
    facilitySubBuildingName: form.get("subBuildingName") as string,
    facilityBuildingName: form.get("buildingName") as string,
    facilityStreetName: form.get("streetName") as string,
    facilityCounty: form.get("county") as string,
    facilityCountry: form.get("country") as string,
    facilityTownCity: form.get("townCity") as string,
    facilityPostcode: form.get("postcode") as string,
    facilityArrivalDate: session.get("selectedArrivalDate") as string,
  };

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");
  session.unset("csrf");

  const csrf = createCSRFToken();
  let currentStep: ExporterAddressStep = "searchPostCode";

  if (buttonClicked === "findaddress") {
    currentStep = "selectedAddress";

    session.set("currentStep", currentStep);
    session.set("postcode", formData.facilityPostcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    const response: ILookUpAddress = await postCodeLookUp(formData.facilityPostcode);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;

    if (hasLookUpAddressError(response)) {
      return apiCallFailed(response.errors);
    }

    return new Response(JSON.stringify({ postcodeaddresses, currentStep, postcode: formData.facilityPostcode, csrf }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": updatedSession,
      },
    });
  }

  if (isGetAddress(buttonClicked, formData.facilityAddressOne)) {
    currentStep = "selectedAddress";
    session.set("currentStep", currentStep);
    session.set("postcode", formData.facilityPostcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    const errors: IErrorsTransformed = {
      addressError: {
        key: "addressError",
        message: "commonLookupAddressPageErrorSelectedAddress",
      },
    };
    const response: ILookUpAddress = await postCodeLookUp(formData.facilityPostcode);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;

    return new Response(
      JSON.stringify({ errors, currentStep, postcode: formData.facilityPostcode, postcodeaddresses, csrf }),
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
    session.set("postcode", formData.facilityPostcode);
    session.set("addressOne", formData.facilityAddressOne);
    session.set("csrf", csrf);

    const updatedSession = await commitSession(session);
    const countries: ICountry[] = await getCountries();
    const response: ILookUpAddress = await postCodeLookUp(formData.facilityPostcode);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;
    const postcodeaddress: ILookUpAddressDetails | undefined = postcodeaddresses.find(
      (address: ILookUpAddressDetails) => address.address_line === formData.facilityAddressOne
    );

    return new Response(
      JSON.stringify({ currentStep, postcode: formData.facilityPostcode, postcodeaddress, countries, csrf }),
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
    session.set("postcode", formData.facilityPostcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    return new Response(JSON.stringify({ postcode: formData.facilityPostcode, currentStep, csrf }), {
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
      `/create-storage-document/${documentNumber}/add-storage-facility-details${facilityIndexUrlFragment}`,
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

    return new Response(JSON.stringify({ currentStep, postcodeaddress: {}, countries, csrf }), {
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
    const countryData: ICountry = countries.find((c: ICountry) => matchesSelectedCountry(c, selectedCountry)) ?? {
      officialCountryName: "",
    };

    const lookUpAddress: ILookUpAddressDetails = {
      building_number: formData.facilityBuildingNumber,
      sub_building_name: formData.facilitySubBuildingName,
      building_name: formData.facilityBuildingName,
      street_name: formData.facilityStreetName,
      county: formData.facilityCounty,
      country: formData.facilityCountry,
      city: formData.facilityTownCity,
      postCode: formData.facilityPostcode,
    };

    formData["facilityAddressOne"] = getStorageFacilityAddressOne(lookUpAddress);

    const payload: Exporter = {
      addressOne: formData.facilityAddressOne,
      subBuildingName: formData.facilitySubBuildingName,
      buildingNumber: formData.facilityBuildingNumber,
      buildingName: formData.facilityBuildingName,
      streetName: formData.facilityStreetName,
      townCity: formData.facilityTownCity,
      county: formData.facilityCounty,
      postcode: formData.facilityPostcode,
      country: formData.facilityCountry,
    };

    const manualAddress: IExporter = await addManualExporterAddress(bearerToken, documentNumber, payload, countryData);
    const errors: IError[] = manualAddress.errors as IError[];
    const unauthorised = manualAddress.unauthorised as boolean;

    if (unauthorised) {
      session.unset("currentStep");
      session.unset("postcode");
      session.unset("facilityName");
      session.unset("csrf");

      return redirect("/forbidden", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }

    const errorResponse = await handleManualAddressErrors(errors, currentStep, lookUpAddress, csrf, session);
    if (errorResponse) return errorResponse;

    await updateStorageDocumentFacility(
      bearerToken,
      documentNumber,
      {
        ...formData,
      },
      `/create-storage-document/${documentNumber}/what-storage-facility-address${facilityIndexUrlFragment}`,
      facilityIndex,
      false
    );

    session.unset("currentStep");
    const updatedSession = await commitSession(session);

    return redirect(
      `/create-storage-document/${documentNumber}/add-storage-facility-details${facilityIndexUrlFragment}`,
      {
        headers: { "Set-Cookie": updatedSession },
      }
    );
  }
};

const WhatFacilityAddress = () => {
  const { t } = useTranslation(["addStorageFacilityDetails", "common"]);
  const {
    documentNumber,
    countries,
    currentStep: loaderStep,
    postcode: loaderPostcode,
    postcodeaddresses: loaderPostcodeaddresses,
    csrf,
    actionUri,
  } = useLoaderData<ExporterAddressProps>();

  const {
    errors,
    postcode: actionPostcode,
    currentStep: actionStep,
    postcodeaddresses: actionPostcodeaddress,
    postcodeaddress,
    csrf: actionCsrf,
  } = useActionData<IActionData>() ?? {
    currentStep: "",
    errors: {},
    postcode: "",
    postcodeaddresses: [],
  };
  const errorsTransformed = errors as IErrorsTransformed;

  const currentStep: ExporterAddressStep = actionStep || loaderStep;
  const postcode = actionPostcode || loaderPostcode;
  const postcodeaddresses = loaderPostcode ? loaderPostcodeaddresses : actionPostcodeaddress;

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useScrollOnPageLoad();

  const renderStepComponent = () => {
    switch (currentStep) {
      case "manualAddress":
        return (
          <AddAddressForm
            postcodeaddress={postcodeaddress}
            errors={errors}
            countries={countries}
            actionUri={actionUri}
            csrf={actionCsrf ?? csrf}
          />
        );
      case "selectedAddress":
        return (
          <SelectAddress
            postcode={postcode}
            errors={errors}
            postcodeaddresses={postcodeaddresses}
            actionUri={actionUri}
            csrf={actionCsrf ?? csrf}
          />
        );
      default:
        return (
          <ExporterPostcodeLookUp postcode={postcode} errors={errors} actionUri={actionUri} csrf={actionCsrf ?? csrf} />
        );
    }
  };

  return (
    <Main>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errorsTransformed)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title className="govuk-!-margin-bottom-6" title={t("sdWhatStorageFacilityText")} />
        </div>
      </div>
      {renderStepComponent()}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <BackToProgressLink
            progressUri="/create-storage-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default WhatFacilityAddress;
