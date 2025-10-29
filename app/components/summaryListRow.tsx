import React from "react";

interface SummaryListRowProps {
  keyText: string | React.ReactNode;
  value: string | React.ReactNode;
  actions?: React.ReactNode;
}

const SummaryListRow: React.FC<SummaryListRowProps> = ({ keyText, value, actions }) => (
  <div className="govuk-summary-list__row">
    <dt className="govuk-summary-list__key govuk-!-width-one-half">{keyText}</dt>
    <dd className="govuk-summary-list__value">{value}</dd>
    <dd className="govuk-summary-list__actions">{actions}</dd>
  </div>
);

export default SummaryListRow;
