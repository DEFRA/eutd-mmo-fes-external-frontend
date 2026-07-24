import type { Journey } from "~/types";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import { Main, ErrorSummary, SecureForm } from "~/components";
import { VoidCertificateConfirm } from "./voidCertificateConfirm";
import { displayErrorMessages } from "~/helpers";
import { useLoaderData, useRevalidator } from "react-router";
import { useEffect } from "react";

type VoidThisDocumentProps = {
  actionData: any;
  journey: Journey;
  backUrl: any;
};

export const VoidthisDocumentComponent = ({ journey, actionData, backUrl }: VoidThisDocumentProps) => {
  const { t } = useTranslation(["common"]);
  const { csrf } = useLoaderData();
  const { revalidate } = useRevalidator();
  const { errors = {}, confirmDocumentVoid } = actionData;

  useEffect(() => {
    const isBackForwardNavigation = () => {
      const navigationEntry = window.performance?.getEntriesByType("navigation")?.[0] as
        | PerformanceNavigationTiming
        | undefined;
      return navigationEntry?.type === "back_forward";
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted || isBackForwardNavigation()) {
        revalidate();
      }
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [revalidate]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row govuk-!-width-three-quarters">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <VoidCertificateConfirm errors={errors} confirmDocumentVoid={confirmDocumentVoid} journey={journey} />
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-full">
                <div className="govuk-button-group">
                  <Button
                    type={BUTTON_TYPE.SUBMIT}
                    label={t("commonContinueButtonSaveAndContinueButton", { ns: "common" })}
                    className="govuk-button"
                    data-testid="continue"
                  />
                </div>
              </div>
            </div>
            <input type="hidden" name="journey" value={journey} />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};
