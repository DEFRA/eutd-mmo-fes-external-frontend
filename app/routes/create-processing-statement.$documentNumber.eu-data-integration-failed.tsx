import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta, getDashboardUrlForJourney, getJourneyFromPath } from "~/helpers";
import { EuDataIntegrationFailed } from "~/composite-components/euDataIntegrationFailed";
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
  EuDataIntegrationLoader(request, params, "FAILURE");

const EuDataIntegrationFailedPage = () => {
  const { feedbackURL, pathname } = useLoaderData<LoaderData>();
  const journey = getJourneyFromPath(pathname);
  const dashboardUrl = getDashboardUrlForJourney(journey);

  return <EuDataIntegrationFailed dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey={journey} />;
};

export default EuDataIntegrationFailedPage;
