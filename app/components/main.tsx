import { BackButton } from "./backButton";
import { HelpLink } from "./helpLink";
import { SurveyLink } from "./surveyLink";

type MainProps = {
  backUrl?: string;
  useHistoryBack?: boolean;
  showHelpLink?: boolean;
  feedbackLink?: string;
};

export const Main = ({
  children,
  backUrl,
  useHistoryBack = false,
  showHelpLink = true,
  feedbackLink = "",
}: React.PropsWithChildren<MainProps>) => (
  <>
    {useHistoryBack && (
      <button
        type="button"
        onClick={() => window.history.back()}
        className="govuk-back-link govuk-!-margin-top-5 govuk-!-margin-bottom-0"
      >
        Back
      </button>
    )}
    {!useHistoryBack && backUrl && <BackButton to={backUrl} />}
    <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
      {children}
      {showHelpLink && <HelpLink />}
      {feedbackLink && <SurveyLink feedbackURL={feedbackLink} />}
    </main>
  </>
);
