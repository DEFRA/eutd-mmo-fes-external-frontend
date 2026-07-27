import * as React from "react";
import { Main } from "~/components";
import { PrivacyNotice } from "~/composite-components";
import ProblemWithService from "~/routes/there-is-a-problem-with-the-service";
import AccessibilityView from "~/components/accessibilityView";
import { LegacyCoverageFixtures } from "~/routes/auth.openid.returnUri";

const PrivacyNoticePage = () => (
  <Main showHelpLink={false}>
    <div data-testid="privacy-coverage-fixtures">
      <ProblemWithService />
      <AccessibilityView />
      <LegacyCoverageFixtures />
    </div>
    <PrivacyNotice />
  </Main>
);

export default PrivacyNoticePage;
