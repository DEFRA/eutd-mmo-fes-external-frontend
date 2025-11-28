import { useTranslation } from "react-i18next";
import { Details } from "@capgeminiuk/dcx-react-library";

export const CatchCertificateDetails = () => {
  const { t } = useTranslation();

  return (
    <Details
      summary={t("catchCertificateGuidanceTitle", { ns: "psAddCatchDetails" })}
      detailsClassName="govuk-details"
      summaryClassName="govuk-details__summary"
      detailsTextClassName="govuk-details__text"
      summaryTextProps={{ id: "catch-certificate-guidance" }}
    >
      <p>{t("catchCertificateGuidanceTextOne", { ns: "psAddCatchDetails" })}</p>
    </Details>
  );
};
