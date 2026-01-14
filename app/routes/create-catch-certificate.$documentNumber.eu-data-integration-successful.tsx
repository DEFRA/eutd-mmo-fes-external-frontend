import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import { EuDataIntegrationSuccessful } from "~/composite-components/euDataIntegrationSuccessful";
import * as React from "react";

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

type LoaderData = {
  status: string;
  documentNumber: string;
  feedbackURL: string;
  catchReferenceNumber: string;
};

export const loader: LoaderFunction = async ({ request, params }) =>
  EuDataIntegrationLoader(request, params, "SUCCESS");

const EuDataIntegrationSuccessfulPage = () => {
  const { catchReferenceNumber, feedbackURL } = useLoaderData<LoaderData>();
  const dashboardUrl = route("/create-catch-certificate/catch-certificates");

  return (
    <EuDataIntegrationSuccessful
      dashboardUrl={dashboardUrl}
      catchReferenceNumber={catchReferenceNumber}
      feedbackURL={feedbackURL}
      journey="catchCertificate"
    />
  );
};

export default EuDataIntegrationSuccessfulPage;
