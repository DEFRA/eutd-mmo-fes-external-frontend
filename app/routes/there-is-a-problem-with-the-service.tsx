import * as React from "react";
import { useTranslation } from "react-i18next";
import { Main, Title } from "~/components";

const ErrorPage = () => {
  const { t } = useTranslation();

  return (
    <Main showHelpLink={false}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("commonErrorPageTitle")} />
          <p>{t("commonErrorPageTryagainText")}</p>
          <p>{t("commonErrorPagesaveText")}</p>
        </div>
      </div>
    </Main>
  );
};

export default ErrorPage;
