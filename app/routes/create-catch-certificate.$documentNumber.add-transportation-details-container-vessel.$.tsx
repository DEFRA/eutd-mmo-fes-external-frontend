import * as React from "react";
import isEmpty from "lodash/isEmpty";
import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ButtonGroup, CatchCertificateTransportationDetails } from "~/composite-components";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDetailsAction } from "~/.server";
import type { ErrorResponse, ITransport } from "~/types";
import { displayErrorMessages, getMeta, scrollToId, TransportType } from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";
import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
export const meta: MetaFunction = ({ data }) => getMeta(data);
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
    containerNumber,
    departurePlace,
    freightBillNumber,
    nextUri,
    csrf,
    id,
    displayOptionalSuffix,
  } = useLoaderData<
    ITransport & { documentNumber: string; nextUri: string; displayOptionalSuffix: boolean; csrf: string }
  >();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-container-vessel/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <CatchCertificateTransportationDetails
              legendTitle={`${t("addTransportationDetailsTransportDetailsTitle", { ns: "transportation" })} 
                ${t("addTransportationDetailsContainerVessel", { ns: "transportation" })}`}
              vehicle={vehicle}
              vesselName={!isEmpty(errors) ? actionData.vesselName : vesselName}
              flagState={!isEmpty(errors) ? actionData.flagState : flagState}
              containerNumber={!isEmpty(errors) ? actionData.containerNumber : containerNumber}
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
