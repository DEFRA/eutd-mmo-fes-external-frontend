import * as React from "react";
import { useEffect, type FormEventHandler, type MouseEventHandler } from "react";
import { Link, useActionData, useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { BackToProgressLink, Main, Title, NotificationBanner, ErrorSummary, SecureForm } from "~/components";
import { route } from "routes-gen";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useHydrated } from "remix-utils/use-hydrated";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash/isEmpty";
import { displayErrorTransformedMessages, getErrorMessage, scrollToId } from "~/helpers";
import type { ErrorObject, ErrorResponse, IErrorsTransformed, IUploadedLanding } from "~/types";
import { useScrollOnPageLoad } from "~/hooks";
import { UploadFileAction, UploadFileLoader } from "~/models";
import { RenderUploadFileLandingsData } from "~/composite-components/renderUploadFileLandingsData";

export const loader: LoaderFunction = async ({ request, params }) => UploadFileLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  UploadFileAction(request, params);

const UploadFile = () => {
  const { documentNumber, csrf, maxEEZ } = useLoaderData<{
    documentNumber: string | undefined;
    csrf: string;
    maxEEZ: number;
  }>();
  const { rows, showNotification, totalRows, successfullyUploadedRows, errors } = useActionData<{
    rows: IUploadedLanding[];
    showNotification: boolean;
    totalRows: number;
    successfullyUploadedRows?: number;
    errors: IErrorsTransformed;
  }>() ?? { errors: {} };
  const isHydrated = useHydrated();
  const { t } = useTranslation(["uploadFile", "common"]);
  const submit = useSubmit();
  const navigation = useNavigation();
  const uploadNotification = navigation.state === "submitting";
  const handleChange: FormEventHandler<HTMLFormElement> = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.target.blur();
    submit(event.currentTarget, { replace: true });
  };
  function renderLandingError(error: ErrorObject | string, maxEEZ: number) {
    if (typeof error === "string") {
      if (error === "validation.eezCode.string.max") {
        return t(getErrorMessage(error), { dynamicValue: maxEEZ });
      }
      return t(getErrorMessage(error));
    } else {
      if (error.key === "validation.eezCode.string.max") {
        return t(getErrorMessage(error.key), { dynamicValue: maxEEZ });
      }
      return t(getErrorMessage(error.key), { dynamicValue: error.params[0] });
    }
  }

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  const handleClearUpload: MouseEventHandler<HTMLButtonElement> = (event: React.MouseEvent<HTMLButtonElement>) => {
    (document?.getElementById("upload-form") as HTMLFormElement).reset();
    event.currentTarget.blur();
  };

  return (
    <Main
      backUrl={route("/create-catch-certificate/:documentNumber/add-exporter-details", {
        documentNumber: documentNumber,
      })}
    >
      {(uploadNotification || showNotification) && (
        <NotificationBanner
          header={
            uploadNotification
              ? t("ccUploadFilePageNotificationProgressHeader")
              : t("ccUploadFilePageNotificationCompletionHeader")
          }
          messages={[
            uploadNotification
              ? t("ccUploadFilePageNotificationProgressMessage")
              : t("ccUploadFilePageNotificationCompletionMessage", {
                  completedRows: successfullyUploadedRows,
                  totalRows,
                }),
          ]}
          className={uploadNotification ? "" : "govuk-notification-banner--success"}
          role={showNotification ? "alert" : "region"}
        />
      )}
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("ccUploadFilePageTitle")} />
          <h2 className="govuk-heading-l" data-testid="guidance-heading">
            {t("ccUploadFilePageGuidanceHeader")}
          </h2>
          <div className="govuk-warning-text" data-testid="warning-message">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              {t("ccUploadFilePageGuidanceMessage")}{" "}
              <Link
                className="govuk-link"
                to={route("/create-catch-certificate/:documentNumber/upload-guidance", { documentNumber })}
              >
                {t("ccUploadFilePageGuidanceMessageLink")}
              </Link>
              , {t("ccUploadFilePageGuidanceMessageCreate")}{" "}
              <Link
                className="govuk-link"
                to={route("/create-catch-certificate/:documentNumber/product-favourites", { documentNumber })}
              >
                {t("ccUploadFilePageManageFavouritesLink")}
              </Link>
              .
            </strong>
          </div>
          <h2 className="govuk-heading-l" data-testid="file-upload-heading">
            {t("ccUploadFilePageFileUploadHeading")}
          </h2>
          <SecureForm id="upload-form" method="post" encType="multipart/form-data" onChange={handleChange} csrf={csrf}>
            <div
              data-testid="productCsvFileUpload"
              className={
                isEmpty((errors as IErrorsTransformed)?.file)
                  ? "govuk-form-group"
                  : "govuk-form-group govuk-form-group--error"
              }
            >
              <label className="govuk-label" htmlFor="file">
                {t("ccUploadFilePageFileUploadText")}
              </label>
              {(errors as IErrorsTransformed)?.file && (
                <p id="file-error-message" className="govuk-error-message">
                  <span className="govuk-visually-hidden">{t("commonErrorText", { ns: "errorsText" })}</span>
                  {(errors as IErrorsTransformed)?.file?.value
                    ? t((errors as IErrorsTransformed)?.file?.message, {
                        ns: "errorsText",
                        ...(errors as IErrorsTransformed)?.file?.value,
                      })
                    : t((errors as IErrorsTransformed)?.file?.message, { ns: "errorsText" })}
                </p>
              )}
              <input
                className="govuk-file-upload"
                data-testid="productCsvFileUploadInput"
                id="file"
                name="productCsvFile"
                type="file"
                accept=".csv"
              />
            </div>
            <div className="govuk-button-group">
              {!isHydrated && (
                <Button
                  type={BUTTON_TYPE.SUBMIT}
                  name="_action"
                  label={t("ccUploadFileButton")}
                  //@ts-ignore
                  value="upload"
                  className="govuk-button"
                  data-testid="upload"
                />
              )}
              <Button
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                label={t("ccUploadFilePageClearFileUpload")}
                //@ts-ignore
                value="clear"
                className="govuk-button govuk-button--secondary"
                data-testid="clear"
                onClick={handleClearUpload}
              />
            </div>
            <h2 className="govuk-heading-l" data-testid="upload-results-label">
              {t("ccUploadFilePageFileUploadResultsHeader")}
            </h2>
            <p data-testid="validation-failed-paragraph">{t("ccUploadFilePageValidationFailedParagraph")}</p>
            <ol className="govuk-list govuk-list--number">
              <li data-testid="validation-failed-advice-one">{t("ccUploadFilePageValidationFailedAdviceOne")}</li>
              <li data-testid="validation-failed-advice-two">{t("ccUploadFilePageValidationFailedAdviceTwo")}</li>
            </ol>
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    {t("ccUploadFilePageTableHeaderOne")}
                  </th>
                  <th scope="col" className="govuk-table__header">
                    {t("ccUploadFilePageTableHeaderTwo")}
                  </th>
                  <th scope="col" className="govuk-table__header">
                    {t("ccUploadFilePageTableHeaderThree")}
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {rows?.map((landing: IUploadedLanding) => (
                  <tr
                    key={`rows-${landing.rowNumber}-${landing.productId}`}
                    className="govuk-table__row"
                    data-testid={landing.productId}
                    style={{ color: isEmpty(landing.errors) ? "" : "#b10e1e" }}
                  >
                    <td scope="row" className="govuk-table__cell">
                      {landing.rowNumber}
                    </td>
                    <td className="govuk-table__cell" style={{ wordBreak: "break-word" }}>
                      {landing.originalRow}
                    </td>
                    {!isEmpty(landing.errors) || landing.product === undefined ? (
                      <td className="govuk-table__cell">
                        <strong>{t("ccUploadFilePageTableFailedInfo")}</strong>:{" "}
                        {landing.errors?.map((error: ErrorObject | string, index: number) => (
                          <span
                            id={`row-${landing.rowNumber}-${
                              !isEmpty(landing.productId) ? landing.productId : "PRD-UNKNOWN"
                            }-${index}-upload-file-error`}
                            key={`row-${landing.productId}`}
                          >
                            {renderLandingError(error, maxEEZ)}
                            <br />
                          </span>
                        ))}
                      </td>
                    ) : (
                      <RenderUploadFileLandingsData landing={landing} />
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="govuk-button-group">
              <Button
                label={t("commonCancelButtonCancelButtonText", {
                  ns: "common",
                })}
                className="govuk-button govuk-button--secondary"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                name="_action"
                //@ts-ignore
                value="cancel"
                data-testid="cancel"
              />
              <Button
                id="continue"
                label={t("commonContinueButtonSaveAndContinueButton", {
                  ns: "common",
                })}
                className="govuk-button"
                type={BUTTON_TYPE.SUBMIT}
                data-module="govuk-button"
                data-testid="continue"
                //@ts-ignore
                value="saveAndContinue"
                name="_action"
              />
            </div>
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-catch-certificate/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default UploadFile;
