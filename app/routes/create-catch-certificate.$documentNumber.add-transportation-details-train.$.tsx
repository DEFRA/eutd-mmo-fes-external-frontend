import * as React from "react";
import { Main, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ButtonGroup, CatchCertificateTransportationDetails } from "~/composite-components";
import {
  useLoaderData,
  useActionData,
  type LoaderFunction,
  type ActionFunction,
  type MetaFunction,
} from "react-router";
import { useTranslation } from "react-i18next";
import type { ITransport, ErrorResponse, ICountry } from "~/types";
import { displayErrorMessagesInOrder, getMeta, TransportType, getContainerNumbers } from "~/helpers";
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDetailsAction } from "~/.server";
import isEmpty from "lodash/isEmpty";
import { useTransportationDetailsPage, getTransportErrorKeys } from "~/hooks";

export const meta: MetaFunction = (args) => getMeta(args);
export const loader: LoaderFunction = async ({ request, params }) =>
  await CatchCertificateTransportationDetailsLoader(request, params, TransportType.TRAIN);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await CatchCertificateTransportationDetailsAction(request, params, TransportType.TRAIN);

const TrainTransportDetailsPage = () => {
  const { t } = useTranslation(["common", "transportation"]);
  const {
    documentNumber,
    railwayBillNumber,
    departurePlace,
    freightBillNumber,
    containerNumber,
    vehicle,
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
      countries?: ICountry[];
    }
  >();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-train/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  const errorKeysInOrder = getTransportErrorKeys(TransportType.TRAIN);
  useTransportationDetailsPage(errors);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessagesInOrder(errors, errorKeysInOrder)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <CatchCertificateTransportationDetails
              legendTitle={`${t("addTransportationDetailsTransportDetailsTitle", { ns: "transportation" })} ${t(
                "addTransportationDetailsTrain",
                { ns: "transportation" }
              )}`}
              vehicle={vehicle}
              railwayBillNumber={!isEmpty(errors) ? actionData.railwayBillNumber : railwayBillNumber}
              departurePlace={!isEmpty(errors) ? actionData.departurePlace : departurePlace}
              freightBillNumber={!isEmpty(errors) ? actionData.freightBillNumber : freightBillNumber}
              containerNumber={getContainerNumbers(errors, actionData, containerNumber)}
              errors={errors}
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
export default TrainTransportDetailsPage;
