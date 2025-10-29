import { useEffect } from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Main, BackToProgressLink, ErrorSummary, ErrorMessage, SecureForm } from "~/components";
import { route } from "routes-gen";
import { displayErrorMessages, confirmCmrOptions, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { ButtonGroup } from "./buttonGroup";
import { useScrollOnPageLoad } from "~/hooks";
import type { ConfirmCmrOptionsType } from "~/types";

type doYouHaveARoadTransportDocumentFormProps = {
  backUrl: string;
  progressUri: string;
  actionUri?: string;
};

export const DoYouHaveARoadTransportDocumentForm = ({
  backUrl,
  progressUri,
  actionUri,
}: doYouHaveARoadTransportDocumentFormProps) => {
  const { t } = useTranslation(["transportation", "common"]);
  const { documentNumber, cmr, vehicle, csrf } = useLoaderData<{
    documentNumber: string;
    cmr: string;
    vehicle: string;
    csrf: string;
  }>();
  const actionData = useActionData<{ errors: any }>() ?? {};
  const { errors = {} } = actionData;

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={route(backUrl, { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" className="govuk-form-group" action={actionUri ?? undefined} csrf={csrf}>
            <div className={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
              <fieldset
                className="govuk-fieldset"
                aria-describedby={isEmpty(errors) ? "cmr-hint" : "cmr-hint cmr-error"}
              >
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-full">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                      <h1 className="govuk-fieldset__heading">{t("doYouHaveaRoadTransportDocumentHeader")}</h1>
                    </legend>
                  </div>
                </div>
                <div id="cmr-hint" className="govuk-hint">
                  {t("doYouHaveaRoadTransportDocumentHint")}
                </div>
                {!isEmpty(errors) && (
                  <ErrorMessage
                    id="cmr-error"
                    text={t(errors.cmr.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <div className="govuk-radios govuk-radios--inline">
                  {confirmCmrOptions.map((option: ConfirmCmrOptionsType) => (
                    <div key={option.id} className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={option.id}
                        name="cmr"
                        type="radio"
                        value={option.value}
                        defaultChecked={cmr === option.value}
                      />
                      <label id={`label-${option.id}`} className="govuk-label govuk-radios__label" htmlFor={option.id}>
                        {t(option.label, { ns: "common" })}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <br />
            <ButtonGroup />
            <input type="hidden" name="vehicle" value={vehicle} />
          </SecureForm>
          <BackToProgressLink progressUri={progressUri} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
