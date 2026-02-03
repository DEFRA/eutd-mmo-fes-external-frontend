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
import {
  displayErrorMessagesInOrder,
  getMeta,
  scrollToId,
  TransportType,
  getContainerNumbers,
  generateTransportErrorKeys,
} from "~/helpers";
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

  const errorKeysInOrder = generateTransportErrorKeys(
    ["vesselName", "flagState"],
    ["departurePlace", "freightBillNumber"]
  );

  useScrollOnPageLoad();

  useEffect(() => {
    if (isEmpty(errors)) {
      return;
    }
    scrollToId("errorIsland");
  }, [errors]);

  return (
    <Main backUrl={backUrl}>
      {isEmpty(errors) ? null : <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <CatchCertificateTransportationDetails
              legendTitle={`${t("addTransportationDetailsTransportDetailsTitle", { ns: "transportation" })} 
                ${t("addTransportationDetailsContainerVessel", { ns: "transportation" })}`}
              vehicle={vehicle}
              vesselName={isEmpty(errors) ? vesselName : actionData.vesselName}
              flagState={isEmpty(errors) ? flagState : actionData.flagState}
              containerNumbers={getContainerNumbers(errors, actionData, containerNumbers)}
              departurePlace={isEmpty(errors) ? departurePlace : actionData.departurePlace}
              freightBillNumber={isEmpty(errors) ? freightBillNumber : actionData.freightBillNumber}
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
