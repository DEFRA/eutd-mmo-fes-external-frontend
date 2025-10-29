import { Title } from "~/components";
import { useTranslation } from "react-i18next";

export const PrivacyNotice = () => {
  const { t } = useTranslation(["privacyNotice", "common"]);
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <Title className="govuk-!-margin-bottom-5" title={t("privacyPageTitleText")} />
        <p>{t("privacyPageDescription1")}</p>
        <p>{t("privacyPageDescription2")}</p>
        <p>&nbsp;</p>
        <h2 className="govuk-heading-l">{t("privacyPagePersonalInfoText")}</h2>
        <p className="govuk-!-margin-bottom-1">{t("privacyPagePersonalInfoDescription")}</p>
        <p>{t("privacyPagePersonalInfoUlText")}</p>
        <ul className="govuk-list--bullet">
          <li>{t("privacyPagePersonalInfoLiText1")}</li>
          <li>{t("privacyPagePersonalInfoLiText2")}</li>
          <li>{t("privacyPagePersonalInfoLiText3")}</li>
          <li>{t("privacyPagePersonalInfoLiText4")}</li>

          <li>
            <div>{t("privacyPagePersonalInfoLiText5")}</div>
            <ul>
              <li>{t("privacyPagePersonalInfoLiText6")}</li>
              <li>{t("privacyPagePersonalInfoLiText7")}</li>
              <li>{t("privacyPagePersonalInfoLiText8")}</li>
              <li>{t("privacyPagePersonalInfoLiText9")}</li>
              <li>{t("privacyPagePersonalInfoLiText10")}</li>
              <li>{t("privacyPagePersonalInfoLiText11")}</li>
              <li>{t("privacyPagePersonalInfoLiText12")}</li>
            </ul>
          </li>
          <li>{t("privacyPagePersonalInfoLiText13")}</li>
          <li>{t("privacyPagePersonalInfoLiText14")}</li>
        </ul>
        <br />
        <p className="govuk-!-margin-top-0">{t("privacyPagePersonalInfoDescription2")}</p>
        <p>{t("privacyPagePerformanceStatus")}</p>
        <ul className="govuk-list--bullet">
          <li>{t("privacyPagePerformanceStatusli1")}</li>
          <li>{t("privacyPagePerformanceStatusli2")}</li>
          <li>{t("privacyPagePerformanceStatusli3")}</li>
          <li>{t("privacyPagePerformanceStatusli4")}</li>
          <li>{t("privacyPagePerformanceStatusli5")}</li>
        </ul>
        <br />
        <p>{t("personalInformationText")}</p>
        <ul className="govuk-list--bullet">
          <li>
            <div>{t("privacyPagePerformanceInformationUl1")}</div>
            <ul>
              <li>{t("privacyPagePerformanceInformationli1")}</li>
              <li>{t("privacyPagePerformanceInformationli2")}</li>
              <li>{t("privacyPagePerformanceInformationli3")} </li>
              <li>{t("privacyPagePerformanceInformationli4")}</li>
            </ul>
          </li>
          <li>
            <div>{t("privacyPagePerformanceInformationUl2")}</div>
            <ul>
              <li>{t("privacyPagePerformanceInformationUl21")}</li>
              <li>{t("privacyPagePerformanceInformationUl22")}</li>
              <li>{t("privacyPagePerformanceInformationUl23")}</li>
              <li>{t("privacyPagePerformanceInformationUl24")}</li>
              <li>{t("privacyPagePerformanceInformationUl25")}</li>
            </ul>
          </li>
        </ul>
        <br />
        <p>
          {t("privacyPagePerformanceInformation1")}
          <a
            className="govuk-link"
            href="https://privacy.microsoft.com/privacystatement"
            target="_blank"
            rel="noreferrer"
            aria-label={t("privacyPagePerformanceInformation1AriaLabel")}
          >
            {t("privacyPagePerformanceInformation1AnchorText")}
          </a>
        </p>
        <p>{t("privacyPagePerformanceInformation2")}</p>
        <h2>{t("privacyPageHeading1")}</h2>
        <p>{t("privacyPageHeading1Description")}</p>
        <span className="govuk-label--s">{t("privacyPageProtectionOfficerText")}</span> <br />
        <br />
        <p>
          Defra Group DPO Office, 4th Floor, <br />
          Seacole, Marsham Street,
          <br />
          Westminster
          <br />
          London
          <br />
          SW1P 4DF
          <br />
          <a className="govuk-link" href="mailto:DefraGroupDataProtectionOfficer@defra.gov.uk">
            DefraGroupDataProtectionOfficer@defra.gov.uk
          </a>
        </p>
        <p>{t("privacyPageProtectionMarineFisheriesAuthorities")}</p>
        <p>{t("privacyPageProtectionAddressDataProtectionTeam")}</p>
        <p>
          Data Protection Team
          <br />
          Lancaster House
          <br />
          Hampshire Court
          <br />
          Newcastle Upon Tyne
          <br />
          NE4 7YH
          <br />
          <a className="govuk-link" href="mailto:data.protection@marinemanagement.org.uk">
            dataprotection@marinemanagement.org.uk
          </a>
        </p>
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
          <br />
          <a className="govuk-link" href="fisheries@gov.im">
            fisheries@gov.im
          </a>
        </p>
        <p>
          Marine Scotland
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
          <br />
          <a className="govuk-link" href="mailto:dpa@gov.scot">
            dpa@gov.scot
          </a>
        </p>
        <p>
          {t("privacyPageWelshGovernment")}
          <br />
          {t("privacyPageDataProtectionOfficer")}
          <br />
          {t("privacyPageWelshGovernment")}
          <br />
          {t("Cathays Park")}
          <br />
          {t("privacyPageCardiff")}
          <br />
          CF10 3NQ
          <br />
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
          <br />
          <a className="govuk-link" href="mailto:dataprotectionofficer@daera-ni.gov.uk">
            dataprotectionofficer@daera-ni.gov.uk
          </a>
        </p>
        <p>&nbsp;</p>
        <h2>{t("privacyPageHeading2")} </h2>
        <p>{t("privacyPageHeading2Desc1")}</p>
        <p>{t("privacyPageHeading2Desc2")}</p>
        <p>
          {t("privacyPageHeading2Desc3")} <br />
          <a
            className="govuk-link"
            href="https://www.gov.uk/government/organisations/marine-management-organisation"
            target="blank"
            aria-label="Opens link for information about MMO"
          >
            https://www.gov.uk/government/organisations/marine-management-organisation{" "}
            {t("commonHelpLinkOpenInNewTab", { ns: "common" })}
          </a>
        </p>
        <p>{t("privacyPageHeading2Desc4")}</p>
        <p>{t("privacyPageHeading2Desc5")}</p>
        <p>{t("privacyPageHeading2Desc6")}</p>
        <p>{t("privacyPageHeading2Desc7")}</p>
        <p>{t("privacyPageHeading2Desc8")}</p>
        <br />
        <h2>{t("privacyPageHeading3")}</h2>
        <p>{t("privacyPageHeading3Desc1")}</p>
        <p>{t("privacyPageHeading3Desc2")}</p>
        <p>{t("privacyPageHeading3Desc3")}</p>
        <ul className="govuk-list--bullet">
          <li>{t("privacyPageHeading3Li1")}</li>
          <li>{t("privacyPageHeading3Li2")}</li>
          <li>{t("privacyPageHeading3Li3")}</li>
          <li>{t("privacyPageHeading3Li4")}</li>
          <li>{t("privacyPageHeading3Li5")}</li>
          <li>{t("privacyPageHeading3Li6")}</li>
          <li>{t("privacyPageHeading3Li7")}</li>
          <li>{t("privacyPageHeading3Li8")}</li>
        </ul>
        <br />
        <h2>{t("privacyPageHeading4")}</h2>
        <p>{t("privacyPageHeading4Desc")}</p>
        <br />
        <h2>{t("privacyPageHeading5")}</h2>
        <p>{t("privacyPageHeading5Desc")}</p>
        <br />
        <h2>{t("privacyPageHeading6")}</h2>
        <p>{t("privacyPageHeading6Desc")}</p>
        <br />
        <h2>{t("youRights")}</h2>
        <p>{t("youRightDescription1")}</p>
        <p>{t("youRightDescription2")}</p>
        <p>{t("youRightDescription3")}</p>
        <p>{t("youRightDescription4")}</p>
        <p>
          <a
            className="govuk-link"
            href="https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/individual-rights/"
          >
            {t("privacyPageInformationCommissionerOffice")}
          </a>
        </p>
        <br />
        <h2>{t("HowDoIContact")}</h2>
        <p>{t("HowDoIContactDesc1")}</p>
        <p>{t("HowDoIContactDesc2")}</p>
        <p>
          Data Protection Team,
          <br />
          Marine Management Organisation,
          <br />
          Lancaster House,
          <br />
          Hampshire Court,
          <br />
          Monarch Road,
          <br />
          Newcastle upon Tyne, NE4 7YH
        </p>
        <p>
          {t("email")}:{" "}
          <a className="govuk-link" href="mailto:dataprotection@marinemanagement.org.uk">
            dataprotection@marinemanagement.org.uk
          </a>
        </p>
        <p>{t("HowDoIContactDesc3")}</p>
        <p>{t("HowDoIContactDesc4")}</p>
        <p>
          DPO
          <br />
          Defra
          <br />
          Department for the Environment, Food and Rural Affairs
          <br />
          2 Marsham Street
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
        <br />
        <h2>{t("HowDoIComplain")}</h2>
        <p>{t("HowDoIComplainDesc")}</p>
        <p>
          Information Commissioner's Office
          <br />
          Wycliffe House
          <br />
          Water Lane
          <br />
          Wilmslow
          <br />
          Cheshire
          <br />
          SK9 5AF
        </p>
        <p>{t("telephone")}:0303 123 1113</p>
        <p>
          {t("email")}:
          <a className="govuk-link" href="mailto:casework@ico.org.uk">
            casework@ico.org.uk
          </a>
        </p>
        <p>
          <a
            className="govuk-link"
            href="https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/individual-rights/"
          >
            {t("privacyPageInformationCommissionerOffice")}
          </a>
        </p>
        <h2>{t("HowDoIContactChangesPrivacyNotice")}</h2>
        <p>{t("HowDoIContactChangesPrivacyNoticeDesc")}</p>
      </div>
    </div>
  );
};
