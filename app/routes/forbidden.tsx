import * as React from "react";
import { Main, Title } from "~/components";
import { useTranslation } from "react-i18next";

const Forbidden = () => {
  const { t } = useTranslation("forbidden");

  return (
    <Main showHelpLink={false}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <Title title={t("forbiddenH1Text")} />
          <p data-testid="no-permission">{t("forbiddenPageP1Text")}</p>
          <p data-testid="navigate-back">{t("forbiddenPageP2Text")}</p>
        </div>
      </div>
    </Main>
  );
};
export default Forbidden;
