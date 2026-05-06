import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import * as React from "react";
import type { EuStatus } from "~/types";
import { EuDataIntegrationSuccessful, EuDataIntegrationFailed, EuDataIntegrationPending } from "~/composite-components";

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) => EuDataIntegrationLoader(request, params);

type LoaderData = {
  status: EuStatus;
  catchReferenceNumber: string;
  feedbackURL: string;
  documentNumber: string;
};

const EuDataIntegrationSuccessfulPage = () => {
  const { catchReferenceNumber, feedbackURL, status } = useLoaderData<LoaderData>();
  const dashboardUrl = route("/create-processing-statement/processing-statements");

  if (status === "SUCCESS") {
    return (
      <EuDataIntegrationSuccessful
        dashboardUrl={dashboardUrl}
        catchReferenceNumber={catchReferenceNumber}
        feedbackURL={feedbackURL}
        journey="processingStatement"
      />
    );
  } else if (status === "FAILURE") {
    return (
      <EuDataIntegrationFailed dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="processingStatement" />
    );
  } else {
    return (
      <EuDataIntegrationPending dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="processingStatement" />
    );
  }
};

export default EuDataIntegrationSuccessfulPage;
