import { type Params } from "@remix-run/router";
import type {
  Journey,
  ILookUpAddress,
  ILookUpAddressDetails,
  ICountry,
  IExporter,
  ExporterAddressButtonType,
  Exporter,
  ExporterAddressStep,
  IErrorsTransformed,
  IError,
} from "~/types";
import setApiMock from "tests/msw/helpers/setApiMock";
import { redirect } from "@remix-run/node";
import { route } from "routes-gen";
import {
  getBearerTokenForRequest,
  getCountries,
  postCodeLookUp,
  addManualExporterAddress,
  getUserDetails,
  getAddresses,
  getAccounts,
  isAdminUser,
  getExporterDetailsFromMongo,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";
import { getAddressOne, getTransformedError } from "~/helpers";
import { apiCallFailed } from "~/communication.server";
import isEmpty from "lodash/isEmpty";
import { getSessionFromRequest, commitSession } from "~/sessions.server";

export const exportersAddressLoader = async (request: Request, params: Params, journey: Journey) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;

  const bearerToken = await getBearerTokenForRequest(request);
  const exporter: IExporter = await getExporterDetailsFromMongo(bearerToken, documentNumber, journey);
  const unauthorised: boolean = exporter.unauthorised ?? false;
  if (unauthorised) {
    return redirect("/forbidden");
  }

  const session = await getSessionFromRequest(request);
  const shouldUpdateSession = !session.has("csrf");

  if (shouldUpdateSession) {
    session.set("csrf", await createCSRFToken(request));
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
            "Set-Cookie": await commitSession(session),
          },
        }
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
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  if (shouldUpdateSession) {
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
          "Set-Cookie": await commitSession(session),
        },
      }
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

