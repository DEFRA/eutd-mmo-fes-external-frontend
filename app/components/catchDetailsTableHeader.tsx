import { useTranslation } from "react-i18next";

type CatchDetailsTableHeaderProps = {
  headersToRender: string[];
};

export const CatchDetailsTableHeader = ({ headersToRender }: CatchDetailsTableHeaderProps) => {
  const { t } = useTranslation(["common"]);

  return (
    <thead className="govuk-table__head">
      <tr className="govuk-table__row">
        {headersToRender.map((headerText: string, index: number) => (
          <th scope="col" className="govuk-table__header" key={headerText} style={index === 0 ? { width: "20%" } : {}}>
            {headerText}
          </th>
        ))}
        <th
          scope="col"
          className="govuk-table__header govuk-!-padding-0 govuk-!-text-align-right govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-font-size-19 table-adjust-font"
          style={{ width: "17%" }}
        >
          {t("commonDashboardAction", { ns: "common" })}
        </th>
      </tr>
    </thead>
  );
};
