import * as React from "react";
import isEmpty from "lodash/isEmpty";
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
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDetailsAction } from "~/.server";
import type { ErrorResponse, ITransport } from "~/types";
import { displayErrorMessagesInOrder, getMeta, scrollToId, TransportType, getContainerNumbers } from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";

export const meta: MetaFunction = (args) => getMeta(args);
export const loader: LoaderFunction = async ({ request, params }) =>
  await CatchCertificateTransportationDetailsLoader(request, params, TransportType.CONTAINER_VESSEL);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await CatchCertificateTransportationDetailsAction(request, params, TransportType.CONTAINER_VESSEL);

const ContainerVesselTransportDetailsPage = () => {
  const { t } = useTranslation(["common", "transportation"]);
  const {
    documentNumber,
    vehicle,
    vesselName,
    flagState,
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
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-container-vessel/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  const errorKeysInOrder = [
    "vesselName",
    "flagState",
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
    "freightBillNumber",
  ];

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <CatchCertificateTransportationDetails
              legendTitle={`${t("addTransportationDetailsTransportDetailsTitle", { ns: "transportation" })} 
                ${t("addTransportationDetailsContainerVessel", { ns: "transportation" })}`}
              vehicle={vehicle}
              vesselName={!isEmpty(errors) ? actionData.vesselName : vesselName}
              flagState={!isEmpty(errors) ? actionData.flagState : flagState}
              containerNumbers={getContainerNumbers(errors, actionData, containerNumbers)}
              departurePlace={!isEmpty(errors) ? actionData.departurePlace : departurePlace}
              freightBillNumber={!isEmpty(errors) ? actionData.freightBillNumber : freightBillNumber}
              errors={errors}
              displayOptionalSuffix={displayOptionalSuffix}
            />
            <ButtonGroup />
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
export default ContainerVesselTransportDetailsPage;
