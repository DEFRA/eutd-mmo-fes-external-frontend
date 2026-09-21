import type { Journey } from "~/types";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { YesNoConfirmationPage } from "./yesNoConfirmationPage";

type VoidThisDocumentProps = {
  actionData: any;
  journey: Journey;
  backUrl: any;
};

export const VoidthisDocumentComponent = ({ journey, actionData, backUrl }: VoidThisDocumentProps) => {
  const { t } = useTranslation(["common"]);
  const { csrf } = useLoaderData();
  const { errors = {} } = actionData;

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
    <YesNoConfirmationPage
      csrf={csrf}
      backUrl={backUrl}
      title={t(`${journey}VoidConfirmation`, { ns: "common" })}
      radioName="documentVoid"
      yesLabel={t("commonYesLabel")}
      noLabel={t("commonNoLabel")}
      errors={errors}
      gridColumnClassName="govuk-grid-column-full"
      titleTestId="void-certificate-confirm"
    >
      <input type="hidden" name="journey" value={journey} />
    </YesNoConfirmationPage>
  );
};
