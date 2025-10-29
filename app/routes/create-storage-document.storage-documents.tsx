import * as React from "react";
import { Dashboard, PageNavigationLinks, PopulateLinks } from "~/composite-components";
import type { LoaderFunction, ActionFunction, MetaFunction } from "@remix-run/node";
import { Main } from "~/components";
import { getJourneyHeader } from "~/helpers/dashboard";
import { useTranslation } from "react-i18next";
import type { ErrorResponse, IDashboardData, IGetAllDocumentsData } from "~/types";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { dashboardAction, getDashboardLoader } from "~/.server";
import { getDashboardMeta } from "~/helpers";

export const meta: MetaFunction = ({ data }) => getDashboardMeta(data);

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
    continueLink: "/create-storage-document/:documentNumber/progress",
    deleteLink: "/create-storage-document/:documentNumber/delete-this-draft-storage-document",
    voidLink: "/create-storage-document/:documentNumber/void-this-storage-document",
    copyLink: "/create-storage-document/:documentNumber/copy-this-storage-document",
  };
  const refinedDocuments = PopulateLinks(journey, documents as IGetAllDocumentsData, t, linksToPopulate);
  const [searchParams] = useSearchParams();
  const journeyLink = "/create-storage-document/storage-documents";
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
