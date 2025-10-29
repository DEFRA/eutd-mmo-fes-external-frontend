import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import type { IDashboardData } from "~/types";
import { Notification, NotificationBanner, Sidebar, ManageYourProductFavouritesLink, SecureForm } from "~/components";
import { DocumentProgressTable } from "./documentProgressTable";
import { DocumentCompletedTable } from "./documentCompletedTable";
import { useScrollOnPageLoad } from "~/hooks";

export const Dashboard = ({
  journey,
  documents,
  notification,
  hasDrafts,
  showStartButton,
  maximumDrafts,
  dashboardLinks,
  heading,
  dashboardFeedbackURL,
  csrf,
}: IDashboardData) => {
  const { t } = useTranslation(["common"]);
  const label = t(`${journey}DashboardCreateANewJourney`, {
    key: t(journey),
    ns: "dashboard",
  });

  useScrollOnPageLoad();

  return (
    <>
      {notification && <Notification title={notification.title} message={notification.message} />}

      {!showStartButton && (
        <NotificationBanner
          header={t("commonImportant")}
          dataTestId={t(`${journey}-maxlimitmessage`, { ns: "dashboard" })}
          messages={[t(`${journey}DashboardNotificationOfMaximumDrafts`, { ns: "dashboard" })]}
        />
      )}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="dashboardheader">
            <div className="dashboardinnerheader">
              <h1 className="govuk-heading-xl">{heading}</h1>
            </div>
          </div>
          {journey === "storageNotes" && (
            <div className="govuk-!-margin-bottom-6">
              <div className="govuk-!-display-inline-block">
                <svg
                  version="1.1"
                  fill="currentColor"
                  width="35"
                  height="35"
                  viewBox="0 0 35.000000 35.000000"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <title>icon important</title>
                  <g transform="translate(0.000000,35.000000) scale(0.100000,-0.100000)">
                    <path
                      d="M100 332 c-87 -48 -125 -155 -82 -232 48 -87 155 -125 232 -82 87 48
                        125 155 82 232 -48 87 -155 125 -232 82z m100 -122 c0 -53 -2 -60 -20 -60 -18
                        0 -20 7 -20 60 0 53 2 60 20 60 18 0 20 -7 20 -60z m0 -111 c0 -12 -7 -19 -20
                        -19 -19 0 -28 28 -14 43 11 11 34 -5 34 -24z"
                    ></path>
                  </g>
                </svg>
              </div>
              <div
                className="govuk-!-display-inline-block govuk-!-padding-left-2 govuk-phase-banner__text"
                style={{ width: "90%" }}
              >
                <strong>{t("commonStorageToNonManipulationMsg", { journeyText: t(journey) })}</strong>
              </div>
            </div>
          )}
          {showStartButton && (
            <div className="govuk-!-margin-bottom-3">
              <SecureForm reloadDocument method="post" csrf={csrf}>
                <Button
                  id="create-export-document"
                  label={t(label)}
                  type={BUTTON_TYPE.SUBMIT}
                  className="govuk-button govuk-button--start govuk-!-margin-bottom-3 govuk-!-padding-left-4 govuk-!-padding-right-8"
                  data-module="govuk-button"
                  name="_action"
                />
              </SecureForm>
              {journey === "catchCertificate" && <ManageYourProductFavouritesLink />}
            </div>
          )}
          <DocumentProgressTable
            documents={documents}
            journey={journey}
            maximumDraftsLength={maximumDrafts}
            hasDrafts={hasDrafts}
          />
          <DocumentCompletedTable
            documents={documents}
            journey={journey}
            showCopyButton={showStartButton}
            dashboardLinks={dashboardLinks}
          />
        </div>

        <div className="govuk-grid-column-one-third">
          <Sidebar journey={journey} dashboardFeedbackURL={dashboardFeedbackURL} />
        </div>
      </div>
    </>
  );
};
