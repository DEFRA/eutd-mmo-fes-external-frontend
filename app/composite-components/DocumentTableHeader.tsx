import { useTranslation } from "react-i18next";
import type { Journey } from "~/types";

type DocumentTableHeaderProps = {
  journey: Journey;
  showDateStarted?: boolean;
  showStatus?: boolean;
};

export const DocumentTableHeader = ({
  journey,
  showDateStarted = false,
  showStatus = false,
  showEuCatchIntegration = true,
}: DocumentTableHeaderProps) => {
  const { t } = useTranslation(["common"]);

  return (
    <thead className="govuk-table__head">
      <tr className="govuk-table__row">
        <th scope="col" className="govuk-table__header">
          {t("commonDocumentNumber")}
        </th>
        <th scope="col" className="govuk-table__header">
          {t("commonDashboardYourReference")}
        </th>
        <th scope="col" className="govuk-table__header">
          {showDateStarted ? t("commonDashboardDateStarted") : t("commonDashboardDateCreated")}
        </th>
        {showStatus && journey === "catchCertificate" && (
          <th scope="col" className="govuk-table__header">
            {t("commonDashboardStatus")}
          </th>
        )}
        {showEuCatchIntegration && (
          <th scope="col" className="govuk-table__header">
            {t("commonEuCatchIntegration")}
          </th>
        )}
        <th scope="col" className="govuk-table__header govuk-table__header--numeric">
          {t("commonDashboardAction")}
        </th>
      </tr>
    </thead>
  );
};
