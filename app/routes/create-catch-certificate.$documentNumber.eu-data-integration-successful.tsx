import { type LoaderFunction, type MetaFunction, useLoaderData, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { Main } from "~/components";
import { useScrollOnPageLoad } from "~/hooks";
import { EuDataIntegrationLoader } from "~/.server/eu-data-integration";
import { getMeta } from "~/helpers";
import * as React from "react";
type LoaderData = {
  documentNumber: string;
  catchReferenceNumber: string;
  status: string;
  feedbackURL: string;
};

export const meta: MetaFunction = (args) => getMeta(args);

export const loader: LoaderFunction = async ({ request, params }) =>
  EuDataIntegrationLoader(request, params, "SUCCESS");

const EuDataIntegrationSuccessful = () => {
  const { t } = useTranslation(["euDataIntegration", "common"]);
  const { catchReferenceNumber, feedbackURL } = useLoaderData<LoaderData>();
  useScrollOnPageLoad();

  const dashboardUrl = route("/create-catch-certificate/catch-certificates");

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

      <p className="govuk-body">{t("dataTransferredMessage", { ns: "euDataIntegration" })}</p>

      <p className="govuk-body">{t("euReceivedInformation", { ns: "euDataIntegration" })}</p>

      <h2 className="govuk-heading-m">{t("whatHappensNext", { ns: "euDataIntegration" })}</h2>
      <p className="govuk-body">
        {t("certificateReadyMessage", { ns: "euDataIntegration" })}{" "}
        <Link to={dashboardUrl} className="govuk-link">
          {t("viewOrDownloadLink", { ns: "euDataIntegration" })}
        </Link>
      </p>
    </Main>
  );
};

export default EuDataIntegrationSuccessful;
