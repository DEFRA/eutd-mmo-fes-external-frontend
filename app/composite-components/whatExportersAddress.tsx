import type { Journey, ExporterAddressStep, IErrorsTransformed, IActionData, ExporterAddressProps } from "~/types";
import { scrollToId, displayErrorTransformedMessages } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { useLoaderData, useActionData } from "@remix-run/react";
import { useEffect } from "react";
import { Main, Title, BackToProgressLink, ErrorSummary } from "~/components";
import { AddAddressForm } from "./addAddressForm";
import { SelectAddress } from "./selectAddress";
import { ExporterPostcodeLookUp } from "./exporterPostcodeLookUp";

type WhatExportersAddressProps = {
  journey: Journey;
  title: string;
};

export const WhatExportersAddress = ({ title, journey }: WhatExportersAddressProps) => {
  const {
    documentNumber,
    countries,
    currentStep: loaderStep,
    postcode: loaderPostcode,
    csrf,
    postcodeaddresses: loaderPostcodeaddresses,
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
            journey={journey}
            csrf={actionCsrf ?? csrf}
          />
        );
      case "selectedAddress":
        return (
          <SelectAddress
            postcode={postcode}
            errors={errors}
            postcodeaddresses={postcodeaddresses}
            csrf={actionCsrf ?? csrf}
          />
        );
      default:
        return <ExporterPostcodeLookUp postcode={postcode} errors={errors} csrf={actionCsrf ?? csrf} />;
    }
  };

  const progressRoutes = {
    catchCertificate: "/create-catch-certificate/:documentNumber/progress",
    processingStatement: "/create-processing-statement/:documentNumber/progress",
    storageNotes: "/create-storage-document/:documentNumber/progress",
  };

  return (
    <Main>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errorsTransformed)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title className="govuk-!-margin-bottom-6" title={title} />
        </div>
      </div>
      {renderStepComponent()}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <BackToProgressLink progressUri={progressRoutes[journey]} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
