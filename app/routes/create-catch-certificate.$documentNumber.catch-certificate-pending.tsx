import * as React from "react";
import { route } from "routes-gen";
import { Main } from "~/components";
import { Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { type LoaderFunction } from "@remix-run/node";
import { useScrollOnPageLoad } from "~/hooks";
import { CatchCertificatePendingLoader } from "~/models";

export const loader: LoaderFunction = async ({ params }) => await CatchCertificatePendingLoader(params);

const CatchCertificatePending = () => {
  const { t } = useTranslation(["catchCertificatePending", "common"]);
  const { documentNumber, offlineValidationTime } = useLoaderData<{
    documentNumber: string | undefined;
    offlineValidationTime: string;
  }>();

  useScrollOnPageLoad();

  return (
    <Main backUrl={route("/create-catch-certificate/catch-certificates")}>
      <div className="govuk-panel govuk-panel--confirmation">
        <h1 className="govuk-panel__title">{t("ccPendingPanel")}</h1>
        <div className="govuk-panel__body">
          {t("ccNumber")}
          <br />
          <strong>{documentNumber}</strong>
          <br />
        </div>
      </div>
      <br />
      <br />
      <h2 className="govuk-heading-m">{t("ccTextTitle")}</h2>
      <p className="govuk-body">
        {t("ccPendingTextOne", { offlineValidationTime })}
        <br />
        {t("ccPendingTexTwo")}
        <br />
      </p>
      <h3 className="govuk-heading-s">{t("ccPendingTitleTwo")}</h3>
      <ol className="govuk-list govuk-list--number govuk-!-font-size-16">
        <li>
          <strong>{t("ccPendingTextLiOne")}</strong>
        </li>
        <li>
          <strong>{t("ccPendingTextLiTwoBold")}</strong> {t("ccPendingTextLiTwo")}
          <ul className="govuk-list govuk-list--bullet govuk-!-font-size-16">
            <li>{t("ccPendingTextLiThree")}</li>
            <li>{t("ccPendingTextLiFour")}</li>
          </ul>
        </li>
        <li>
          <strong>{t("ccPendingTextLiFiveBold")} </strong>
          {t("ccPendingTextLiFive")}
        </li>
      </ol>
      <h3 className="govuk-heading-s">{t("ccPendingTitleThree")}</h3>
      <ol className="govuk-list govuk-list--number govuk-!-font-size-16">
        <li>
          <strong>{t("ccPendingTitleThreeTextOne")}</strong>
        </li>
        <li>
          <strong>{t("ccPendingTitleThreeTextTwo")}</strong>
        </li>
        <li>
          <strong>{t("ccPendingTitleThreeTextThree")}</strong>
        </li>
      </ol>

      <p className="govuk-body">{t("ccPendingLastText")}</p>

      <Link to="/create-catch-certificate/catch-certificates" aria-label="Opens link for information on dashbord page">
        {t("ccPendingLink")}
      </Link>
    </Main>
  );
};

export default CatchCertificatePending;
