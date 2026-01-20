import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import { EuDataIntegrationPending } from "~/composite-components/euDataIntegrationPending";
import * as React from "react";

type LoaderData = {
  documentNumber: string;
  catchReferenceNumber: string;
  status: string;
  feedbackURL: string;
};

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) =>
  EuDataIntegrationLoader(request, params, "IN_PROGRESS");

const EuDataIntegrationPendingPage = () => {
  const { feedbackURL } = useLoaderData<LoaderData>();
  const dashboardUrl = route("/create-non-manipulation-document/non-manipulation-documents");

  return <EuDataIntegrationPending dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="storageNotes" />;
};

export default EuDataIntegrationPendingPage;
