import { BackButton } from "./backButton";
import { HelpLink } from "./helpLink";
import { SurveyLink } from "./surveyLink";

type MainProps = {
  backUrl?: string;
  showHelpLink?: boolean;
  feedbackLink?: string;
};

export const Main = ({
  children,
  backUrl,
  showHelpLink = true,
  feedbackLink = "",
}: React.PropsWithChildren<MainProps>) => (
  <>
    {backUrl && <BackButton to={backUrl} />}
    <main className="govuk-main-wrapper app-main-class" id="main-content" role="main">
      {children}
      {showHelpLink && <HelpLink />}
      {feedbackLink && <SurveyLink feedbackURL={feedbackLink} />}
    </main>
  </>
);
