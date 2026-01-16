import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import { EuDataIntegrationFailed } from "~/composite-components/euDataIntegrationFailed";
import * as React from "react";

type LoaderData = {
  documentNumber: string;
  catchReferenceNumber: string;
  status: string;
  feedbackURL: string;
};

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) =>
  EuDataIntegrationLoader(request, params, "FAILURE");

const EuDataIntegrationFailedPage = () => {
  const { feedbackURL } = useLoaderData<LoaderData>();
  const dashboardUrl = route("/create-non-manipulation-document/non-manipulation-documents");

  return <EuDataIntegrationFailed dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="storageNotes" />;
};

export default EuDataIntegrationFailedPage;
