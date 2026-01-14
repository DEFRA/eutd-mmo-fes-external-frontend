import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import { EuDataIntegrationSuccessful } from "~/composite-components/euDataIntegrationSuccessful";
import * as React from "react";

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
  const dashboardUrl = route("/create-processing-statement/processing-statements");

  return (
    <EuDataIntegrationSuccessful
      dashboardUrl={dashboardUrl}
      catchReferenceNumber={catchReferenceNumber}
      feedbackURL={feedbackURL}
      journey="processingStatement"
    />
  );
};

export default EuDataIntegrationSuccessfulPage;
