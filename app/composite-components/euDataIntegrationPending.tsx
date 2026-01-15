import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Main } from "~/components";
import { useScrollOnPageLoad } from "~/hooks";
import type { Journey } from "~/types";

type EuDataIntegrationPendingProps = {
  dashboardUrl: string;
  feedbackURL: string;
  journey: Journey;
};

export const EuDataIntegrationPending = ({ dashboardUrl, feedbackURL, journey }: EuDataIntegrationPendingProps) => {
  const { t } = useTranslation(["common"]);
  useScrollOnPageLoad();

  return (
    <Main feedbackLink={feedbackURL}>
      <Link to={dashboardUrl} className="govuk-back-link">
        {t("commonBackLinkBackButtonLabel", { ns: "common" })}
      </Link>
      <h1 className="govuk-heading-xl">{t("euIntegrationPendingTitle")}</h1>

      <p className="govuk-body" style={{ whiteSpace: "pre-line" }}>
        {t(`euIntegrationPendingDescription${journey}`)}
      </p>

      <h2 className="govuk-heading-m">{t("euIntegrationWhatCanYouDoNow")}</h2>

      <p className="govuk-body">
        {t(`euIntegrationPendingViewDashboard${journey}`)}{" "}
        <Link to={dashboardUrl} className="govuk-link">
          {t("euIntegrationFailedMeansText2Link")}
        </Link>
      </p>
    </Main>
  );
};
