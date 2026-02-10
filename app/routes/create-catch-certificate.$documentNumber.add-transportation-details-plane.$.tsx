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
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ErrorResponse, IErrorsTransformed, ITransport } from "~/types";
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDetailsAction } from "~/.server";
import { displayErrorMessagesInOrder, getMeta, scrollToId, TransportType, getContainerNumbers } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";

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
  } = useLoaderData<
    ITransport & {
      documentNumber: string;
      nextUri: string;
      displayOptionalSuffix: boolean;
      csrf: string;
    }
  >();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const errorsTransformed = errors as IErrorsTransformed;
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-plane/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  const errorKeysInOrder = [
    "flightNumber",
    "departurePlace",
    "containerNumbers.0",
    "containerNumbers.1",
    "containerNumbers.2",
    "containerNumbers.3",
    "containerNumbers.4",
    "containerNumbers.5",
    "containerNumbers.6",
    "containerNumbers.7",
    "containerNumbers.8",
    "containerNumbers.9",
    "airwayBillNumber",
    "freightBillNumber",
  ];
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
              errors={errorsTransformed}
              flightNumber={!isEmpty(errors) ? actionData.flightNumber : flightNumber}
              airwayBillNumber={!isEmpty(errors) ? actionData.airwayBillNumber : airwayBillNumber}
              containerNumbers={getContainerNumbers(errors, actionData, containerNumbers)}
              departurePlace={!isEmpty(errors) ? actionData.departurePlace : departurePlace}
              freightBillNumber={!isEmpty(errors) ? actionData.freightBillNumber : freightBillNumber}
              displayOptionalSuffix={displayOptionalSuffix}
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
