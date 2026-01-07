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
  EuDataIntegrationLoader(request, params, "IN_PROGRESS");

const EuDataIntegrationPending = () => {
  const { t } = useTranslation(["common"]);
  const { feedbackURL } = useLoaderData<LoaderData>();
  useScrollOnPageLoad();

  const dashboardUrl = route("/create-catch-certificate/catch-certificates");

  return (
    <Main feedbackLink={feedbackURL}>
      <Link to={dashboardUrl} className="govuk-back-link">
        {t("commonBackLinkBackButtonLabel", { ns: "common" })}
      </Link>
      <h1 className="govuk-heading-xl">{t("euIntegrationPendingTitle")}</h1>

      <p className="govuk-body" style={{ whiteSpace: "pre-line" }}>
        {t("euIntegrationPendingDescription")}
      </p>

      <h2 className="govuk-heading-m">{t("euIntegrationWhatCanYouDoNow")}</h2>

      <p className="govuk-body">
        {t("euIntegrationPendingViewDashboard")}{" "}
        <Link to={route("/create-catch-certificate/catch-certificates")} className="govuk-link">
          {t("euIntegrationFailedMeansText2Link")}
        </Link>
      </p>
    </Main>
  );
};

export default EuDataIntegrationPending;
