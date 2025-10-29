import { useTranslation } from "react-i18next";
import { Details } from "@capgeminiuk/dcx-react-library";

interface SpeciesDetailsProps {
  speciesExemptLink: string;
  documentType: string;
}

export const SpeciesDetails = ({ speciesExemptLink, documentType }: SpeciesDetailsProps) => {
  const { t } = useTranslation();

  return (
    <Details
      summary={t("commonAddCatchDetailsSpeciesDetailsLinkTitle")}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
      summaryTextProps={{ id: "species-details" }}
    >
      <>
        <p>{t("ccAddCatchDetailsSpeciesDetailsBestResults")}</p>
        <p>
          {t("ccAddCatchDetailsSomeSpecies")}:&nbsp;
          <a href={speciesExemptLink} className="govuk-link" rel="noopener noreferrer" target="_blank">
            {t("ccAddCatchDetailsSomeSpeciesLinkText", {
              exemptFrom: documentType,
            })}
            <span className="govuk-visually-hidden">{t("commonSpeciesDetailsOpenInNewTab", { ns: "common" })}</span>
          </a>
        </p>
        <p>{t("ccAddCatchDetailsSpeciesDetailsCannotFindSpecies")}&nbsp;0330 159 1989.</p>
      </>
    </Details>
  );
};
