import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import { EuDataIntegrationSuccessful } from "~/composite-components/euDataIntegrationSuccessful";

type LoaderData = {
  documentNumber: string;
  catchReferenceNumber: string;
  status: string;
  feedbackURL: string;
};

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) =>
  EuDataIntegrationLoader(request, params, "SUCCESS");

const EuDataIntegrationSuccessfulPage = () => {
  const { catchReferenceNumber, feedbackURL } = useLoaderData<LoaderData>();
  const dashboardUrl = route("/create-storage-document/storage-documents");

  return (
    <EuDataIntegrationSuccessful
      dashboardUrl={dashboardUrl}
      catchReferenceNumber={catchReferenceNumber}
      feedbackURL={feedbackURL}
      journey="storageNotes"
    />
  );
};

export default EuDataIntegrationSuccessfulPage;
