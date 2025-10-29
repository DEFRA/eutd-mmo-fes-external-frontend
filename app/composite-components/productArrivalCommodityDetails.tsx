import { useTranslation } from "react-i18next";
import { Details } from "@capgeminiuk/dcx-react-library";

export const ProductArrivalCommodityDetails = ({ commodityCodeLink }: { commodityCodeLink: string }) => {
  const { t } = useTranslation();

  return (
    <Details
      detailsClassName="govuk-details"
      summary={t("commodityCodeGuidanceTitle", { ns: "addProductToThisConsignment" })}
      summaryTextProps={{ id: "commody-code-details" }}
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
    >
      <p>
        {t("commodityCodeGuidanceTextOne", { ns: "addProductToThisConsignment" })}&nbsp;
        <a href={commodityCodeLink} className="govuk-link" rel="noopener noreferrer" target="_blank">
          {t("commodityCodeGuidanceTextTwo", { ns: "addProductToThisConsignment" })}
        </a>
      </p>
    </Details>
  );
};
