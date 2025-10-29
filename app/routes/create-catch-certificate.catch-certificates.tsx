import * as React from "react";
import isEmpty from "lodash/isEmpty";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { type MetaFunction, type ActionFunction, type LoaderFunction, redirect } from "@remix-run/node";
import type { DashboardLinks, IDashboardData, IGetAllDocumentsData } from "~/types";
import { Main } from "~/components";
import { getBearerTokenForRequest, createDocument, getDashboardLoader } from "~/.server";
import { getDashboardMeta, getDashboardUserReference, getJourneyHeader } from "~/helpers";
import { route } from "routes-gen";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { format, getMonth, getYear } from "date-fns";
import {
  Dashboard,
  getCompletedPagination,
  paginationPreviousLinkDate,
  paginationNextLinkDate,
  urlYear,
  urlMonthIndex,
} from "~/composite-components";
import classNames from "classnames/bind";
import { useScrollOnPageLoad } from "~/hooks";

export const meta: MetaFunction = ({ data }) => getDashboardMeta(data);

export const loader: LoaderFunction = async ({ request }) =>
  getDashboardLoader(request, "catchCertificate", "dashboardTitle");

export const action: ActionFunction = async ({ request }): Promise<Response> => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber }: { documentNumber?: string } = await createDocument(bearerToken, "catchCertificate");

  if (documentNumber === undefined) {
    return redirect("/forbidden");
  }

  return redirect(route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }));
};

