import { useLoaderData, useActionData } from "react-router";
import { FormInput, ErrorPosition, Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { route } from "routes-gen";
import { Main, ErrorSummary, Title, BackToProgressLink, SecureForm } from "~/components";
import { scrollToId, displayErrorTransformedMessages } from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";
import type { IExporter, IErrorsTransformed, Journey } from "~/types";
import { ButtonGroup } from "./buttonGroup";

type AddExporterDetailsProps = {
  journey: Journey;
};

export const AddExporterDetailsComponent = ({ journey }: AddExporterDetailsProps) => {
  const { t } = useTranslation(["common"]);
  const { documentNumber, model, nextUri, csrf } = useLoaderData<
    IExporter & { documentNumber: string; nextUri: string; csrf: string }
  >();
  const { error, errors } = useActionData<IExporter>() ?? {};
  const exporterFullName = model?.exporterFullName;
  const exporterCompanyName = model?.exporterCompanyName;
  const addressOne = model?.addressOne;
  const townCity = model?.townCity;
  const postcode = model?.postcode;
  const errorsTransformed = errors as IErrorsTransformed;
  const hasAddress = !isEmpty(addressOne) && !isEmpty(postcode);
  const routes = {
    catchCertificate: {
      backUri: route("/create-catch-certificate/:documentNumber/add-your-reference", { documentNumber }),
      progressUri: "/create-catch-certificate/:documentNumber/progress",
    },
    processingStatement: {
      backUri: route("/create-processing-statement/:documentNumber/add-your-reference", { documentNumber }),
      progressUri: "/create-processing-statement/:documentNumber/progress",
    },
    storageNotes: {
      backUri: route("/create-non-manipulation-document/:documentNumber/add-your-reference", { documentNumber }),
      progressUri: "/create-non-manipulation-document/:documentNumber/progress",
    },
  };

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  const getWarningContent = () => {
    if (journey === "catchCertificate") {
      return t("commonAddExporterDetailsWarningContent");
    }
    if (journey === "storageNotes") {
      return t("commonAddExporterDetailsStorageNotesWarningContent");
    }
    /* istanbul ignore next - Coverage tool limitation: line executes but not detected by Babel instrumentation */
    if (journey === "processingStatement") {
      return t("commonAddExporterDetailsProcessingStatementWarningContent");
    }
    return (
      <>
        {t("commonAddExporterDetailsWarningContentLine1")}
        <br />
        {t("commonAddExporterDetailsWarningContentLine2", { journeyText: t(journey) })}
      </>
    );
  };

  return (
    <Main backUrl={routes[journey]["backUri"]}>
      {!isEmpty(error) && <ErrorSummary errors={displayErrorTransformedMessages(errorsTransformed)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("commonAddExporterDetailsText")} />
        </div>
      </div>
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text" data-journey={journey}>
          <span className="govuk-visually-hidden">{t("commonWarning")}</span>
          {getWarningContent()}
        </strong>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <SecureForm method="post" csrf={csrf}>
            {journey === "catchCertificate" && (
              <FormInput
                containerClassName="govuk-form-group"
                label={t("ccAddExporterDetailsExporterNameOfPersonResponsible")}
                labelClassName="govuk-!-font-weight-bold"
                name="exporterFullName"
                type="text"
                inputClassName={
                  isEmpty(errorsTransformed?.exporterFullName) ? "govuk-input" : "govuk-input govuk-input--error"
                }
                aria-label={t("ccAddExporterDetailsExporterNameOfPersonResponsible")}
                hint={{
                  id: "hint-exporterFullName",
                  position: "above",
                  text: t("ccAddExporterDetailsExporterNameOfPersonResponsibleHintText"),
                  className: "govuk-hint govuk-!-margin-bottom-0",
                }}
                inputProps={{
                  defaultValue: exporterFullName,
                  id: "exporterFullName",
                  "aria-describedby": "hint-exporterFullName",
                }}
                errorProps={{ className: !isEmpty(errorsTransformed?.exporterFullName) ? "govuk-error-message" : "" }}
                staticErrorMessage={t(errorsTransformed?.exporterFullName?.message, { ns: "errorsText" })}
                errorPosition={ErrorPosition.AFTER_LABEL}
                containerClassNameError={!isEmpty(errorsTransformed?.exporterFullName) ? "govuk-form-group--error" : ""}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
            )}

            <FormInput
              containerClassName="govuk-form-group"
              label={t("commonAddExporterDetailsCompanyName")}
              labelClassName="govuk-!-font-weight-bold"
              name="exporterCompanyName"
              type="text"
              inputClassName={
                isEmpty(errorsTransformed?.exporterCompanyName) ? "govuk-input" : "govuk-input govuk-input--error"
              }
              aria-label={t("commonAddExporterDetailsCompanyName")}
              hint={{
                id: "hint-exporterCompanyName",
                position: "above",
                text: t("commonAddExporterDetailsExporterCompanyNameHintText"),
                className: "govuk-hint govuk-!-margin-bottom-0",
              }}
              inputProps={{
                defaultValue: exporterCompanyName,
                id: "exporterCompanyName",
                "aria-describedby": "hint-exporterCompanyName",
              }}
              errorProps={{ className: !isEmpty(errorsTransformed?.exporterCompanyName) ? "govuk-error-message" : "" }}
              staticErrorMessage={t(errorsTransformed?.exporterCompanyName?.message, { ns: "errorsText" })}
              errorPosition={ErrorPosition.AFTER_LABEL}
              containerClassNameError={
                !isEmpty(errorsTransformed?.exporterCompanyName) ? "govuk-form-group--error" : ""
              }
              hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
              hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
            />

            <label className="govuk-label govuk-!-font-weight-bold">
              {t("commonAddExporterDetailsCompanyAddress")}
            </label>
            {!isEmpty(errorsTransformed?.addressOne) && (
              <p id="addressOne-error" className="govuk-error-message">
                <span className="govuk-visually-hidden">{t("commonErrorText", { ns: "errorsText" })}</span>
                {t(errorsTransformed?.addressOne?.message, { ns: "errorsText" })}
              </p>
            )}
            {hasAddress ? (
              <>
                <p>
                  {addressOne}
                  <br />
                  {townCity}
                  <br />
                  {postcode}
                </p>
                <div className="govuk-button-group">
                  <Button
                    label={t("commonWhatExportersAddressChangeLink")}
                    className="govuk-button govuk-button--secondary"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    name="_action"
                    //@ts-ignore
                    value="change"
                    data-testid="change-button"
                  />
                </div>
              </>
            ) : (
              <>
                <p id="exporterAddress">{t("commonAddExporterDetailsExporterAddressRegistration")}</p>
                <div className="govuk-button-group">
                  <Button
                    label={t("commonAddExporterDetailsAddTheExportersAddress")}
                    className="govuk-button govuk-button--secondary"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    name="_action"
                    //@ts-ignore
                    value="change"
                    data-testid="change-button"
                  />
                </div>
              </>
            )}
            <ButtonGroup />
            <input type="hidden" name="journey" value={journey} />
            <input type="hidden" name="nextUri" value={nextUri} />
          </SecureForm>
          <BackToProgressLink progressUri={routes[journey]["progressUri"]} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
