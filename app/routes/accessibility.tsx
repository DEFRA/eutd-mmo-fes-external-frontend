import * as React from "react";
import { Main, Title } from "~/components";
import { useTranslation } from "react-i18next";
import { type LoaderFunction } from "@remix-run/node";
import { getBearerTokenForRequest } from "~/.server";

export const loader: LoaderFunction = async ({ request }) => await getBearerTokenForRequest(request);

const Accessibility = () => {
  const { t } = useTranslation("accessibility");

  return (
    <Main showHelpLink={false}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("accessibilityHeader")} />
          <p>
            {t("accessibilityFirstParagraphText_1")} &nbsp;
            <a className="govuk-link" href="https://www.gov.uk" aria-label="Opens link for GOV.UK">
              {t("accessibilityFirstParagraphLink_1")}
            </a>
            {t("accessibilityFirstParagraphText_2")} &nbsp;
            <a
              className="govuk-link"
              href="https://www.gov.uk/help/accessibility-statement"
              aria-label="Opens link for accessibility statement for main gov.uk site"
            >
              {t("accessibilityFirstParagraphLink_2")}
            </a>
          </p>
          <p>
            {t("accessibilitySecondParagraph")}
            <br />
            <a className="govuk-link" href="/" aria-label="Opens link for information on fish export service">
              https://manage-fish-exports.service.gov.uk/
            </a>
          </p>
          <br />
          <h2 className="govuk-heading-m">{t("usingThisServiceHeading")}</h2>
          <p>{t("usingThisServiceParagraph_1")}</p>
          <ul className="govuk-list--bullet">
            <li>{t("usingThisServiceListItem_1")}</li>
            <li>{t("usingThisServiceListItem_2")}</li>
            <li>{t("usingThisServiceListItem_3")}</li>
            <li>{t("usingThisServiceListItem_4")}</li>
            <li>{t("usingThisServiceListItem_5")}</li>
          </ul>
          <p>{t("usingThisServiceParagraph_2")}</p>
          <p>
            {t("usingThisServiceParagraph_3Text_1")}
            <a
              className="govuk-link"
              href="https://mcmw.abilitynet.org.uk/"
              aria-label="Opens link about using your device if you have disability"
            >
              {t("abilityNetLink")}
            </a>{" "}
            {t("usingThisServiceParagraph_3")}
          </p>
          <br />

          <h2 className="govuk-heading-m">{t("feebackAndContactInfoHeading")}</h2>
          <p>{t("feebackAndContactInfoParagraph_1")}</p>
          <ul className="govuk-list--bullet">
            <li>
              {t("feebackAndContactInfoListItem")}{" "}
              <a className="govuk-link" href="tel:0330 159 1989 ">
                0330 159 1989
              </a>
            </li>
          </ul>
          <p>{t("feebackAndContactInfoParagraph_2")}</p>
          <br />

          <h2 className="govuk-heading-m">{t("reportingAccessibilityProblemsHeading")}</h2>
          <p>
            {t("reportingAccessibilityProblemsParagraph")} {"("}
            <a className="govuk-link" href="mailto:dominic.Horsfall@marinemanagement.org.uk">
              {t("reportingAccessibilityProblemsEmailLink")}
            </a>
            {")"}
          </p>
          <br />
          <h2 className="govuk-heading-m">{t("enforcementProcedureHeading")}</h2>
          <p>
            {t("enforcementProcedureParagraph")} &nbsp;
            <a
              className="govuk-link"
              href="https://www.equalityadvisoryservice.com/"
              aria-label="Opens link to information about equality advisory service"
            >
              {t("enforcementProcedureLink")}
            </a>
          </p>
          <br />

          <h2 className="govuk-heading-m">{t("contactOrVisitHeading")}</h2>
          <p>{t("contactOrVisitParagraph_1")}</p>
          <p>{t("contactOrVisitParagraph_2")}</p>
          <p>
            {t("contactOrVisitParagraph_3")} &nbsp;
            <a
              className="govuk-link"
              href="https://www.gov.uk/contact-local-marine-management-organisation"
              aria-label="Opens link to Contact your local Marine Management Organisation office"
            >
              {t("contactOrVisitLink")}
            </a>
          </p>
          <br />

          <h2 className="govuk-heading-m">{t("technicalInformationHeading")}</h2>
          <p>{t("technicalInformationParagraph")}</p>
          <br />

          <h3 className="govuk-heading-m">{t("complianceStatusHeading")}</h3>
          <p>
            {t("complianceStatusParagraphText_1")}{" "}
            <a
              className="govuk-link"
              href="https://www.w3.org/TR/WCAG21/"
              aria-label="Opens link to Web Content Accessibility Guidelines"
            >
              {t("complianceStatusLink")}
            </a>
          </p>
          <br />

          <h3 className="govuk-heading-m">{t("disproportionateBurdenHeading")}</h3>
          <p>{t("disproportionateBurdenParagraph_1")}</p>
          <ul className="govuk-list--bullet">
            <li>{t("disproportionateBurdenListItem")}</li>
          </ul>
          <br />

          <h2 className="govuk-heading-m">{t("improveAccessibilityHeading")}</h2>
          <p>{t("improveAccessibilityParagraph")}</p>
          <ul className="govuk-list--bullet">
            <li>{t("improveAccessibilityListItem_1")}</li>
            <li>{t("improveAccessibilityListItem_2")}</li>
          </ul>
          <br />
          <h2 className="govuk-heading-m">{t("statementPreparationHeading")}</h2>
          <p>{t("statementPreparationParagraph_1")}</p>
          <p>
            {t("statementPreparationParagraph_2")}{" "}
            <a className="govuk-link" href="https://digitalaccessibilitycentre.org/">
              {t("statementPreperationParagraphLink")}
            </a>
          </p>
          <br />
        </div>
      </div>
    </Main>
  );
};
export default Accessibility;
