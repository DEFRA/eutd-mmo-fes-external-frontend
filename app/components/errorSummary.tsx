import type { IError, LinkData } from "~/types";
import { useTranslation } from "react-i18next";
import { scrollToId } from "~/helpers";

export interface IErrorSummaryProps {
  errors: IError[];
  containerClassName?: string;
  linkData?: LinkData[];
}

export const ErrorSummary = ({
  errors = [],
  containerClassName = "",
  linkData,
}: React.PropsWithChildren<IErrorSummaryProps>) => {
  const { t } = useTranslation(["errorsText", "common"]);

  const onChangeHandler: (e: React.FormEvent<HTMLAnchorElement>) => void = (e: React.FormEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const index = href.indexOf("#") + 1;
    scrollToId(href.slice(index));
  };

  return (
    <div
      id="errorIsland"
      className={`govuk-error-summary ${containerClassName}`}
      aria-labelledby="error-summary-title"
      role="alert"
      data-disable-auto-focus="true"
      data-module="govuk-error-summary"
    >
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        {t("commonErrorHeading", { ns: "common" })}
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errors.map((error: IError, index: number) => {
            const hasLinkData = linkData?.[index]?.href;

            return (
              <li key={error.key}>
                <a
                  href={hasLinkData ? linkData[index].href : `#${error.key}`}
                  {...(!hasLinkData && { onClick: onChangeHandler })}
                >
                  {error.value
                    ? t(error.message, { ...error.value, interpolation: { escapeValue: false } })
                    : t(error.message)}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
