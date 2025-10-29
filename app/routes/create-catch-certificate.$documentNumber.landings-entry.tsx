import * as React from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import type { ILandingsEntryOptionGet, LandingsEntryOptionType } from "~/types";
import { displayErrorMessages, landingsEntryOptions } from "~/helpers";
import { Details, Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import { useTranslation } from "react-i18next";
import { Main, ErrorSummary, NotificationBanner, ErrorMessage, SecureForm } from "~/components";
import { route } from "routes-gen";
import { useScrollOnPageError, useScrollOnPageLoad } from "~/hooks";
import { LandingEntryAction, LandingEntryLoader } from "~/models";

export const loader: LoaderFunction = async ({ request, params }) => LandingEntryLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response> =>
  LandingEntryAction(request, params);

const LandingsEntry = () => {
  const { errors = {} } = useActionData() ?? {};
  useScrollOnPageError(errors);

  useScrollOnPageLoad();
  const { csrf } = useLoaderData();

  const {
    landingsEntryOption,
    generatedByContent,
    documentNumber,
    copyDocumentAcknowledged,
    voidDocumentConfirm,
    nextUri,
  } = useLoaderData<
    ILandingsEntryOptionGet & {
      documentNumber: string;
      copyDocumentAcknowledged: boolean;
      voidDocumentConfirm: boolean;
      nextUri: string;
    }
  >();
  const { t } = useTranslation(["landingsEntry", "common", "errorsText", "progress"]);
  const getNotificationMsg: (generatedByContent: boolean) => string[] = (generatedByContent: boolean) => {
    const notificationMsgs: string[] = [];
    if (copyDocumentAcknowledged)
      notificationMsgs.push(
        voidDocumentConfirm
          ? t("ccProgressNotificationMsgIsVoided", { ns: "progress" })
          : t("ccProgressNotificationMsgIsNotVoided", { documentNumber, ns: "progress" })
      );

    if (generatedByContent) notificationMsgs.push(t("ccLandingsEntryPageNewPageMessage", { ns: "landingsEntry" }));

    return notificationMsgs.length ? notificationMsgs : [];
  };

  return (
    <Main backUrl={route("/create-catch-certificate/catch-certificates")}>
      {(generatedByContent || copyDocumentAcknowledged) && (
        <NotificationBanner
          header={t("commonImportant", { ns: "common" })}
          messages={getNotificationMsg(generatedByContent)}
          dataTestId={voidDocumentConfirm ? "catchCertificate-CopyVoid" : ""}
        />
      )}
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <div className={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
              <fieldset
                className="govuk-fieldset"
                aria-describedby={isEmpty(errors) ? undefined : "landingsEntryOption-error"}
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                  <h1 className="govuk-fieldset__heading">{t("ccLandingsEntryPageTitle")}</h1>
                </legend>
                <input type="hidden" defaultValue={landingsEntryOption} name="currentLanding" />
                <div className="govuk-radios">
                  {!isEmpty(errors) && (
                    <ErrorMessage
                      id="landingsEntryOption-error"
                      text={t(errors?.landingsEntryOption?.message, { ns: "errorsText" })}
                      visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                    />
                  )}
                  {landingsEntryOptions.map((landingsEntry: LandingsEntryOptionType) => (
                    <div key={`landingentry-${landingsEntry.id}`} className="govuk-radios__item">
                      <input
                        className="govuk-radios__input"
                        id={landingsEntry.id}
                        name={landingsEntry.name}
                        type="radio"
                        aria-describedby={`hint-${landingsEntry.id}`}
                        value={landingsEntry.value}
                        defaultChecked={landingsEntryOption === landingsEntry.value}
                      />
                      <label
                        id={`label-${landingsEntry.id}`}
                        className="govuk-label govuk-radios__label"
                        htmlFor={landingsEntry.id}
                      >
                        {t(landingsEntry.label)}
                      </label>
                      <div id={`hint-${landingsEntry.id}`} className="govuk-hint govuk-radios__hint">
                        {t(landingsEntry.hint)}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <Details
              summary={t("ccLandingsEntryPageWhatIsACSVFile")}
              detailsClassName="govuk-details"
              summaryClassName="govuk-details__summary"
              detailsTextClassName="govuk-details__text"
            >
              <>
                <p>{t("ccLandingsEntryPageWhatIsACSVFileFormatDetails")}</p>
                <p>{t("ccLandingsEntryPageWhatIsACSVFileExportingDetails")}</p>
              </>
            </Details>
            <Button
              id="continue"
              label={t("commonContinueButtonSaveAndContinueButton", { ns: "common" })}
              type={BUTTON_TYPE.SUBMIT}
              className="govuk-button"
              data-module="govuk-button"
            />
            <input type="hidden" name="nextUri" defaultValue={nextUri} />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};

export default LandingsEntry;
