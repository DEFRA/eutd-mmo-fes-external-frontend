import * as React from "react";
import { Dashboard, PageNavigationLinks, PopulateLinks } from "~/composite-components";
import type { LoaderFunction, ActionFunction, MetaFunction } from "react-router";
import { Main } from "~/components";
import { getJourneyHeader } from "~/helpers/dashboard";
import { useTranslation } from "react-i18next";
import type { ErrorResponse, IDashboardData } from "~/types";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { dashboardAction, getDashboardLoader } from "~/.server";
import { getDashboardMeta } from "~/helpers";

export const meta: MetaFunction = (args) => getDashboardMeta(args);

export const loader: LoaderFunction = async ({ request }) =>
  getDashboardLoader(request, "storageNotes", "dashboardStorageDocumentTitle");

export const action: ActionFunction = async ({ request }): Promise<Response | ErrorResponse> =>
  dashboardAction(request, "storageNotes");

const StorageDocuments = () => {
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
    continueLink: "/create-non-manipulation-document/:documentNumber/progress",
    deleteLink: "/create-non-manipulation-document/:documentNumber/delete-this-non-manipulation-document",
    voidLink: "/create-non-manipulation-document/:documentNumber/void-this-non-manipulation-document",
    copyLink: "/create-non-manipulation-document/:documentNumber/copy-this-non-manipulation-document",
  };
  const refinedDocuments = PopulateLinks(journey, documents, t, linksToPopulate);
  const [searchParams] = useSearchParams();
  const journeyLink = "/create-non-manipulation-document/non-manipulation-documents";
  const journeyName = "storageDocument";
  const navigationLinks = PageNavigationLinks(t, searchParams, journeyLink, journeyName);
  const storageDocumentsHeading = heading
    ? `${heading}: ${getJourneyHeader("storageNotes", t)}`
    : getJourneyHeader("storageNotes", t);

  return (
    <Main showHelpLink={false}>
      <Dashboard
        documents={refinedDocuments}
        journey={journey}
        notification={notification}
        hasDrafts={hasDrafts}
        showStartButton={showStartButton}
        maximumDrafts={maximumDrafts}
        heading={storageDocumentsHeading}
        dashboardLinks={navigationLinks}
        dashboardFeedbackURL={dashboardFeedbackURL}
        csrf={csrf}
      />
    </Main>
  );
};

export default StorageDocuments;
