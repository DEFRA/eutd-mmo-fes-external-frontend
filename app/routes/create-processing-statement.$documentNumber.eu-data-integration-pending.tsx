import { type LoaderFunction, type MetaFunction, useLoaderData } from "react-router";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta, getDashboardUrlForJourney, getJourneyFromPath } from "~/helpers";
import { EuDataIntegrationPending } from "~/composite-components/euDataIntegrationPending";
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
  EuDataIntegrationLoader(request, params, "IN_PROGRESS");

const EuDataIntegrationPendingPage = () => {
  const { feedbackURL, pathname } = useLoaderData<LoaderData>();
  const journey = getJourneyFromPath(pathname);
  const dashboardUrl = getDashboardUrlForJourney(journey);

  return <EuDataIntegrationPending dashboardUrl={dashboardUrl} feedbackURL={feedbackURL} journey={journey} />;
};

export default EuDataIntegrationPendingPage;
