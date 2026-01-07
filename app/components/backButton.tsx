import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

type BackButtonProps = {
  to: string;
};

export const BackButton = ({ to }: BackButtonProps) => {
  const { t } = useTranslation("common");
  return (
    <Link
      to={to}
      className="govuk-back-link govuk-!-margin-top-5 govuk-!-margin-bottom-0"
      aria-label={t("commonBackLinkBackButtonLabel")}
      reloadDocument
    >
      {t("commonBackLinkBackButtonLabel")}
    </Link>
  );
};
