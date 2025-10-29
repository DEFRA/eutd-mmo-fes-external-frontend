import { useLoaderData, useActionData } from "@remix-run/react";
import { FormInput, ErrorPosition, Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { useTranslation, Trans } from "react-i18next";
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
      backUri: route("/create-storage-document/:documentNumber/add-your-reference", { documentNumber }),
      progressUri: "/create-storage-document/:documentNumber/progress",
    },
  };

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={routes[journey]["backUri"]}>
      {!isEmpty(error) && <ErrorSummary errors={displayErrorTransformedMessages(errorsTransformed)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("commonAddExporterDetailsText")} />
        </div>
        <div className="govuk-!-display-inline-block govuk-!-margin-bottom-9">
          <svg
            version="1.1"
            fill="currentColor"
            width="35"
            height="35"
            viewBox="0 0 35.000000 35.000000"
            preserveAspectRatio="xMidYMid meet"
          >
            <title>icon important</title>
            <g transform="translate(0.000000,35.000000) scale(0.100000,-0.100000)">
              <path
                d="M100 332 c-87 -48 -125 -155 -82 -232 48 -87 155 -125 232 -82 87 48
  125 155 82 232 -48 87 -155 125 -232 82z m100 -122 c0 -53 -2 -60 -20 -60 -18
  0 -20 7 -20 60 0 53 2 60 20 60 18 0 20 -7 20 -60z m0 -111 c0 -12 -7 -19 -20
  -19 -19 0 -28 28 -14 43 11 11 34 -5 34 -24z"
              ></path>
            </g>
          </svg>
        </div>
        <div
          className="govuk-!-display-inline-block govuk-!-padding-left-2 govuk-phase-banner__text"
          style={{ width: "90%" }}
        >
          <Trans i18nKey="multiline">
            <strong>{t("commonAddExporterDetailsWarningContent", { journeyText: t(journey) })}</strong>
          </Trans>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <SecureForm method="post" csrf={csrf}>
            {journey === "catchCertificate" && (
              <FormInput
                containerClassName="govuk-form-group"
                label={t("ccAddExporterDetailsExporterNameOfPersonResponsible")}
                name="exporterFullName"
                type="text"
                inputClassName={
                  isEmpty(errorsTransformed?.exporterFullName) ? "govuk-input" : "govuk-input govuk-input--error"
                }
                aria-label={t("ccAddExporterDetailsExporterNameOfPersonResponsible")}
                inputProps={{
                  defaultValue: exporterFullName,
                  id: "exporterFullName",
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

            <h2>{t("commonAddExporterDetailsAddressContent")}</h2>
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
                <p>{t("commonAddExporterDetailsExporterAddressRegistration")}</p>
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
