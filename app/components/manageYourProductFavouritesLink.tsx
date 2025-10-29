import { Link } from "@remix-run/react";
import { route } from "routes-gen";
import { useTranslation } from "react-i18next";

export const ManageYourProductFavouritesLink = ({ href = route("/manage-favourites") }: { href?: string }) => {
  const { t } = useTranslation("favourites");
  return (
    <Link to={href} id="manageYourProductFavourites" className="govuk-link" reloadDocument>
      {t("ccProductFavouriteDetailSummary3ParagraphText")}
    </Link>
  );
};
