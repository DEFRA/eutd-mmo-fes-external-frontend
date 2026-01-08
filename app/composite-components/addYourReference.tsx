import { useActionData, useLoaderData } from "react-router";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import ImportantNotice from "~/components/importantNotice";
import { ButtonGroup } from "./buttonGroup";
import { displayErrorMessages } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import { useTranslation } from "react-i18next";
import { useScrollOnPageLoad } from "~/hooks";

type AddYourReferenceLoaderProps = {
  documentNumber: string;
  userReference: string;
  csrf: string;
};

type AddYourReferenceProps = {
  backUrl: any;
  hintText: string;
  progressLink: string;
  showInfoNotice?: boolean;
};

export const AddYourReferenceCommon = ({ backUrl, hintText, progressLink, showInfoNotice }: AddYourReferenceProps) => {
  const actionData = useActionData<{ errors?: any; userReference?: string }>() ?? {};
  const { errors = {} } = actionData;
  const { documentNumber, userReference, csrf } = useLoaderData<AddYourReferenceLoaderProps>();
  const { t } = useTranslation(["common"]);

  useScrollOnPageLoad();

  return (
    <Main backUrl={route(backUrl, { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("commonAddYourReferenceForThisExport")} />
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {showInfoNotice && <ImportantNotice messageKey="storageDocumentInformationNotice" />}
          <SecureForm method="post" csrf={csrf}>
            <div className="govuk-form-group">
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="userReference">
                {t("commonAddYourReferenceOptionalText")}
              </label>
              <div id="hint-userReference" className="govuk-hint">
                {hintText}
              </div>
              {!isEmpty(errors) && (
                <p className="govuk-error-message">
                  <span className="govuk-visually-hidden">{t("commonErrorText", { ns: "errorsText" })}</span>
                  {t(errors?.userReference?.message, { ns: "errorsText" })}
                </p>
              )}
              <input
                className={isEmpty(errors) ? "govuk-input" : "govuk-input govuk-input--error"}
                id="userReference"
                name="userReference"
                type="text"
                defaultValue={actionData.userReference ?? userReference}
                aria-describedby="hint-userReference"
              />
            </div>
            <ButtonGroup />
          </SecureForm>
          <BackToProgressLink progressUri={progressLink} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
