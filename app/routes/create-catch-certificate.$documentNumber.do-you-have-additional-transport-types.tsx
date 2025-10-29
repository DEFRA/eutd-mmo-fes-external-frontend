import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useEffect } from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Main, BackToProgressLink, ErrorSummary, ErrorMessage, Title, TableHeader, SecureForm } from "~/components";
import { displayErrorMessages, confirmTransportTypeOptions, scrollToId, backUri } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { ButtonGroup } from "~/composite-components";
import { useScrollOnPageLoad } from "~/hooks";
import type { ErrorResponse, ITransport, TransportOptionType } from "~/types";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { DoYouHaveAddtionalTransportTypesAction, DoYouHaveAddtionalTransportTypesLoader } from "~/models";

export const loader: LoaderFunction = async ({ params, request }) =>
  DoYouHaveAddtionalTransportTypesLoader(params, request);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse | undefined> =>
  DoYouHaveAddtionalTransportTypesAction(params, request);

const DoYouHaveAdditionalTransportTypes = () => {
  const { t } = useTranslation(["transportation", "common"]);
  const { documentNumber, transport, defaultTransportOptionType, transportations, csrf } = useLoaderData<{
    documentNumber: string;
    transport?: ITransport;
    defaultTransportOptionType?: "no";
    transportations: ITransport[];
    csrf: string;
  }>();
  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const backUrl = transport
    ? `/create-catch-certificate/${documentNumber}/${backUri(transport, "catchCertificate")}/${transport.id}`
    : `/create-catch-certificate/${documentNumber}/what-export-journey`;
  const progressUri = "/create-catch-certificate/:documentNumber/progress";

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title
            title={t("transportDetailsTableHeader", { ns: "transportation" })}
            dataTestId="transport-details-page-header"
          />
          <table className="govuk-table govuk-table--small-text-until-tablet" role="table">
            <TableHeader
              headersToRender={[
                t("ccTransportType", { ns: "transportation" }),
                t("ccDocuments", { ns: "transportation" }),
                t("ccReferences", { ns: "transportation" }),
                "",
                t("ccAction", { ns: "transportation" }),
              ]}
            />
            <tbody className="govuk-table__body">
              {transportations.map((transport: ITransport, index: number) => (
                <tr className="govuk-table__row" key={`transportations-${transport.id}`} role="row">
                  <td className="govuk-table__cell" data-label={t("ccTransportType", { ns: "transportation" })}>
                    {t(transport.vehicle, { ns: "transportation" })}
                  </td>
                  <td className="govuk-table__cell" data-label={t("ccDocuments", { ns: "transportation" })}>
                    <ul className="govuk-list ">
                      {transport.documents?.map((doc) => <li key={doc.name}>{doc.name}</li>)}
                    </ul>
                  </td>
                  <td className="govuk-table__cell" data-label={t("ccReferences", { ns: "transportation" })}>
                    <ul className="govuk-list ">
                      {transport.documents?.map((doc) => <li key={doc.reference}>{doc.reference}</li>)}
                    </ul>
                  </td>
                  <td className="govuk-table__cell" data-label={t("ccPrimary", { ns: "transportation" })}>
                    {index === 0 && (
                      <strong className="govuk-tag govuk-phase-banner__content__tag">
                        {t("ccPrimary", { ns: "transportation" })}
                      </strong>
                    )}
                  </td>
                  <td
                    className="govuk-table__cell govuk-!-text-align-left"
                    data-label={t("ccAction", { ns: "transportation" })}
                  >
                    <SecureForm
                      method="post"
                      className="govuk-!-display-inline"
                      aria-label={t("commonEditLink", { ns: "common" })}
                      csrf={csrf}
                    >
                      <input type="hidden" name="transportId" value={transport.id} />
                      <Button
                        label={t("commonEditLink", { ns: "common" })}
                        type={BUTTON_TYPE.SUBMIT}
                        className="govuk-button govuk-button--secondary govuk-!-margin-right-3"
                        name="_action"
                        value="edit"
                        data-module="govuk-button"
                        data-testid={`edit-button-${index}`}
                      />
                    </SecureForm>
                    {transportations.length > 1 && (
                      <SecureForm
                        method="post"
                        className="govuk-!-display-inline"
                        aria-label={t("commonRemoveButton", { ns: "common" })}
                        csrf={csrf}
                      >
                        <input type="hidden" name="transportId" value={transport.id} />
                        <Button
                          label={t("commonRemoveButton", { ns: "common" })}
                          type={BUTTON_TYPE.SUBMIT}
                          className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                          name="_action"
                          value="remove"
                          data-module="govuk-button"
                          data-testid={`remove-button-${index}`}
                        />
                      </SecureForm>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="govuk-warning-text">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>
            <strong className="govuk-warning-text__text">
              <span className="govuk-visually-hidden">Warning</span>
              {t("primaryTransportDetailsWarning", { ns: "transportation" })}
            </strong>
          </div>
          <br />
          <SecureForm method="post" className="govuk-form-group" csrf={csrf}>
            <div className={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
              <fieldset
                className="govuk-fieldset"
                aria-describedby={
                  isEmpty(errors) ? "addTransportation-hint" : "addTransportation-hint addTransportation-error"
                }
              >
                <div className="govuk-grid-row">
                  <div className="govuk-grid-column-full">
                    <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                      <h2 className="govuk-fieldset__heading">{t("doYouHaveaAdditionalTransportTypesHeader")}</h2>
                    </legend>
                  </div>
                </div>
                <div id="addTransportation-hint" className="govuk-hint">
                  {t("doYouHaveaAdditionalTransportTypesHint", { ns: "transportation" })}
                </div>
                {!isEmpty(errors) && (
                  <ErrorMessage
                    id="addTransportation-error"
                    text={t(errors.addTransportation.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                <div className="govuk-radios govuk-radios--inline">
                  {confirmTransportTypeOptions.map((option: TransportOptionType) => (
                    <div key={option.id} className="govuk-radios__item">
                      <input
                        id={option.id}
                        type="radio"
                        name="addTransportation"
                        className="govuk-radios__input"
                        value={option.value}
                        defaultChecked={option.value === defaultTransportOptionType}
                      />
                      <label htmlFor={option.id} className="govuk-label govuk-radios__label">
                        {t(option.label, { ns: "transportation" })}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <br />
            <ButtonGroup />
          </SecureForm>
          <BackToProgressLink progressUri={progressUri} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};

export default DoYouHaveAdditionalTransportTypes;
