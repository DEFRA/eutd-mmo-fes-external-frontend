import isEmpty from "lodash/isEmpty";

type TableHeaderProps = {
  headersToRender: string[];
};

export const TableHeader = ({ headersToRender }: TableHeaderProps) => (
  <thead className="govuk-table__head">
    <tr className="govuk-table__row" role="row">
      {headersToRender.map((headerText: string) => {
        if (isEmpty(headerText)) {
          return <td scope="col" className="govuk-table__header govuk-font-size" role="columnheader" />;
        }

        return (
          <th scope="col" className="govuk-table__header govuk-font-size" role="columnheader" key={headerText}>
            {headerText}
          </th>
        );
      })}
    </tr>
  </thead>
);
