import { useActionData, useLoaderData } from "react-router";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm, ErrorMessage } from "~/components";
import ImportantNotice from "~/components/importantNotice";
import { ButtonGroup } from "./buttonGroup";
import { displayErrorMessages } from "~/helpers";
import { FormInput } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import { useTranslation } from "react-i18next";
import { useScrollOnPageLoad } from "~/hooks";
import classNames from "classnames";

type AddYourReferenceLoaderProps = {
  documentNumber: string;
  userReference: string;
  csrf: string;
  nextUri?: string;
};

type AddYourReferenceProps = {
  backUrl: any;
  hintText: string;
  progressLink: string;
  showInfoNotice?: boolean;
  infoNoticeMessageKey?: string;
};

export const AddYourReferenceCommon = ({
  backUrl,
  hintText,
  progressLink,
  showInfoNotice,
  infoNoticeMessageKey,
}: AddYourReferenceProps) => {
  const actionData = useActionData<{ errors?: any; userReference?: string }>() ?? {};
  const { errors = {} } = actionData;
  const { documentNumber, userReference, csrf, nextUri } = useLoaderData<AddYourReferenceLoaderProps>();
  const { t } = useTranslation(["common", "errorsText"]);

  useScrollOnPageLoad();

  // Show error if field has value (validation error) OR if there's any error from server
  const userReferenceError = errors?.userReference ? errors?.userReference?.message : undefined;
  const hasError = !isEmpty(userReferenceError);

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
          {showInfoNotice && (
            <ImportantNotice messageKey={infoNoticeMessageKey ?? "storageDocumentInformationNotice"} />
          )}
          <SecureForm method="post" csrf={csrf}>
            <div className={hasError ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
              {hasError ? (
                <ErrorMessage
                  text={t(userReferenceError, { ns: "errorsText" })}
                  visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                />
              ) : null}
              <FormInput
                containerClassName="govuk-form-group"
                label={t("commonAddYourReferenceOptionalText")}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                name="userReference"
                type="text"
                inputClassName={classNames("govuk-input", { "govuk-input--error": hasError })}
                inputProps={{
                  defaultValue: actionData.userReference ?? userReference,
                  id: "userReference",
                  "aria-describedby": "hint-userReference",
                }}
                hint={{
                  id: "hint-userReference",
                  position: "above",
                  text: hintText,
                  className: "govuk-hint",
                }}
                hiddenErrorText=""
              />
            </div>
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink progressUri={progressLink} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
