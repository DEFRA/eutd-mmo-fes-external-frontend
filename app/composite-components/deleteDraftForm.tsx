import { useActionData, useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Journey } from "~/types";
import { useScrollOnPageLoad } from "~/hooks";
import { YesNoConfirmationPage } from "./yesNoConfirmationPage";

type DeleteDraftFormProps = {
  backUrl: string;
  journey: Journey;
};

export const DeleteDraftForm = ({ backUrl, journey }: DeleteDraftFormProps) => {
  const { csrf } = useLoaderData<{ csrf: string }>();
  const { errors = {} } = useActionData<{ errors: any }>() ?? {};
  const { t } = useTranslation(["common"]);

  useScrollOnPageLoad();

  return (
    <YesNoConfirmationPage
      csrf={csrf}
      backUrl={backUrl}
      title={t(`${journey}DeleteConfirmation`, { ns: "common" })}
      radioName="documentDelete"
      yesLabel={t("commonYesLabel")}
      noLabel={t("commonNoLabel")}
      errors={errors}
      gridColumnClassName="govuk-grid-column-three-quarters"
    >
      <input type="hidden" name="journey" value={journey} />
    </YesNoConfirmationPage>
  );
};
