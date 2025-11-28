import * as React from "react";
import { useEffect } from "react";
import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ButtonGroup, CatchCertificateTransportationDetails } from "~/composite-components";
import { useLoaderData, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import type { ITransport, ErrorResponse } from "~/types";
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDetailsAction } from "~/.server";
import { displayErrorMessages, getMeta, scrollToId, TransportType } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
export const meta: MetaFunction = ({ data }) => getMeta(data);
export const loader: LoaderFunction = async ({ request, params }) =>
  await CatchCertificateTransportationDetailsLoader(request, params, TransportType.TRUCK);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await CatchCertificateTransportationDetailsAction(request, params, TransportType.TRUCK);

const TruckTransportDetailsPage = () => {
  const { t } = useTranslation("common");
  const {
    documentNumber,
    vehicle,
    nationalityOfVehicle,
    registrationNumber,
    departurePlace,
    freightBillNumber,
    containerIdentificationNumber,
    nextUri,
    csrf,
    id,
    displayOptionalSuffix,
  } = useLoaderData<
    ITransport & { documentNumber: string; nextUri: string; displayOptionalSuffix: boolean; csrf: string }
  >();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-truck/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useScrollOnPageLoad();

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <CatchCertificateTransportationDetails
              legendTitle={`${t("addTransportationDetailsTransportDetailsTitle", { ns: "transportation" })} ${t(
                "addTransportationDetailsTruck",
                { ns: "transportation" }
              )}`}
              vehicle={vehicle}
              errors={errors}
              nationalityOfVehicle={!isEmpty(errors) ? actionData.nationalityOfVehicle : nationalityOfVehicle}
              registrationNumber={!isEmpty(errors) ? actionData.registrationNumber : registrationNumber}
              departurePlace={!isEmpty(errors) ? actionData.departurePlace : departurePlace}
              freightBillNumber={!isEmpty(errors) ? actionData.freightBillNumber : freightBillNumber}
              containerIdentificationNumber={
                !isEmpty(errors) ? actionData.containerIdentificationNumber : containerIdentificationNumber
              }
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

export default TruckTransportDetailsPage;
