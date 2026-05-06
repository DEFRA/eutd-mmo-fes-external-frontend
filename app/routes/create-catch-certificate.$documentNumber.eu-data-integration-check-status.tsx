import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { route } from "routes-gen";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import * as React from "react";
import type { EuStatus } from "~/types";
import { EuDataIntegrationSuccessful, EuDataIntegrationFailed, EuDataIntegrationPending } from "~/composite-components";

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

type LoaderData = {
  status: EuStatus;
  documentNumber: string;
  catchReferenceNumber: string;
  feedbackURL: string;
};

export const loader: LoaderFunction = async ({ request, params }) => EuDataIntegrationLoader(request, params);

const EuDataIntegrationCheckStatusPage = () => {
  const { catchReferenceNumber, feedbackURL, status } = useLoaderData<LoaderData>();
  const dashboardUrl = route("/create-catch-certificate/catch-certificates");

  if (status === "SUCCESS") {
    return (
      <EuDataIntegrationSuccessful
        dashboardUrl={dashboardUrl}
        catchReferenceNumber={catchReferenceNumber}
        feedbackURL={feedbackURL}
        journey="catchCertificate"
      />
    );
  } else if (status === "FAILURE") {
    return <EuDataIntegrationFailed dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="catchCertificate" />;
  } else {
    return (
      <EuDataIntegrationPending dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey="catchCertificate" />
    );
  }
};

export default EuDataIntegrationCheckStatusPage;
