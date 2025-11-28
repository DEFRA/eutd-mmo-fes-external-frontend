import { Details } from "@capgeminiuk/dcx-react-library";
import * as React from "react";
import { useTranslation } from "react-i18next";

type AddLandingsVesselHelpContent = {
  namespace?: string;
};

export const AddLandingsVesselHelpContent = ({ namespace = "directLandings" }: AddLandingsVesselHelpContent) => {
  const { t } = useTranslation(namespace);

  return (
    <Details
      summary={t("ccAddLandingHelpSectionLinkText")}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
    >
      <>
        <p>{t("ccAddLandingHelpSectionContent")}</p>
        <p>{t("ccAddLandingHelpSectionContent2")}</p>
      </>
    </Details>
  );
};

export default AddLandingsVesselHelpContent;
