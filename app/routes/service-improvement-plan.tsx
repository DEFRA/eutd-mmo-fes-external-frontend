import * as React from "react";
import { Main, Title } from "~/components";
import { useTranslation } from "react-i18next";
import { type LoaderFunction } from "@remix-run/node";
import { getBearerTokenForRequest } from "~/.server";

export const loader: LoaderFunction = async ({ request }) => await getBearerTokenForRequest(request);

const ServiceImprovement = () => {
  const { t } = useTranslation(["serviceImprovement"]);
  return (
    <Main showHelpLink={false}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("serviceImprovementTitle")} />
          <br></br>
          <p className="govuk-body">
            {t("theImprovement")} <strong>{t("fishServiceBold")}</strong> {t("firstParagraphImprovement")}
          </p>
          <p className="govuk-body">{t("secondParagraphImprovement")}</p>
          <ul className="govuk-list govuk-list--bullet govuk-list--spaced">
            <li>{t("firstListOneImprovement")}</li>
            <li>{t("firstListTwoImprovement")}</li>
            <li>{t("firstListThreeImprovement")}</li>
            <li>
              {t("firstListFourImprovement")} <span className="govuk-visually-hidden"></span>
              <a
                className="govuk-link"
                href="https://www.gov.uk/service-manual/service-standard"
                rel="noopener noreferrer"
                target="_blank"
              >
                {t("firstImprovementLink")}
              </a>
            </li>
          </ul>
          <br></br>
          <p className="govuk-body">{t("thirdParagraphImprovement")}</p>
          <ul className="govuk-list govuk-list--bullet govuk-list--spaced">
            <li>{t("secondListOneImprovement")}</li>
            <li>{t("secondListTwoImprovement")}</li>
            <li>{t("secondListThirdImprovement")}</li>
          </ul>
          <br></br>
          <p className="govuk-body">
            {t("yourImprovement")} <span className="govuk-visually-hidden"> </span>
            <a
              className="govuk-link"
              href="https://defragroup.eu.qualtrics.com/jfe/form/SV_3q6Yrf53I3bdoCa"
              rel="noopener noreferrer"
              target="_blank"
            >
              {t("secondImprovementLink")}
            </a>
            <span className="govuk-visually-hidden"> </span> {t("lastParagraphImprovement")}
          </p>
        </div>
      </div>
    </Main>
  );
};

export default ServiceImprovement;
