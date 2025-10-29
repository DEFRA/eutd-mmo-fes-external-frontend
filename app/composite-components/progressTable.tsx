import toLower from "lodash/toLower";
import upperFirst from "lodash/startCase";
import { useTranslation } from "react-i18next";
import type { IProgressDataRow, IProgressDataSection } from "~/types";
import { ErrorMessage } from "~/components";

type Props = {
  progressData: Array<IProgressDataSection>;
  documentNumber: string;
};

export const ProgressTable = (props: Props) => {
  const { documentNumber, progressData } = props;
  const { t } = useTranslation(["progress", "common", "errorsText"]);

  const tagCssClasses: object = {
    OPTIONAL: "govuk-tag--grey",
    INCOMPLETE: "govuk-tag--light-blue",
    COMPLETED: "govuk-tag govuk-tag--blue",
    "CANNOT START": "govuk-tag--grey",
    ERROR: "govuk-tag--red",
  };
  const tagTitles: object = {
    "CANNOT START": "cannot_start_yet",
    ERROR: "submission_failed",
  };

  return (
    <ol className="app-task-list">
      {progressData.map((section: IProgressDataSection, index: number) => (
        <li key={section.title}>
          <h2 className="app-task-list__section" data-testid={`${section.testId}-heading`}>
            <span className="app-task-list__section-number">{index + 1}.</span>
            {t(section.title)}
          </h2>
          <ul className="app-task-list__items">
            {section.rows.map((row: IProgressDataRow) => (
              <li
                className={`app-task-list__item ${row.error !== undefined ? "govuk-form-group--error" : ""}`}
                data-testid={`progress-${row.testId}-wrapper`}
                key={row.testId}
                id={row.testId}
              >
                {row.error && (
                  <ErrorMessage
                    text={t(row.error.message, { ns: "errorsText" })}
                    key={row.error.key}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                {row.status === "CANNOT START" ? (
                  <span id={row.testId} data-testid={`progress-${row.testId}-title-blocked`} aria-label={t(row.title)}>
                    {t(row.title)}
                  </span>
                ) : (
                  <a
                    href={row.url.replace(":documentNumber", documentNumber)}
                    data-testid={`progress-${row.testId}-title`}
                    className="govuk-link"
                    id={row.testId}
                    aria-label={t(row.title)}
                  >
                    {t(row.title)}
                    {row.optional && ` (${upperFirst(toLower(t("optional", { ns: "common" })))})`}
                  </a>
                )}
                {row.status && (
                  <strong
                    className={`govuk-tag ${tagCssClasses[row.status as keyof object]} app-task-list__tag`}
                    data-testid={`progress-${row.testId}-tag`}
                  >
                    {t(toLower(tagTitles[row.status as keyof object])).toUpperCase() ||
                      t(toLower(row.status)).toUpperCase()}
                  </strong>
                )}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
};
