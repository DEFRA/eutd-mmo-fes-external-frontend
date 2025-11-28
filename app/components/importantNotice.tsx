import * as React from "react";
import { useTranslation } from "react-i18next";

type ImportantNoticeProps = {
  messageKey: string;
};

export const ImportantNotice = ({ messageKey }: ImportantNoticeProps) => {
  const { t } = useTranslation("common");

  return (
    <div className="govuk-warning-text">
      <span className="govuk-warning-text__icon" aria-hidden="true">
        !
      </span>
      <strong className="govuk-warning-text__text">
        <span className="govuk-visually-hidden">Warning</span>
        {t(messageKey)}
      </strong>
    </div>
  );
};

export default ImportantNotice;
