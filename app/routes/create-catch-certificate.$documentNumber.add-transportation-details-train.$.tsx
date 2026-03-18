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
import type { ITransport, ErrorResponse, ICountry, IErrorsTransformed } from "~/types";
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
    containerNumbers,
    vehicle,
    nextUri,
    csrf,
    id,
    displayOptionalSuffix,
    countries,
    maximumNumberOfContainerNumbers,
  } = useLoaderData<
    ITransport & {
      documentNumber: string;
      nextUri: string;
      displayOptionalSuffix: boolean;
      csrf: string;
      countries?: ICountry[];
      maximumNumberOfContainerNumbers: number;
    }
  >();
  const actionData = useActionData() ?? {};
  const { errors: actionErrors = {} } = actionData as { errors?: IErrorsTransformed };
  const [errorsOverride, setErrorsOverride] = React.useState<IErrorsTransformed | undefined>(undefined);
  const errors = errorsOverride ?? actionErrors;
  React.useEffect(() => {
    setErrorsOverride(undefined);
  }, [actionData]);
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-train/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${id}`;

  const errorKeysInOrder = getTransportErrorKeys(TransportType.TRAIN, maximumNumberOfContainerNumbers);
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
              containerNumbers={getContainerNumbers(errors, actionData, containerNumbers)}
              errors={errors}
              displayOptionalSuffix={displayOptionalSuffix}
              maximumNumberOfContainerNumbers={maximumNumberOfContainerNumbers}
              countries={countries}
              onErrorsChange={setErrorsOverride}
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
