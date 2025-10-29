import { useTranslation } from "react-i18next";

type SurveyProps = {
  feedbackURL: string;
};
export const SurveyLink = ({ feedbackURL }: SurveyProps) => {
  const { t } = useTranslation("common");
  return (
    <div className="govuk-!-margin-bottom-6 govuk-!-margin-bottom-6">
      <hr className="horizontal-line" />
      <h2 className="govuk-heading-l">{t("commonTwoMinutesFeedbackHeading")}</h2>
      <a
        data-testid="surveylink-feedback"
        className="govuk-link"
        href={feedbackURL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("commomTwominutesSurvey")}
        <span className="govuk-visually-hidden">{t("commonHelpLinkOpenInNewTab")}</span>
      </a>{" "}
      {t("commonHelpToImproveService")}
    </div>
  );
};
