import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { Main } from "~/components";
import { useScrollOnPageLoad } from "~/hooks";
import type { Journey } from "~/types";

type EuDataIntegrationFailedProps = {
  dashboardUrl: string;
  feedbackURL: string;
  journey: Journey;
};

export const EuDataIntegrationFailed = ({ dashboardUrl, feedbackURL, journey }: EuDataIntegrationFailedProps) => {
  const { t } = useTranslation(["common"]);
  useScrollOnPageLoad();

  return (
    <Main feedbackLink={feedbackURL}>
      <Link to={dashboardUrl} className="govuk-back-link">
        {t("commonBackLinkBackButtonLabel", { ns: "common" })}
      </Link>
      <h1 className="govuk-heading-xl">{t("euIntegrationFailedTitle")}</h1>

      <p className="govuk-body">{t(`euIntegrationFailedDescription${journey}`)}</p>

      <h2 className="govuk-heading-m">{t("euIntegrationWhatThisMeans")}</h2>

      <p className="govuk-body">{t(`euIntegrationFailedMeansText1${journey}`)}</p>
      <p className="govuk-body">
        {t(`euIntegrationFailedMeansText2Start${journey}`)}{" "}
        <Link to={dashboardUrl} className="govuk-link">
          {t("euIntegrationFailedMeansText2Link")}
        </Link>
      </p>

      <h2 className="govuk-heading-m">{t("euIntegrationIfYouNeedToSpeak")}</h2>

      <p className="govuk-body">{t("euIntegrationContactHelpline")}</p>
    </Main>
  );
};
