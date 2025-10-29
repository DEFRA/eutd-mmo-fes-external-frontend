import { Details, List, ListItem, TYPE_LIST } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";

export const HighSeasAreasGuidance = () => {
  const { t } = useTranslation(["directLandings"]);

  return (
    <Details
      summary={t("ccAddLandingHSAGuidanceLabel")}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
    >
      <div>
        <p>{t("ccAddLandingHSAGuidanceDesc1Heading")}</p>
        <List type={TYPE_LIST.UNORDERED} className="govuk-list govuk-list--bullet">
          <ListItem>{t("ccAddLandingHSAGuidanceDesc1li1")}</ListItem>
          <ListItem>{t("ccAddLandingHSAGuidanceDesc1li2")}</ListItem>
        </List>
        <p>{t("ccAddLandingHSAGuidanceDesc2Heading")}</p>
        <List type={TYPE_LIST.UNORDERED} className="govuk-list govuk-list--bullet">
          <ListItem>{t("ccAddLandingHSAGuidanceDesc2li1")}</ListItem>
          <ListItem>{t("ccAddLandingHSAGuidanceDesc2li2")}</ListItem>
          <ListItem>{t("ccAddLandingHSAGuidanceDesc2li3")}</ListItem>
          <ListItem>{t("ccAddLandingHSAGuidanceDesc2li4")}</ListItem>
        </List>
        <p>{t("ccAddLandingHSAGuidanceDesc3Heading")}</p>
        <a href="https://www.fao.org/fishery/en/area/search" className="govuk-link" target="_blank" rel="noreferrer">
          {t("ccAddLandingHSAGuidanceDesc3LinkText")}
        </a>
      </div>
    </Details>
  );
};
