import * as React from "react";
import { useTranslation } from "react-i18next";
import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ButtonGroup, CatchCertificateTransportationDetails } from "~/composite-components";
import {
  useLoaderData,
  useActionData,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from "react-router";
import type { ITransport, ErrorResponse, ICountry } from "~/types";
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDetailsAction } from "~/.server";
import { displayErrorMessagesInOrder, getMeta, TransportType, getContainerNumbers } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useTransportationDetailsPageSetup } from "~/hooks";
import { CONTAINER_NUMBER_KEYS } from "~/constants/transportationDetails";

export const meta: MetaFunction = (args) => getMeta(args);
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
    containerNumbers,
    nextUri,
    csrf,
    id,
    displayOptionalSuffix,
    countries,
  } = useLoaderData<
    ITransport & {
      documentNumber: string;
      nextUri: string;
      displayOptionalSuffix: boolean;
      csrf: string;
      countries: ICountry[];
    }
  >();
  const actionData = useActionData<any>() ?? {};
  const { errors = {} } = actionData;
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-truck/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  const errorKeysInOrder = [
    "nationalityOfVehicle",
    "registrationNumber",
    "departurePlace",
    ...CONTAINER_NUMBER_KEYS,
    "freightBillNumber",
  ];

  useTransportationDetailsPageSetup(errors);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
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
              containerNumbers={getContainerNumbers(errors, actionData, containerNumbers)}
              displayOptionalSuffix={displayOptionalSuffix}
              countries={countries}
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
