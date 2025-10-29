import * as React from "react";
import { AddAdditionalTransportDocuments } from "~/composite-components";
import { useLoaderData, useActionData } from "@remix-run/react";
import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import type { ITransport, ErrorResponse, AdditionalDocumentsData } from "~/types";
import { CatchCertificateTransportationDetailsLoader, CatchCertificateTransportationDocumentsAction } from "~/.server";
import { getMeta, TransportType } from "~/helpers";

export const meta: MetaFunction = ({ data }) => getMeta(data);

export const loader: LoaderFunction = async ({ request, params }) =>
  await CatchCertificateTransportationDetailsLoader(request, params, TransportType.TRUCK);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  await CatchCertificateTransportationDocumentsAction(request, params);

const TruckTransportDocumentsPage = () => {
  const { documentNumber, nextUri, id, documents, displayOptionalSuffix, csrf, maximumTransportDocumentPerTransport } =
    useLoaderData<
      ITransport & {
        documentNumber: string;
        nextUri: string;
        displayOptionalSuffix: boolean;
        csrf: string;
        maximumTransportDocumentPerTransport: number;
      }
    >();
  const actionData = useActionData<{ errors: any; additionalFormDocuments?: AdditionalDocumentsData[] }>() ?? {};
  const { errors = {}, additionalFormDocuments } = actionData;

  const transportType = TransportType.TRUCK;
  const actionUrl = `/create-catch-certificate/${documentNumber}/add-additional-transport-documents-truck/${id}`;
  const backUrl = `/create-catch-certificate/${documentNumber}/add-transportation-details-truck/${id}`;

  return (
    <AddAdditionalTransportDocuments
      documents={Array.isArray(additionalFormDocuments) ? additionalFormDocuments : documents}
      maximumTransportDocumentPerTransport={maximumTransportDocumentPerTransport}
      documentNumber={documentNumber}
      transportType={transportType}
      actionUrl={actionUrl}
      backUrl={backUrl}
      nextUri={nextUri}
      errors={errors}
      displayOptionalSuffix={displayOptionalSuffix}
      csrf={csrf}
    />
  );
};

export default TruckTransportDocumentsPage;
