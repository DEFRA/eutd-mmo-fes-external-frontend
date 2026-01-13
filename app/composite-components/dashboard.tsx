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