const populateRecordLinks = (documents: IGetAllDocumentsData, t: TFunction<"common"[], undefined>) => {
  const journey = "catchCertificate";

  const refinedDocuments = {} as IGetAllDocumentsData;

  refinedDocuments.completed = Array.isArray(documents?.completed)
    ? documents.completed.map((document) => {
        document.links = {
          voidLink: () => (
            <Link
              data-testid={`${journey}-voidcompleted`}
              to={route("/create-catch-certificate/:documentNumber/void-this-catch-certificate", {
                documentNumber: document.documentNumber,
              })}
              className="govuk-link"
              reloadDocument
            >
              {t("commonDashboardVoid", { ns: "common" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${getDashboardUserReference(document)}}`}
              </span>
            </Link>
          ),
          copyLink: () => (
            <Link
              data-testid={`${journey}-copycompleted`}
              to={route("/create-catch-certificate/:documentNumber/copy-this-catch-certificate", {
                documentNumber: document.documentNumber,
              })}
              className="govuk-link"
              reloadDocument
            >
              {t("commonDashboardCopy", { ns: "common" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${getDashboardUserReference(document)}}`}
              </span>
            </Link>
          ),
        };
        return document;
      })
    : [];

  refinedDocuments.inProgress = Array.isArray(documents?.inProgress)
    ? documents.inProgress.map((document) => {
        document.links = {
          continueLink: () => (
            <Link
              id="continue"
              to={
                document.isFailed || document.status === "LOCKED"
                  ? route("/create-catch-certificate/:documentNumber/check-your-information", {
                      documentNumber: document.documentNumber,
                    })
                  : route("/create-catch-certificate/:documentNumber/progress", {
                      documentNumber: document.documentNumber,
                    })
              }
              className="govuk-link"
              reloadDocument
            >
              {t("continue", { ns: "dashboard" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${getDashboardUserReference(document)}}`}
              </span>
            </Link>
          ),
          deleteLink: () => (
            <Link
              id="delete"
              to={route("/create-catch-certificate/:documentNumber/delete-this-draft-catch-certificate", {
                documentNumber: document.documentNumber,
              })}
              className="govuk-link"
              reloadDocument
            >
              {t("delete", { ns: "dashboard" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${getDashboardUserReference(document)}}`}
              </span>
            </Link>
          ),
        };
        return document;
      })
    : [];

  return refinedDocuments;
};

const populateNavigationLinks = (t: TFunction<"common"[], undefined>, searchParams: URLSearchParams) => {
  const results: DashboardLinks = {
    previousLink: () => (
      <a
        className="govuk-link govuk-pagination__link"
        href={`${route("/create-catch-certificate/catch-certificates")}?month=${format(
          paginationPreviousLinkDate(searchParams),
          "MM"
        )}&year=${format(paginationPreviousLinkDate(searchParams), "y")}&position=0`}
        rel="next"
      >
        <svg
          className="govuk-pagination__icon govuk-pagination__icon--prev"
          xmlns="http://www.w3.org/2000/svg"
          height="13"
          width="15"
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 15 13"
        >
          <path d="m6.5938-0.0078125-6.7266 6.7266 6.7441 6.4062 1.377-1.449-4.1856-3.9768h12.896v-2h-12.984l4.2931-4.293-1.414-1.414z"></path>
        </svg>
        <span className="govuk-pagination__link-title">{t("commonDashboardPrev", { ns: "common" })}</span>
      </a>
    ),
    monthlyLinks: () =>
      getCompletedPagination(searchParams).map((i, index) => {
        const journey = "catchCertificate";
        const dateI = new Date(i);
        const formattedDate = format(new Date(urlYear(searchParams), urlMonthIndex(searchParams), 1), "MMM y");
        const listClassNames = {
          " govuk-pagination__item--current": i === formattedDate,
          " govuk-pagination--block": i !== formattedDate,
        };
        const monthParam = getMonth(dateI) + 1;
        const monthlyLinkRoute = route(`/create-catch-certificate/catch-certificates`);
        return (
          <li key={`monthly-${i}`} className={classNames("govuk-pagination__item", listClassNames)}>
            <a
              data-testid={`${journey}-monthly-link-${getMonth(dateI) + 1}-${getYear(dateI)}`}
              className="govuk-link govuk-pagination__link"
              href={`${monthlyLinkRoute}?month=${monthParam}&year=${getYear(dateI)}&position=${index}`}
              aria-label={i}
            >
              {i}
            </a>
          </li>
        );
      }),
    nextLink: () => {
      const monthParam = format(paginationNextLinkDate(searchParams), "MM");
      const nextLinkRoute = route(`/create-catch-certificate/catch-certificates`);
      return (
        <a
          className="govuk-link govuk-pagination__link"
          href={`${nextLinkRoute}?month=${monthParam}&year=${format(paginationNextLinkDate(searchParams), "y")}&position=0`}
          rel="previous"
        >
          {" "}
          <span className="govuk-pagination__link-title ">{t("commonDashboardNext", { ns: "common" })}</span>{" "}
          <svg
            className="govuk-pagination__icon govuk-pagination__icon--next"
            xmlns="http://www.w3.org/2000/svg"
            height="13"
            width="15"
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 15 13"
          >
            <path d="m8.107-0.0078125-1.4136 1.414 4.2926 4.293h-12.986v2h12.896l-4.1855 3.9766 1.377 1.4492 6.7441-6.4062-6.7246-6.7266z"></path>
          </svg>
        </a>
      );
    },
  };
  return results;
};

const CatchCertificates = () => {
  const {
    journey,
    documents,
    notification,
    hasDrafts,
    showStartButton,
    maximumDrafts,
    heading,
    dashboardFeedbackURL,
    csrf,
  } = useLoaderData<IDashboardData>();
  const { t } = useTranslation(["common"]);
  const refinedDocuments = populateRecordLinks(documents as IGetAllDocumentsData, t);
  const [searchParams] = useSearchParams();
  const navigationLinks = populateNavigationLinks(t, searchParams);
  const catchCertificateHeading = isEmpty(heading)
    ? getJourneyHeader(journey, t)
    : `${heading}: ${getJourneyHeader(journey, t)}`;

  useScrollOnPageLoad();

  return (
    <Main showHelpLink={false}>
      <Dashboard
        documents={refinedDocuments}
        journey={journey}
        notification={notification}
        hasDrafts={hasDrafts}
        showStartButton={showStartButton}
        maximumDrafts={maximumDrafts}
        heading={catchCertificateHeading}
        dashboardLinks={navigationLinks}
        dashboardFeedbackURL={dashboardFeedbackURL}
        csrf={csrf}
      />
    </Main>
  );
};

export default CatchCertificates;
