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
  const { t } = useTranslation(["common", "errorsText"]);

  useScrollOnPageLoad();

  const currentValue = actionData.userReference ?? userReference;
  const userReferenceError = currentValue && errors?.userReference ? errors?.userReference?.message : undefined;

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
            <div
              className={isEmpty(userReferenceError) ? "govuk-form-group" : "govuk-form-group govuk-form-group--error"}
            >
              {!isEmpty(userReferenceError) ? (
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
                inputClassName={classNames("govuk-input")}
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
          </SecureForm>
          <BackToProgressLink progressUri={progressLink} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
