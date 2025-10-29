import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

type BackToProgressLinkProps = {
  progressUri: string;
  documentNumber: string | undefined;
};

export const BackToProgressLink = ({ progressUri, documentNumber }: BackToProgressLinkProps) => {
  const { t } = useTranslation("common");
  return (
    <Link
      id="backToProgress"
      className="govuk-link"
      to={progressUri.replace(":documentNumber", documentNumber)}
      aria-label={t("commonBackToProgressLinkText")}
      reloadDocument
    >
      {t("commonBackToProgressLinkText")}
      <span className="govuk-visually-hidden">{t("commonBackToProgressHiddenText")}</span>
    </Link>
  );
};
