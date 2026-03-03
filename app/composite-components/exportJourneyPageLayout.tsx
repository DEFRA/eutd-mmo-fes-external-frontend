import { useEffect, type ReactNode } from "react";
import isEmpty from "lodash/isEmpty";
import { useScrollOnPageLoad } from "~/hooks";
import { scrollToId, displayErrorMessages } from "~/helpers";
import { Main, ErrorSummary, SecureForm, Title, BackToProgressLink } from "~/components";
import { ButtonGroup } from "./buttonGroup";

type ExportJourneyPageLayoutProps = {
  title: string;
  backUrl: string;
  progressUri: string;
  documentNumber: string;
  csrf: string;
  errors: Record<string, any>;
  nextUri: string;
  children: ReactNode;
  hiddenFields?: Record<string, string>;
};

export const ExportJourneyPageLayout = ({
  title,
  backUrl,
  progressUri,
  documentNumber,
  csrf,
  errors,
  nextUri,
  children,
  hiddenFields = {},
}: ExportJourneyPageLayoutProps) => {
  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={title} />
          <SecureForm method="post" csrf={csrf}>
            {children}
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
            {Object.entries(hiddenFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} defaultValue={value} />
            ))}
          </SecureForm>
          <BackToProgressLink progressUri={progressUri} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
