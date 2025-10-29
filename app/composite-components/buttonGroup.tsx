import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";

type ButtonGroupProps = {
  saveButtonLabel?: string;
};

export const ButtonGroup = ({ saveButtonLabel }: ButtonGroupProps) => {
  const { t } = useTranslation(["common"]);
  return (
    <div className="govuk-button-group">
      <Button
        id="saveAsDraft"
        label={t("commonSaveAsDraftButtonSaveAsDraftText")}
        className="govuk-button govuk-button--secondary"
        type={BUTTON_TYPE.SUBMIT}
        data-module="govuk-button"
        name="_action"
        // @ts-ignore
        value="saveAsDraft"
        data-testid="save-draft-button"
      />
      <Button
        id="continue"
        label={saveButtonLabel ?? t("commonContinueButtonSaveAndContinueButton")}
        className="govuk-button"
        type={BUTTON_TYPE.SUBMIT}
        data-module="govuk-button"
        name="_action"
        // @ts-ignore
        value="saveAndContinue"
        data-testid="save-and-continue"
      />
    </div>
  );
};
