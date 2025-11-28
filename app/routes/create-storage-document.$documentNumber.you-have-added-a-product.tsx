import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm, TableHeader } from "~/components";
import { useLoaderData, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE, Details } from "@capgeminiuk/dcx-react-library";
import { type MetaFunction, type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import type {
  IUnauthorised,
  StorageDocument,
  StorageDocumentCatch,
  CatchIndex,
  ActionDataWithErrors,
  LinkData,
  CatchesLoaderData,
} from "~/types";
import { getSessionFromRequest } from "~/sessions.server";
import { getMeta, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import {
  getVisibleProducts,
  getStorageDocument,
  getBearerTokenForRequest,
  validateResponseData,
  executeAction,
  createCSRFToken,
} from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { ButtonGroup } from "~/composite-components";
import i18next from "~/i18next.server";
import { json } from "~/communication.server";

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
  const isFromCatchWeightsRoute = session.get("backLinkForCatchAdded");

  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  if (hasActionExecuted) {
    session.unset("actionExecuted");
  } else {
    // If the loader is NOT exeecuting straight after the action, clear the list of catch IDs to be removed
    session.unset("catchesToRemove");
  }

  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  validateResponseData(storageDocument);

  const sdData = (storageDocument as StorageDocument) || {};

  const catchesToRemove = session.get("catchesToRemove");

  // If the loader is exeecuting straight after the action, filter the catches array if needed
  if (hasActionExecuted && catchesToRemove) {
    // Save the original catchIndex to allow Edit functionality for the correct catch entry even when one or more catches
    //   have been marked for removal causing the UI index of visible entries to be different from their original index
    sdData.catches = getVisibleProducts(sdData.catches, catchesToRemove);
  }

  if (!hasActionExecuted) {
    // As there is no limit to the number of catches that can be added, allow the page to render if there is at least
    //   one catch without checking if the catch data is complete; Validation will happen later with save-and-continue;
    //   If there are no catches, redirect to create a new one
    if (!Array.isArray(sdData.catches) || (Array.isArray(sdData.catches) && sdData.catches.length === 0)) {
      return redirect(`/create-storage-document/${documentNumber}/add-product-to-this-consignment`);
    }
  }

  const t = await i18next.getFixedT(request, ["sdYouHaveAddedAProduct", "title"]);
  const titleKey = sdData.catches.length === 1 ? "sdYouAddedSingleProductsTitle" : "sdYouAddedMultiProductsTitle";
  return json(
    {
      documentNumber,
      catches: sdData.catches || [],
      isFromCatchWeightsRoute,
      pageTitle: t(titleKey, { count: sdData.catches.length, ns: "sdYouHaveAddedAProduct" }),
      commonTitle: t("sdCommonTitle", { ns: "title" }),
      csrf,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => executeAction(request, params);

const YouHaveAddedAProduct = () => {
  const { documentNumber, catches, csrf } = useLoaderData<CatchesLoaderData>();
  const { groupedErrors = [] } = useActionData<ActionDataWithErrors>() ?? {};

  const { t } = useTranslation("common");
  const count = catches.length;

  useEffect(() => {
    if (!isEmpty(groupedErrors)) {
      scrollToId("errorIsland");
    }
  }, [groupedErrors]);

  const renderErrorSummary = (index: number) => {
    if (!isEmpty(groupedErrors) && !isEmpty(groupedErrors[index])) {
      const linkData: LinkData[] = groupedErrors[index].map(() => ({
        href: `/create-storage-document/${documentNumber}/add-product-to-this-consignment/${index}`,
      }));

      return (
        <ErrorSummary errors={groupedErrors[index]} linkData={linkData} containerClassName="govuk-!-margin-top-4 " />
      );
    }

    return null;
  };

  return (
    <Main backUrl={`/create-storage-document/${documentNumber}/add-product-to-this-consignment`}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          {catches.length > 1 ? (
            <Title title={t("sdYouAddedMultiProductsTitle", { count, ns: "sdYouHaveAddedAProduct" })} />
          ) : (
            <Title title={t("sdYouAddedSingleProductsTitle", { count, ns: "sdYouHaveAddedAProduct" })} />
          )}
          <table className="govuk-table" role="table">
            <TableHeader
              headersToRender={[
                t("commonProductText", { ns: "common" }),
                t("sdYouAddedProductTableHeaderDocumentReference", { ns: "sdYouHaveAddedAProduct" }),
                t("sdActions", { ns: "sdYouHaveAddedAProduct" }),
              ]}
            />
            <tbody className="govuk-table__body">
              {catches.map((item: StorageDocumentCatch & CatchIndex, index: number) => {
                const validCatchIndex = item.catchIndex ?? index;
                return (
                  <tr className="govuk-table__row" key={item._id} role="row">
                    {renderErrorSummary(validCatchIndex)}
                    <td className="govuk-table__cell">{item.product}</td>
                    <td className="govuk-table__cell">{item.certificateNumber}</td>
                    <td className="govuk-table__cell">
                      <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                        <input
                          type="hidden"
                          name="url"
                          value={`/create-storage-document/${documentNumber}/add-product-to-this-consignment/${validCatchIndex}`}
                        />
                        <input type="hidden" name="productId" value={item._id} />
                        <Button
                          id={`edit-species-${index}`}
                          label={t("commonEditLink", { ns: "common" })}
                          className="govuk-button govuk-button--secondary govuk-!-margin-right-3 govuk-!-margin-bottom-3"
                          type={BUTTON_TYPE.SUBMIT}
                          data-module="govuk-button"
                          name="_action"
                          value="edit"
                          data-testid="edit-button"
                          visuallyHiddenText={{
                            text: item.product,
                            className: "govuk-visually-hidden",
                          }}
                        />
                        {catches.length > 1 && (
                          <Button
                            id={`remove-species-${index}`}
                            label={t("commonRemoveButton")}
                            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                            type={BUTTON_TYPE.SUBMIT}
                            data-module="govuk-button"
                            name="_action"
                            value="remove"
                            data-testid="remove-button"
                            visuallyHiddenText={{
                              text: item.product,
                              className: "govuk-visually-hidden",
                            }}
                          />
                        )}
                      </SecureForm>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <br />
          <SecureForm method="post" csrf={csrf}>
            <div id="radioButtons" className={`govuk-form-group`}>
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">
                  <h2 className="govuk-fieldset__heading">
                    {t("sdYouAddedProductNeedToAddProductTitle", { ns: "sdYouHaveAddedAProduct" })}
                  </h2>
                </legend>
                <br />
                <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherProductYes"
                      name="addAnotherProduct"
                      type="radio"
                      value="Yes"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="addAnotherProductYes">
                      {t("commonYesLabel")}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherCatchNo"
                      name="addAnotherProduct"
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
            <Details
              summary={t("sdYouAddedProductGuidanceTitle", { ns: "sdYouHaveAddedAProduct" })}
              detailsClassName="govuk-details"
              summaryClassName="govuk-details__summary"
              detailsTextClassName="govuk-details__text"
              summaryTextProps={{ id: "you-added-product-details" }}
            >
              <p>{t("sdYouAddedProductGuidanceDescription", { ns: "sdYouHaveAddedAProduct" })}</p>
            </Details>
            <ButtonGroup />
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-storage-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};
export default YouHaveAddedAProduct;
