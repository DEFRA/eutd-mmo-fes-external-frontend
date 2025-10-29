import { useTranslation } from "react-i18next";
import { Details } from "@capgeminiuk/dcx-react-library";

interface ProductArrivalSpeciesDetailsProps {
  speciesExemptLink: string;
}

export const ProductArrivalSpeciesDetails = ({ speciesExemptLink }: ProductArrivalSpeciesDetailsProps) => {
  const { t } = useTranslation();

  return (
    <Details
      summary={t("speciesNameGuidanceTitle", { ns: "addProductToThisConsignment" })}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
      summaryTextProps={{ id: "species-details" }}
    >
      <>
        <p>{t("speciesNameGuidanceTextOne", { ns: "addProductToThisConsignment" })}</p>
        <p>
          {t("speciesNameGuidanceTextTwo", { ns: "addProductToThisConsignment" })}&nbsp;
          <a href={speciesExemptLink} className="govuk-link" rel="noopener noreferrer" target="_blank">
            {t("speciesNameGuidanceTextThree", { ns: "addProductToThisConsignment" })}
          </a>
        </p>
      </>
    </Details>
  );
};
