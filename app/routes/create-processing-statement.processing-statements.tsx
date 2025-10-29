import * as React from "react";
import { Main } from "~/components";
import { getJourneyHeader } from "~/helpers/dashboard";
import { useTranslation } from "react-i18next";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { type MetaFunction, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import type { ErrorResponse, IDashboardData, IGetAllDocumentsData } from "~/types";
import { getDashboardLoader, dashboardAction } from "~/.server";
import { Dashboard, PageNavigationLinks, PopulateLinks } from "~/composite-components";
import { getDashboardMeta } from "~/helpers";

export const meta: MetaFunction = ({ data }) => getDashboardMeta(data);

export const loader: LoaderFunction = async ({ request }) =>
  getDashboardLoader(request, "processingStatement", "dashboardProcessingStatementTitle");

export const action: ActionFunction = async ({ request }): Promise<Response | ErrorResponse> =>
  dashboardAction(request, "processingStatement");

const ProcessingStatements = () => {
  const {
    documents,
    journey,
    notification,
    hasDrafts,
    showStartButton,
    maximumDrafts,
    heading,
    dashboardFeedbackURL,
    csrf,
  } = useLoaderData<IDashboardData>();
  const { t } = useTranslation(["common"]);
  const linksToPopulate = {
    continueLink: "/create-processing-statement/:documentNumber/progress",
    deleteLink: "/create-processing-statement/:documentNumber/delete-this-draft-processing-statement",
    voidLink: "/create-processing-statement/:documentNumber/void-this-processing-statement",
    copyLink: "/create-processing-statement/:documentNumber/copy-this-processing-statement",
  };
  const refinedDocuments = PopulateLinks(journey, documents as IGetAllDocumentsData, t, linksToPopulate);
  const [searchParams] = useSearchParams();
  const journeyLink = "/create-processing-statement/processing-statements";
  const navigationLinks = PageNavigationLinks(t, searchParams, journeyLink, journey);
  const processingStatementsHeading = heading
    ? `${heading}: ${getJourneyHeader("processingStatement", t)}`
    : getJourneyHeader("processingStatement", t);

  return (
    <Main showHelpLink={false}>
      <Dashboard
        documents={refinedDocuments}
        journey={journey}
        notification={notification}
        hasDrafts={hasDrafts}
        showStartButton={showStartButton}
        maximumDrafts={maximumDrafts}
        heading={processingStatementsHeading}
        dashboardLinks={navigationLinks}
        dashboardFeedbackURL={dashboardFeedbackURL}
        csrf={csrf}
      />
    </Main>
  );
};

export default ProcessingStatements;
