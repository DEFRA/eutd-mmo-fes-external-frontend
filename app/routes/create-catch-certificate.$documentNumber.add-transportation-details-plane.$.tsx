import * as React from "react";
import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ButtonGroup, CatchCertificateTransportationDetails } from "~/composite-components";
import {
  useActionData,
  useLoaderData,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from "react-router";
import { useTranslation } from "react-i18next";
import type { ErrorResponse, IErrorsTransformed, ITransport } from "~/types";
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDetailsAction } from "~/.server";
import { displayErrorMessagesInOrder, getMeta, TransportType, getContainerNumbers } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useTransportationDetailsPage, getTransportErrorKeys, useErrorsOverride } from "~/hooks";

export const meta: MetaFunction = (args) => getMeta(args);
export const loader: LoaderFunction = async ({ request, params }) =>
  await CatchCertificateTransportationDetailsLoader(request, params, TransportType.PLANE);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await CatchCertificateTransportationDetailsAction(request, params, TransportType.PLANE);

const AddTransportationDetailsPlane = () => {
  const { t } = useTranslation(["common", "transportation"]);
  const {
    documentNumber,
    vehicle,
    flightNumber,
    airwayBillNumber,
    containerNumbers,
    departurePlace,
    freightBillNumber,
    nextUri,
    csrf,
    id,
    displayOptionalSuffix,
    maximumNumberOfContainerNumbers,
  } = useLoaderData<
    ITransport & {
      documentNumber: string;
      nextUri: string;
      displayOptionalSuffix: boolean;
      csrf: string;
      maximumNumberOfContainerNumbers: number;
    }
  >();
  const actionData = useActionData() ?? {};
  const { errors, setErrorsOverride } = useErrorsOverride((actionData as { errors?: IErrorsTransformed })?.errors);
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-plane/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  const errorKeysInOrder = getTransportErrorKeys(TransportType.PLANE, maximumNumberOfContainerNumbers);
  useTransportationDetailsPage(errors);
  const errorMessagesForDisplay = displayErrorMessagesInOrder(errors, errorKeysInOrder);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={errorMessagesForDisplay} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <CatchCertificateTransportationDetails
              legendTitle={`${t("addTransportationDetailsTransportDetailsTitle", { ns: "transportation" })} ${t(
                "addTransportationDetailsPlane",
                { ns: "transportation" }
              )}`}
              vehicle="plane"
              errors={errors}
              flightNumber={!isEmpty(errors) ? actionData.flightNumber : flightNumber}
              airwayBillNumber={!isEmpty(errors) ? actionData.airwayBillNumber : airwayBillNumber}
              containerNumbers={getContainerNumbers(errors, actionData, containerNumbers)}
              departurePlace={!isEmpty(errors) ? actionData.departurePlace : departurePlace}
              freightBillNumber={!isEmpty(errors) ? actionData.freightBillNumber : freightBillNumber}
              displayOptionalSuffix={displayOptionalSuffix}
              maximumNumberOfContainerNumbers={maximumNumberOfContainerNumbers}
              onErrorsChange={setErrorsOverride}
            />
            <ButtonGroup />
            <input type="hidden" name="vehicle" value={vehicle} />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-catch-certificate/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};
export default AddTransportationDetailsPlane;
