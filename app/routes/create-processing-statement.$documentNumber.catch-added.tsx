import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, CatchDetailsTableHeader, SecureForm } from "~/components";
import { useLoaderData, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { type MetaFunction, type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import type {
  IUnauthorised,
  ProcessingStatement,
  Catch,
  CatchIndex,
  ErrorResponse,
  IError,
  ActionDataWithErrors,
} from "~/types";
import {
  getVisibleCatches,
  updateProcessingStatement,
  getProcessingStatement,
  getBearerTokenForRequest,
  validateResponseData,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import { displayErrorTransformedMessages, getMeta, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { useEffect } from "react";
import { ButtonGroup } from "~/composite-components";
import i18next from "~/i18next.server";
import { json } from "~/communication.server";

type ILoaderData = {
  documentNumber: string;
  catches: (Catch & CatchIndex)[];
  csrf: string;
};

export const meta: MetaFunction = ({ data }) => getMeta(data);

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  session.unset(`documentNumber-${documentNumber}`);
  session.unset(`copyDocumentAcknowledged-${documentNumber}`);
  session.unset(`copyDocument-${documentNumber}`);
  const hasActionExecuted = session.get("actionExecuted");

  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  if (hasActionExecuted) {
    session.unset("actionExecuted");
  } else {
    // If the loader is NOT exeecuting straight after the action, clear the list of catch IDs to be removed
    session.unset("catchesToRemove");
  }

  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  validateResponseData(processingStatement);

  const psData = processingStatement as ProcessingStatement;

  const catchesToRemove = session.get("catchesToRemove");

  if (hasActionExecuted && catchesToRemove) {
    psData.catches = getVisibleCatches(psData.catches, catchesToRemove);
  }

  if (!hasActionExecuted) {
    // As there is no limit to the number of catches that can be added, allow the page to render if there is at least
    //   one catch without checking if the catch data is complete; Validation will happen later with save-and-continue;
    //   If there are no catches, redirect to create a new one
    if (!Array.isArray(psData.catches) || (Array.isArray(psData.catches) && psData.catches.length < 1)) {
      return redirect(`/create-processing-statement/${documentNumber}/add-catch-details`);
    }
  }

  const t = await i18next.getFixedT(request, ["catchAdded", "title"]);
  const titleKey =
    psData.catches && psData.catches.length === 1 ? "psCatchAddedSingleCatchTitle" : "psCatchAddedMultiCatchTitle";

  return json(
    {
      documentNumber,
      catches: psData.catches,
      pageTitle: t(titleKey, { count: psData.catches?.length, ns: "catchAdded" }),
      commonTitle: t("psCommonTitle", { ns: "title" }),
      csrf,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  session.set("actionExecuted", true);
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  validateResponseData(processingStatement);

  const psData = processingStatement as ProcessingStatement;
  const form = await request.formData();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const { _action, ...values } = Object.fromEntries(form);

  const isDraft = _action === "saveAsDraft";
  const isSaveAndContinue = _action === "saveAndContinue";
  const isRemove = _action === "remove";
  const isEdit = _action === "edit";

  if (isEdit) {
    return redirect(values["url"] as string);
  }

  const addAnotherCatch = values.addAnotherCatch === "Yes";
  const catchesToRemove = session.get("catchesToRemove") ?? "";

  // If isDraft or isSaveAndContinue check if there are catches to be removed
  if (!isRemove && catchesToRemove) {
    psData.catches = getVisibleCatches(psData.catches, catchesToRemove);
  }

  // If isRemove, delete the catch from the array but without saving it to the backend
  //   and store catch IDs to be removed in a cookie as a comma-separated list
  if (isRemove) {
    const catchId = values.catchId as string;

    const catchIdsToRemove: string[] = catchesToRemove?.split(",");
    catchIdsToRemove.push(catchId);
    session.set("catchesToRemove", [...new Set(catchIdsToRemove)].join(","));

    return redirect(route("/create-processing-statement/:documentNumber/catch-added", { documentNumber }), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  let errorData;

  if (isDraft || isSaveAndContinue) {
    errorData = await updateProcessingStatement(
      bearerToken,
      documentNumber,
      { catches: psData.catches },
      `/create-processing-statement/${documentNumber}/catch-added`,
      undefined,
      isDraft,
      true
    );
  }

  if (isDraft) {
    return redirect(route("/create-processing-statement/processing-statements"), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  // If errors exist, group them by catch index and return
  if (errorData && Array.isArray(psData?.catches)) {
    const { errors, ...data } = errorData as ErrorResponse;
    const transformedErrors: IError[] = displayErrorTransformedMessages(errors);

    return new Response(
      JSON.stringify({
        groupedErrors: transformedErrors,
        ...data,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  if (catchesToRemove) {
    session.unset("catchesToRemove");
  }

  if (addAnotherCatch) {
    return redirect(`/create-processing-statement/${documentNumber}/add-catch-details`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return redirect(`/create-processing-statement/${documentNumber}/add-processing-plant-details`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

const CatchAdded = () => {
  const { documentNumber, catches, csrf } = useLoaderData<ILoaderData>();
  const { groupedErrors } = useActionData<ActionDataWithErrors>() ?? {};
  const { t } = useTranslation("common");
  const count = catches.length;

  useEffect(() => {
    if (!isEmpty(groupedErrors)) {
      scrollToId("errorIsland");
    }
  }, [groupedErrors]);

  // FI0-7801 - Scenario 5 - Add Catch Details page going back with at least 1 catch added
  return (
    <Main
      backUrl={`/create-processing-statement/${documentNumber}/add-catch-details/${catches[0].speciesCode}?catchType=${catches[0].catchCertificateType}`}
    >
      {Array.isArray(groupedErrors) && groupedErrors.length > 0 && <ErrorSummary errors={groupedErrors} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title
            title={t(count === 1 ? "psCatchAddedSingleCatchTitle" : "psCatchAddedMultiCatchTitle", {
              count,
              ns: "catchAdded",
            })}
          />
          <table className="govuk-table">
            <CatchDetailsTableHeader
              headersToRender={[
                t("psSpecies", { ns: "catchAdded" }),
                t("psCatchCertificateNumber", { ns: "catchAdded" }),
                t("psTotalWeightShownInkg", { ns: "catchAdded" }),
                t("psExportWeightBeforeProcessing", { ns: "catchAdded" }),
                t("psExportWeightAfterProcessing", { ns: "catchAdded" }),
              ]}
            />
            <tbody className="govuk-table__body">
              {catches.map((item: Catch, index: number) => (
                <tr className="govuk-table__row" key={`catches-data-${item._id}`}>
                  <td className="govuk-table__cell" id={`catches-${index}-species`}>
                    {item.species}
                  </td>
                  <td className="govuk-table__cell" id={`catches-${index}-catchCertificateNumber`}>
                    {item.catchCertificateNumber}
                  </td>
                  <td className="govuk-table__cell" id={`catches-${index}-totalWeightLanded`}>
                    {item.totalWeightLanded}kg
                  </td>
                  <td className="govuk-table__cell" id={`catches-${index}-exportWeightBeforeProcessing`}>
                    {item.exportWeightBeforeProcessing}kg
                  </td>
                  <td className="govuk-table__cell" id={`catches-${index}-exportWeightAfterProcessing`}>
                    {" "}
                    {item.exportWeightAfterProcessing}kg
                  </td>
                  <td className="govuk-table__cell govuk-!-text-align-right">
                    <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                      <input
                        type="hidden"
                        name="url"
                        value={`/create-processing-statement/${documentNumber}/add-catch-details/${item._id}`}
                      />
                      <Button
                        id={`edit-species-${index}`}
                        label={t("commonEditLink", { ns: "common" })}
                        className="govuk-button govuk-button--secondary govuk-!-margin-right-3"
                        type={BUTTON_TYPE.SUBMIT}
                        data-module="govuk-button"
                        name="_action"
                        value="edit"
                        data-testid="edit-button"
                        visuallyHiddenText={{
                          text:
                            t("catchCertificate", { ns: "common" }) +
                            " " +
                            item.catchCertificateNumber +
                            " " +
                            item.species,
                          className: "govuk-visually-hidden",
                        }}
                      />
                    </SecureForm>
                    {catches.length > 1 && (
                      <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                        <input type="hidden" name="catchId" value={item._id} />
                        <Button
                          id={`remove-species-${index}`}
                          label={t("commonRemoveButton", { ns: "common" })}
                          className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                          type={BUTTON_TYPE.SUBMIT}
                          data-module="govuk-button"
                          name="_action"
                          value="remove"
                          data-testid="remove-button"
                          visuallyHiddenText={{
                            text:
                              t("catchCertificate", { ns: "common" }) +
                              " " +
                              item.catchCertificateNumber +
                              " " +
                              item.species,
                            className: "govuk-visually-hidden",
                          }}
                        />
                      </SecureForm>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <SecureForm method="post" csrf={csrf}>
            <div id="radioButtons" className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h2 className="govuk-fieldset__heading">{t("psAddAnotherSpecies", { ns: "catchAdded" })}</h2>
                </legend>
                <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherCatchYes"
                      name="addAnotherCatch"
                      type="radio"
                      value="Yes"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="addAnotherCatchYes">
                      {t("commonYesLabel")}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherCatchNo"
                      name="addAnotherCatch"
                      type="radio"
                      value="No"
                      defaultChecked
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="addAnotherCatchNo">
                      {t("commonNoLabel")}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <br />
            <ButtonGroup />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-processing-statement/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default CatchAdded;
