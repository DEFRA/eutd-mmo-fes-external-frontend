import type { IError, IValidationError, LinkData } from "~/types";
import { useTranslation } from "react-i18next";
import { scrollToId } from "~/helpers";
import { useEffect, useRef } from "react";

export interface IErrorSummaryProps {
  errors: (IError | IValidationError)[];
  containerClassName?: string;
  linkData?: LinkData[];
}

export const ErrorSummary = ({
  errors,
  containerClassName = "",
  linkData,
}: React.PropsWithChildren<IErrorSummaryProps>) => {
  const { t } = useTranslation(["errorsText", "common"]);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus the error summary when it mounts or when errors change
    errorSummaryRef.current?.focus();
    errorSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [errors]);

  const onChangeHandler: (e: React.FormEvent<HTMLAnchorElement>) => void = (e: React.FormEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.href;
    const index = href.indexOf("#") + 1;
    scrollToId(href.slice(index));
  };

  return (
    <div
      ref={errorSummaryRef}
      id="errorIsland"
      className={`govuk-error-summary ${containerClassName}`}
      aria-labelledby="error-summary-title"
      role="alert"
      tabIndex={-1}
      data-module="govuk-error-summary"
    >
      <h2 className="govuk-error-summary__title" id="error-summary-title">
        {t("commonErrorHeading", { ns: "common" })}
      </h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errors.map((error: IError | IValidationError, index: number) => {
            const hasLinkData = linkData?.[index]?.href;
            const errorKey = error.key;
            const errorHasValue = "value" in error && error.value;

            return (
              <li key={errorKey}>
                <a
                  href={hasLinkData ? linkData[index].href : `#${errorKey}`}
                  {...(!hasLinkData && { onClick: onChangeHandler })}
                >
                  {errorHasValue
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
