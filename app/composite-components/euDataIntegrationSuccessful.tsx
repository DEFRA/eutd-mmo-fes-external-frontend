import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Main } from "~/components";
import { useScrollOnPageLoad } from "~/hooks";
import type { Journey } from "~/types";

type EuDataIntegrationSuccessfulProps = {
  dashboardUrl: string;
  catchReferenceNumber: string;
  feedbackURL: string;
  journey: Journey;
};

export const EuDataIntegrationSuccessful = ({
  dashboardUrl,
  catchReferenceNumber,
  feedbackURL,
  journey,
}: EuDataIntegrationSuccessfulProps) => {
  const { t } = useTranslation(["euDataIntegration", "common"]);
  useScrollOnPageLoad();

  return (
    <Main feedbackLink={feedbackURL}>
      <Link to={dashboardUrl} className="govuk-back-link">
        {t("commonBackLinkBackButtonLabel", { ns: "common" })}
      </Link>
      <div className="govuk-panel govuk-panel--confirmation" data-testid="eu-integration-success-banner">
        <h1 className="govuk-panel__title">{t("euDataIntegrationSuccessful")}</h1>
        <div className="govuk-panel__body">
          {t("yourReferenceNumber")}
          <br />
          <strong>{catchReferenceNumber}</strong>
        </div>
      </div>

      <p className="govuk-body">{t(`dataTransferredMessage${journey}`, { ns: "euDataIntegration" })}</p>

      <p className="govuk-body">{t("euReceivedInformation", { ns: "euDataIntegration" })}</p>

      <h2 className="govuk-heading-m">{t("whatHappensNext", { ns: "euDataIntegration" })}</h2>
      <p className="govuk-body">
        {t(`certificateReadyMessage${journey}`, { ns: "euDataIntegration" })}{" "}
        <Link to={dashboardUrl} className="govuk-link">
          {t("viewOrDownloadLink", { ns: "euDataIntegration" })}
        </Link>
      </p>
    </Main>
  );
};
