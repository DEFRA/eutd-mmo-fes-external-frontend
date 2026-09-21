import { Title } from "~/components";
import { useTranslation } from "react-i18next";

export const PrivacyNotice = () => {
  const { t } = useTranslation(["privacyNotice", "common"]);
  const openInNewTabText = t("commonHelpLinkOpenInNewTab", { ns: "common" });
  const bulletListClassName = "govuk-list govuk-list--bullet";

  const renderExternalLink = (href: string, labelKey: string) => (
    <a
      className="govuk-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${t(labelKey)} ${openInNewTabText}`}
    >
      {t(labelKey)}
    </a>
  );

  const dataControllerKeys = [
    "privacyPageDataControllersLi1",
    "privacyPageDataControllersLi2",
    "privacyPageDataControllersLi3",
    "privacyPageDataControllersLi4",
    "privacyPageDataControllersLi5",
    "privacyPageDataControllersLi6",
  ];
  const vesselDetailKeys = [
    "privacyPageWhatDataVesselLi1",
    "privacyPageWhatDataVesselLi2",
    "privacyPageWhatDataVesselLi3",
    "privacyPageWhatDataVesselLi4",
    "privacyPageWhatDataVesselLi5",
    "privacyPageWhatDataVesselLi6",
    "privacyPageWhatDataVesselLi7",
  ];
  const performanceStatsKeys = [
    "privacyPagePerformanceStatsLi1",
    "privacyPagePerformanceStatsLi2",
    "privacyPagePerformanceStatsLi3",
    "privacyPagePerformanceStatsLi4",
    "privacyPagePerformanceStatsLi5",
  ];
  const performanceDocumentInsightKeys = [
    "privacyPagePerformanceDocInsightsLi1",
    "privacyPagePerformanceDocInsightsLi2",
    "privacyPagePerformanceDocInsightsLi3",
    "privacyPagePerformanceDocInsightsLi4",
  ];
  const performanceCompanyInsightKeys = [
    "privacyPagePerformanceCompanyInsightsLi1",
    "privacyPagePerformanceCompanyInsightsLi2",
    "privacyPagePerformanceCompanyInsightsLi3",
    "privacyPagePerformanceCompanyInsightsLi4",
    "privacyPagePerformanceCompanyInsightsLi5",
  ];
  const obtainedFromKeys = ["privacyPageObtainedLi1", "privacyPageObtainedLi2", "privacyPageObtainedLi3"];
  const sharingLegislationKeys = [
    "privacyPageSharingLi1",
    "privacyPageSharingLi2",
    "privacyPageSharingLi3",
    "privacyPageSharingLi4",
    "privacyPageSharingLi5",
    "privacyPageSharingLi6",
  ];
  const automatedDecisionKeys = ["privacyPageAutomatedLi1", "privacyPageAutomatedLi2"];
  const publicTaskRightsKeys = [
    "privacyPageRightsPublicTaskLi1",
    "privacyPageRightsPublicTaskLi2",
    "privacyPageRightsPublicTaskLi3",
    "privacyPageRightsPublicTaskLi4",
    "privacyPageRightsPublicTaskLi5",
    "privacyPageRightsPublicTaskLi6",
  ];
  const legalObligationRightsKeys = [
    "privacyPageRightsLegalObligationLi1",
    "privacyPageRightsLegalObligationLi2",
    "privacyPageRightsLegalObligationLi3",
    "privacyPageRightsLegalObligationLi4",
    "privacyPageRightsLegalObligationLi5",
  ];

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <Title className="govuk-!-margin-bottom-5" title={t("privacyPageOpeningHeading")} />
        <p>
          <strong>{t("privacyPagePublishedDate")}</strong>
        </p>
        <p>
          {t("privacyPageJointControllersPrefix")}
          {renderExternalLink(
            "https://www.gov.uk/government/organisations/marine-management-organisation/about/personal-information-charter",
            "privacyPageOpeningCharterLinkText"
          )}
          {t("privacyPageJointControllersSuffix")}
        </p>
        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
        <h2 className="govuk-heading-l">{t("privacyPageTitleText")}</h2>
        <p>{t("privacyPageIntro1")}</p>
        <p dangerouslySetInnerHTML={{ __html: t("privacyPageIntro2") }} />
        <p>{t("privacyPageIntro3")}</p>
        <p>{t("privacyPageDataControllersIntro")}</p>
        <ul className={bulletListClassName}>
          {dataControllerKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>

        <h2 className="govuk-heading-l">{t("privacyPagePurposeHeading")}</h2>
        <p>{t("privacyPagePurposeDesc1")}</p>
        <p>{t("privacyPagePurposeDesc2")}</p>
        <p>{t("privacyPagePurposeDesc3")}</p>
        <p>{t("privacyPagePurposeDesc4")}</p>
        <p>{t("privacyPagePurposeDesc5")}</p>
        <p>
          {t("privacyPagePurposeDesc6Prefix")}
          {renderExternalLink("https://privacy.microsoft.com/privacystatement", "privacyPageMicrosoftLinkText")}
          {t("privacyPagePurposeDesc6Suffix")}
        </p>
        <p>{t("privacyPagePurposeDesc7")}</p>

        <h2 className="govuk-heading-l">{t("privacyPageWhatDataHeading")}</h2>
        <p>{t("privacyPageWhatDataDesc")}</p>
        <ul className={bulletListClassName}>
          <li>{t("privacyPageWhatDataLi1")}</li>
          <li>{t("privacyPageWhatDataLi2")}</li>
          <li>{t("privacyPageWhatDataLi3")}</li>
          <li>{t("privacyPageWhatDataLi4")}</li>
          <li>{t("privacyPageWhatDataLi5")}</li>
          <li>
            <div>{t("privacyPageWhatDataLi6")}</div>
            <ul className={bulletListClassName}>
              {vesselDetailKeys.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </li>
          <li>{t("privacyPageWhatDataLi7")}</li>
          <li>{t("privacyPageWhatDataLi8")}</li>
        </ul>
        <p>{t("privacyPagePerformanceDesc")}</p>
        <h3 className="govuk-heading-m">{t("privacyPagePerformanceStatsHeading")}</h3>
        <ul className={bulletListClassName}>
          {performanceStatsKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <h3 className="govuk-heading-m">{t("privacyPagePerformanceInfoHeading")}</h3>
        <ul className={bulletListClassName}>
          <li>
            <h3 className="govuk-heading-m">{t("privacyPagePerformanceDocInsights")}</h3>
            <ul className={bulletListClassName}>
              {performanceDocumentInsightKeys.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </li>
          <li>
            <h3 className="govuk-heading-m">{t("privacyPagePerformanceCompanyInsights")}</h3>
            <ul className={bulletListClassName}>
              {performanceCompanyInsightKeys.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </li>
        </ul>
        <p>{t("privacyPagePerformanceClarityDesc")}</p>

        <h2 className="govuk-heading-l">{t("privacyPageObtainedHeading")}</h2>
        <p>{t("privacyPageObtainedDesc")}</p>
        <ul className={bulletListClassName}>
          {obtainedFromKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>

        <h2 className="govuk-heading-l">{t("privacyPageLawfulBasisHeading")}</h2>
        <p>{t("privacyPageLawfulBasisDesc1")}</p>
        <p>{t("privacyPageLawfulBasisDesc2")}</p>
        <p>{t("privacyPageLawfulBasisDesc3")}</p>
        <p>{t("privacyPageLawfulBasisDesc4")}</p>

        <h2 className="govuk-heading-l">{t("privacyPageConsentHeading")}</h2>
        <p>{t("privacyPageConsentDesc")}</p>

        <h2 className="govuk-heading-l">{t("privacyPageSharingHeading")}</h2>
        <p dangerouslySetInnerHTML={{ __html: t("privacyPageSharingDesc1") }} />
        <p>{t("privacyPageSharingDesc2")}</p>
        <p>{t("privacyPageSharingDesc3")}</p>
        <p>{t("privacyPageSharingDesc4")}</p>
        <p>{t("privacyPageSharingDesc5")}</p>
        <ul className={bulletListClassName}>
          {sharingLegislationKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <p>{t("privacyPageSharingDesc6")}</p>

        <h2 className="govuk-heading-l">{t("privacyPageRetentionHeading")}</h2>
        <p>{t("privacyPageRetentionDesc1")}</p>
        <p>{t("privacyPageRetentionDesc2")}</p>
        <p>{t("privacyPageRetentionDesc3")}</p>
        <p>
          {t("privacyPageRetentionDesc4Prefix")}
          {renderExternalLink(
            "https://www.gov.uk/government/organisations/marine-management-organisation/about/personal-information-charter",
            "privacyPagePersonalInformationCharterLinkText"
          )}
          {t("privacyPageRetentionDesc4Middle")}
          {renderExternalLink(
            "https://www.gov.uk/government/organisations/marine-management-organisation/about/personal-information-charter#how-long-we-will-keep-data",
            "privacyPageHowLongWeKeepDataLinkText"
          )}
          {t("privacyPageRetentionDesc4Suffix")}
        </p>

        <h2 className="govuk-heading-l">{t("privacyPageAutomatedHeading")}</h2>
        <p>{t("privacyPageAutomatedDesc")}</p>
        <ul className={bulletListClassName}>
          {automatedDecisionKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>

        <h2 className="govuk-heading-l">{t("privacyPageNoDataHeading")}</h2>
        <p>{t("privacyPageNoDataDesc")}</p>

        <h2 className="govuk-heading-l">{t("privacyPageTransferHeading")}</h2>
        <p>{t("privacyPageTransferDesc1")}</p>
        <p>
          {renderExternalLink(
            "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/international-transfers/adequacy-regulations/",
            "privacyPageTransferAdequacyLinkText"
          )}
        </p>
        <p>{t("privacyPageTransferDesc2")}</p>
        <p>{t("privacyPageTransferDesc3")}</p>
        <p>{t("privacyPageTransferDesc4")}</p>

        <h2 className="govuk-heading-l">{t("privacyPageRightsHeading")}</h2>
        <p>{t("privacyPageRightsDesc1")}</p>
        <h3 className="govuk-heading-m">{t("privacyPageRightsPublicTaskHeading")}</h3>
        <ul className={bulletListClassName}>
          {publicTaskRightsKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <h3 className="govuk-heading-m">{t("privacyPageRightsLegalObligationHeading")}</h3>
        <ul className={bulletListClassName}>
          {legalObligationRightsKeys.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
        <p>{t("privacyPageRightsDesc2")}</p>
        <p>
          {t("privacyPageRightsDesc3Prefix")}
          {renderExternalLink(
            "https://www.gov.uk/government/organisations/marine-management-organisation/about/personal-information-charter",
            "privacyPagePersonalInformationCharterLinkText"
          )}
          {t("privacyPageRightsDesc3Suffix")}
        </p>

        <h2 className="govuk-heading-l">{t("privacyPageContactHeading")}</h2>
        <p>
          {t("privacyPageContactDesc1Prefix")}
          {renderExternalLink(
            "https://www.gov.uk/government/organisations/marine-management-organisation/about/personal-information-charter",
            "privacyPagePersonalInformationCharterLinkText"
          )}
          {t("privacyPageContactDesc1Suffix")}
        </p>
        <p>{t("privacyPageContactDesc2")}</p>
        <p>
          Data Protection Team,
          <br />
          Marine Management Organisation,
          <br />
          Tyneside House
          <br />
          Skinnerburn Road
          <br />
          Newcastle upon Tyne
          <br />
          NE4 7AR
        </p>
        <p>
          {t("email")}:{" "}
          <a className="govuk-link" href="mailto:dataprotection@marinemanagement.org.uk">
            dataprotection@marinemanagement.org.uk
          </a>
        </p>
        <p>{t("privacyPageContactDesc3")}</p>
        <p>{t("privacyPageContactDesc4")}</p>
        <p>
          DPO
          <br />
          Defra Group DPO Office, 4th Floor,
          <br />
          Seacole, Marsham Street,
          <br />
          Westminster
          <br />
          London
          <br />
          SW1P 4DF
        </p>
        <p>
          {t("email")}:{" "}
          <a className="govuk-link" href="mailto:DefraGroupDataProtectionOfficer@defra.gov.uk">
            DefraGroupDataProtectionOfficer@defra.gov.uk
          </a>
        </p>

        <h3 className="govuk-heading-m">{t("privacyPageOtherControllersHeading")}</h3>
        <p>
          Department of Environment, Food and Agriculture
          <br />
          Thie Slieau Whallian
          <br />
          Foxdale Road
          <br />
          St John’s,
          <br />
          Isle of Man
          <br />
          IM4 3AS
        </p>
        <p>
          {t("email")}:{" "}
          <a className="govuk-link" href="mailto:fisheries@gov.im">
            fisheries@gov.im
          </a>
        </p>
        <p>
          Marine Directorate (Scotland)
          <br />
          Data Protection and Information Assets Team
          <br />
          V Spur
          <br />
          Saughton House
          <br />
          Broomhouse Drive
          <br />
          EDINBURGH
          <br />
          EH11 3XD
        </p>
        <p>
          {t("email")}:{" "}
          <a className="govuk-link" href="mailto:dpa@gov.scot">
            dpa@gov.scot
          </a>
        </p>
        <p>
          Welsh Government
          <br />
          Data Protection Officer
          <br />
          Welsh Government
          <br />
          Cathays Park
          <br />
          Cardiff
          <br />
          CF10 3NQ
        </p>
        <p>
          {t("email")}:{" "}
          <a className="govuk-link" href="mailto:Data.ProtectionOfficer@gov.wales">
            Data.ProtectionOfficer@gov.wales
          </a>
        </p>
        <p>
          Department of Agriculture, Environment and Rural Affairs
          <br />
          Ballykelly House,
          <br />
          111 Ballykelly Road
          <br />
          Ballykelly,
          <br />
          LIMAVADY
          <br />
          BT49 9HP
          <br />
          {t("telephone")}: 028 7744 2350
        </p>
        <p>
          {t("email")}:{" "}
          <a className="govuk-link" href="mailto:dataprotectionofficer@daera-ni.gov.uk">
            dataprotectionofficer@daera-ni.gov.uk
          </a>
        </p>
        <p>
          Jersey
          <br />
          Marine Resources, Marine Department of Environment,
          <br />
          Howard Davis Farm,
          <br />
          La Route de la Trinité,
          <br />
          Trinity, Jersey,
          <br />
          JE3 5JP
        </p>
        <p>
          Guernsey
          <br />
          PO Box 459,
          <br />
          Raymond Falla House,
          <br />
          Longue Rue,
          <br />
          St Martin,
          <br />
          Guernsey,
          <br />
          GY1 1AF
        </p>
      </div>
    </div>
  );
};
