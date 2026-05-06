import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import type { EuStatus } from "~/types";
import { EuDataIntegrationSuccessful, EuDataIntegrationFailed, EuDataIntegrationPending } from "~/composite-components";

type LoaderData = {
  documentNumber: string;
  catchReferenceNumber: string;
  status: EuStatus;
  feedbackURL: string;
};

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) => EuDataIntegrationLoader(request, params);

const EuDataIntegrationSuccessfulPage = () => {
  const { catchReferenceNumber, feedbackURL, status } = useLoaderData<LoaderData>();
  const dashboardUrl = route("/create-non-manipulation-document/non-manipulation-documents");

  if (status === "SUCCESS") {
    return (
      <EuDataIntegrationSuccessful
        dashboardUrl={dashboardUrl}
        catchReferenceNumber={catchReferenceNumber}
        feedbackURL={feedbackURL}
        journey="storageNotes"
      />
    );
  } else if (status === "FAILURE") {
    return <EuDataIntegrationFailed dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="storageNotes" />;
  } else {
    return <EuDataIntegrationPending dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="storageNotes" />;
  }
};

export default EuDataIntegrationSuccessfulPage;
