import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta, getDashboardUrlForJourney, getJourneyFromPath } from "~/helpers";
import { EuDataIntegrationSuccessful } from "~/composite-components/euDataIntegrationSuccessful";
import * as React from "react";

type LoaderData = {
  documentNumber: string;
  catchReferenceNumber: string;
  status: string;
  feedbackURL: string;
  pathname: string;
};

export const meta: MetaFunction<typeof loader> = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) =>
  EuDataIntegrationLoader(request, params, "SUCCESS");

const EuDataIntegrationSuccessfulPage = () => {
  const { catchReferenceNumber, feedbackURL, pathname } = useLoaderData<LoaderData>();
  const journey = getJourneyFromPath(pathname);
  const dashboardUrl = getDashboardUrlForJourney(journey);

  return (
    <EuDataIntegrationSuccessful
      dashboardUrl={dashboardUrl}
      catchReferenceNumber={catchReferenceNumber}
      feedbackURL={feedbackURL}
      journey={journey}
    />
  );
};

export default EuDataIntegrationSuccessfulPage;