export const exportersAddressAction = async (request: Request, params: Params, journey: Journey) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();
  const { documentNumber } = params;
  const buttonClicked = form.get("_action") as ExporterAddressButtonType;
  const session = await getSessionFromRequest(request);
  const formData: Exporter = {
    exporterCompanyName: session.get("exporterCompanyName"),
    addressOne: form.get("selectaddress") as string,
    postcode: form.get("postcode") as string,
    subBuildingName: form.get("subBuildingName") as string,
    buildingName: form.get("buildingName") as string,
    buildingNumber: form.get("buildingNumber") as string,
    country: form.get("country") as string,
    county: form.get("county") as string,
    streetName: form.get("streetName") as string,
    townCity: form.get("townCity") as string,
  };

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  if (journey === "catchCertificate") {
    formData["exporterFullName"] = session.get("exporterFullName");
  }

  session.unset("currentStep");
  session.unset("postcode");
  session.unset("addressOne");
  session.unset("csrf");

  const csrf = await createCSRFToken(request);
  let currentStep: ExporterAddressStep = "searchPostCode";
  let updatedSession;
  if (buttonClicked === "findaddress") {
    currentStep = "selectedAddress";

    session.set("currentStep", currentStep);
    session.set("postcode", formData.postcode);
    session.set("csrf", csrf);
    updatedSession = await commitSession(session);

    const response: ILookUpAddress = await postCodeLookUp(formData.postcode as string);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;

    const errors = response.errors || [];
    if (Array.isArray(errors) && errors.length > 0) {
      return apiCallFailed(errors, { postcode: formData.postcode });
    }

    return new Response(
      JSON.stringify({ postcodeaddresses, currentStep, postcode: formData.postcode as string, csrf }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": updatedSession,
        },
      }
    );
  }

  if (buttonClicked === "getaddress" && formData.addressOne === "") {
    currentStep = "selectedAddress";
    session.set("currentStep", currentStep);
    session.set("postcode", formData.postcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    const errors: IErrorsTransformed = {
      addressError: {
        key: "addressError",
        message: "commonLookupAddressPageErrorSelectedAddress",
      },
    };
    const response: ILookUpAddress = await postCodeLookUp(formData.postcode as string);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;

    return new Response(
      JSON.stringify({ errors, currentStep, postcode: formData.postcode as string, postcodeaddresses, csrf }),
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
    session.set("postcode", formData.postcode);
    session.set("addressOne", formData.addressOne);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);
    const countries: ICountry[] = await getCountries();
    const response: ILookUpAddress = await postCodeLookUp(formData.postcode as string);
    const postcodeaddresses: ILookUpAddressDetails[] = response.data;
    const postcodeaddress: ILookUpAddressDetails | undefined = postcodeaddresses.find(
      (address: ILookUpAddressDetails) => address.address_line === formData.addressOne
    );

    return new Response(
      JSON.stringify({ currentStep, postcode: formData.postcode as string, postcodeaddress, countries, csrf }),
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
    currentStep = "searchPostCode";
    session.set("currentStep", currentStep);
    session.set("postcode", formData.postcode);
    session.set("csrf", csrf);
    const updatedSession = await commitSession(session);

    return new Response(JSON.stringify({ postcode: formData.postcode as string, currentStep, csrf }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": updatedSession,
      },
    });
  }

  const routes = {
    catchCertificate: route("/create-catch-certificate/:documentNumber/add-exporter-details", {
      documentNumber,
    }),
    storageNotes: route("/create-storage-document/:documentNumber/add-exporter-details", {
      documentNumber,
    }),
    processingStatement: route("/create-processing-statement/:documentNumber/add-exporter-details", {
      documentNumber,
    }),
  };

  if (buttonClicked === "cancel" || buttonClicked === "cancelManualAddress") {
    currentStep = "searchPostCode";
    session.set("currentStep", currentStep);
    session.set("csrf", csrf);
    session.unset("postcode");
    const updatedSession = await commitSession(session);

    return redirect(routes[journey], {
      headers: { "Set-Cookie": updatedSession },
    });
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
    const countryData: ICountry = countries.find(
      (c: ICountry) =>
        !isEmpty(c.officialCountryName) &&
        !isEmpty(selectedCountry) &&
        c.officialCountryName.toLowerCase() === selectedCountry.toLowerCase()
    ) ?? { officialCountryName: "" };

    const lookUpAddress: ILookUpAddressDetails = {
      building_number: formData.buildingNumber ?? "",
      sub_building_name: formData.subBuildingName ?? "",
      building_name: formData.buildingName ?? "",
      street_name: formData.streetName ?? "",
      county: formData.county ?? "",
      country: formData.country ?? "",
      city: formData.townCity ?? "",
      postCode: formData.postcode ?? "",
    };

    formData["addressOne"] = getAddressOne(lookUpAddress);

    const isAdminSupport = isAdminUser(bearerToken);
    const userDetails: IExporter = !isAdminSupport ? await getUserDetails(bearerToken) : { error: "", errors: [] };
    const addresses: IExporter = !isAdminSupport ? await getAddresses(bearerToken) : { error: "", errors: [] };
    const accounts: IExporter = !isAdminSupport ? getAccounts(bearerToken) : { error: "", errors: [] };
    const payload: Exporter = {
      ...userDetails.model,
      ...addresses.model,
      ...accounts.model,
      ...formData,
    };

    const manualAddress: IExporter = await addManualExporterAddress(
      bearerToken,
      documentNumber,
      payload,
      countryData,
      journey
    );
    const errors: IError[] = manualAddress.errors as IError[];
    const unauthorised = manualAddress.unauthorised as boolean;

    if (unauthorised) {
      session.unset("currentStep");
      session.unset("postcode");
      session.unset("csrf");
      const updatedSession = await commitSession(session);

      return redirect("/forbidden", {
        headers: { "Set-Cookie": updatedSession },
      });
    }

    if (Array.isArray(errors) && errors.length > 0) {
      const updatedSession = await commitSession(session);

      return new Response(
        JSON.stringify({
          errors: getTransformedError(errors),
          currentStep,
          postcodeaddress: lookUpAddress,
          csrf,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": updatedSession,
          },
        }
      );
    }

    session.unset("currentStep");
    const updatedSession = await commitSession(session);

    return redirect(routes[journey], {
      headers: { "Set-Cookie": updatedSession },
    });
  }
};
