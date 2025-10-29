import { useActionData, useLoaderData } from "@remix-run/react";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { ButtonGroup } from "./buttonGroup";
import { displayErrorMessages } from "~/helpers";
import { FormInput, ErrorPosition } from "@capgeminiuk/dcx-react-library";
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
};

export const AddYourReferenceCommon = ({ backUrl, hintText, progressLink }: AddYourReferenceProps) => {
  const actionData = useActionData<{ errors: any }>() ?? {};
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
          <SecureForm method="post" csrf={csrf}>
            <FormInput
              containerClassName="govuk-form-group"
              label={t("commonAddYourReferenceOptionalText")}
              name="userReference"
              type="text"
              inputClassName={isEmpty(errors) ? "govuk-input" : "govuk-input govuk-input--error"}
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
              errorProps={{ className: !isEmpty(errors) ? "govuk-error-message" : "" }}
              staticErrorMessage={t(errors?.userReference?.message, { ns: "errorsText" })}
              errorPosition={ErrorPosition.AFTER_LABEL}
              containerClassNameError={!isEmpty(errors) ? "govuk-form-group--error" : ""}
              hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
              hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
            />
            <ButtonGroup />
          </SecureForm>
          <BackToProgressLink progressUri={progressLink} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
