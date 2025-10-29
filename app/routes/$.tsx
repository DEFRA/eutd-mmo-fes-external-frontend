import * as React from "react";
import { route } from "routes-gen";
import { Main } from "~/components";
import { Link, useMatches } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { useIdleTimerContext } from "react-idle-timer";

const PageNotFound = () => {
  const { t } = useTranslation("pageNotFound");
  const [rootData] = useMatches();
  const { headerTitleTo } = rootData?.data ?? {};
  const idleTimer = useIdleTimerContext();
  idleTimer.pause();

  return (
    <Main showHelpLink={false}>
      <h1 className="govuk-heading-l govuk-!-margin-bottom-6">{t("page_not_found")}</h1>
      <p>
        {t("pageNotFound_first_line")}
        <p></p>
        {t("pageNotFound_second_line")}
        <p></p>
        {t("pageNotFound_3rd_line")}
        <Link className=" govuk-link" to={headerTitleTo ?? route("/create-catch-certificate/catch-certificates")}>
          {t("pageNotFound_check_document_progress")}
        </Link>
        {". "}
        {t("pageNotFound_save_message")}
      </p>
    </Main>
  );
};

export default PageNotFound;
