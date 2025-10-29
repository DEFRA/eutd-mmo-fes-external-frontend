import { useTranslation } from "react-i18next";
import { Details } from "@capgeminiuk/dcx-react-library";

export const EntryDocumentGuidanceText = () => {
  const { t } = useTranslation();
  return (
    <Details
      summary={t("entryDocumentGuidanceTitle", { ns: "addProductToThisConsignment" })}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
    >
      <>
        <p>{t("entryDocumentGuidanceTextOne", { ns: "addProductToThisConsignment" })}</p>
        <p>{t("entryDocumentGuidanceTextTwo", { ns: "addProductToThisConsignment" })}</p>
        <ul className="govuk-list govuk-list--bullet">
          <li key={t("entryDocumentGuidanceTextThree", { ns: "addProductToThisConsignment" })}>
            {t("entryDocumentGuidanceTextThree", { ns: "addProductToThisConsignment" })}
          </li>
          <li key={t("entryDocumentGuidanceTextFour", { ns: "addProductToThisConsignment" })}>
            {t("entryDocumentGuidanceTextFour", { ns: "addProductToThisConsignment" })}
          </li>
          <li key={t("entryDocumentGuidanceTextFive", { ns: "addProductToThisConsignment" })}>
            {t("entryDocumentGuidanceTextFive", { ns: "addProductToThisConsignment" })}
          </li>
        </ul>
      </>
    </Details>
  );
};
