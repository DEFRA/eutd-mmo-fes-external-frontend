import * as React from "react";
import { Main, Title, BackToProgressLink, ErrorSummary, SecureForm } from "~/components";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { type MetaFunction, type LoaderFunction, redirect, type ActionFunction } from "@remix-run/node";
import type {
  IUnauthorised,
  StorageDocument,
  StorageFacility,
  FacilityIndex,
  ActionDataWithErrors,
  LinkData,
  FacilitiesLoaderData,
} from "~/types";
import {
  getBearerTokenForRequest,
  validateResponseData,
  getStorageDocument,
  executeAction,
  createCSRFToken,
} from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { ButtonGroup } from "~/composite-components";
import { getMeta, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { Fragment, useEffect } from "react";
import i18next from "~/i18next.server";

export const meta: MetaFunction = ({ data }) => getMeta(data);

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);

  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  validateResponseData(storageDocument);

  const sdData = storageDocument as StorageDocument;
  const isFromStorageFacilityDetails = session.get("backLinkForFacilityAdded");

  if (Array.isArray(sdData?.storageFacilities) && sdData?.storageFacilities.length === 0) {
    return redirect(`/create-storage-document/${documentNumber}/add-storage-facility-details`);
  }

  const t = await i18next.getFixedT(request, ["youAddedStorageFacility", "title"]);
  const titleKey =
    Array.isArray(sdData?.storageFacilities) && sdData?.storageFacilities.length === 1
      ? "sdFacilityAddedSingleFacilityTitle"
      : "sdFacilityAddedMultiFacilityTitle";
  return new Response(
    JSON.stringify({
      documentNumber,
      facilities: sdData.storageFacilities ?? [],
      isFromStorageFacilityDetails,
      pageTitle: t(titleKey, {
        count: Array.isArray(sdData?.storageFacilities) ? sdData?.storageFacilities.length : 0,
        ns: "youAddedStorageFacility",
      }),
      commonTitle: t("sdCommonTitle", { ns: "title" }),
      csrf,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => executeAction(request, params);

const YouHaveAddedAStorageFacility = () => {
  const { documentNumber, facilities, isFromStorageFacilityDetails, csrf } = useLoaderData<FacilitiesLoaderData>();
  const { groupedErrors = [] } = useActionData<ActionDataWithErrors>() ?? {};
  const { t } = useTranslation("common");
  const count = facilities.length;

  useEffect(() => {
    if (!isEmpty(groupedErrors)) {
      scrollToId("errorIsland");
    }
  }, [groupedErrors]);

  const renderErrorSummary = (index: number) => {
    if (!isEmpty(groupedErrors) && !isEmpty(groupedErrors[index])) {
      const linkData: LinkData[] = groupedErrors[index].map(({ key }) => ({
        href: `/create-storage-document/${documentNumber}/add-storage-facility-details/${index}#${key}`,
      }));

      return (
        <ErrorSummary errors={groupedErrors[index]} linkData={linkData} containerClassName="govuk-!-margin-top-4 " />
      );
    }

    return null;
  };

  const backLinkUrl =
    count > 1
      ? isFromStorageFacilityDetails
      : `/create-storage-document/${documentNumber}/add-storage-facility-approval/0`;

  return (
    <Main backUrl={backLinkUrl}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title
            title={t(
              facilities.length > 1 ? "sdFacilityAddedMultiFacilityTitle" : "sdFacilityAddedSingleFacilityTitle",
              { count, ns: "youAddedStorageFacility" }
            )}
          />
          <h2>{t("sdFacilityHeading", { ns: "youAddedStorageFacility" })}</h2>
          {facilities.map((item: StorageFacility & FacilityIndex, index: number) => {
            const validFacilityIndex = item.facilityIndex ?? index;
            return (
              <Fragment key={validFacilityIndex}>
                {renderErrorSummary(validFacilityIndex)}
                <dl
                  className="govuk-summary-list govuk-!-margin-bottom-0 govuk-summary-list--no-border "
                  key={item.facilityIndex}
                >
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">{item.facilityName}</dt>
                    <dd className="govuk-summary-list__actions">
                      <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                        <input
                          type="hidden"
                          name="url"
                          value={`/create-storage-document/${documentNumber}/add-storage-facility-approval/${validFacilityIndex}`}
                        />
                        <input type="hidden" name="facilityId" value={index} />
                        <Button
                          id={`edit-facility-${index}`}
                          label={t("commonEditLink", { ns: "common" })}
                          className="govuk-button govuk-button--secondary govuk-!-margin-right-3 govuk-!-margin-bottom-3"
                          type={BUTTON_TYPE.SUBMIT}
                          data-module="govuk-button"
                          name="_action"
                          value="edit"
                          data-testid="edit-button"
                          visuallyHiddenText={{
                            text: t("sdFacilityHeading", { ns: "youAddedStorageFacility" }) + " " + item.facilityName,
                            className: "govuk-visually-hidden",
                          }}
                        />
                        {facilities.length > 1 && (
                          <Button
                            id={`remove-facility-${index}`}
                            label={t("commonRemoveButton", { ns: "common" })}
                            className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                            type={BUTTON_TYPE.SUBMIT}
                            data-module="govuk-button"
                            name="_action"
                            value="remove"
                            data-testid="remove-button"
                            visuallyHiddenText={{
                              text: t("sdFacilityHeading", { ns: "youAddedStorageFacility" }) + " " + item.facilityName,
                              className: "govuk-visually-hidden",
                            }}
                          />
                        )}
                      </SecureForm>
                    </dd>
                  </div>
                </dl>
                <hr className="govuk-section-break govuk-section-break--visible  govuk-!-margin-bottom-4" />
              </Fragment>
            );
          })}
          <br />
          <SecureForm method="post" csrf={csrf}>
            <div id="radioButtons" className={`govuk-form-group`}>
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                  <h2 className="govuk-fieldset__heading">
                    {t("sdAddFacilityConfirmationText", { ns: "youAddedStorageFacility" })}
                  </h2>
                </legend>
                <div className="govuk-radios govuk-radios--inline" data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherFacilityYes"
                      name="addAnotherFacility"
                      type="radio"
                      value="Yes"
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="addAnotherFacilityYes">
                      {t("commonYesLabel")}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="addAnotherFacilityNo"
                      name="addAnotherFacility"
                      type="radio"
                      value="No"
                      defaultChecked
                    />
                    <label className="govuk-label govuk-radios__label" htmlFor="addAnotherFacilityNo">
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
            progressUri="/create-storage-document/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default YouHaveAddedAStorageFacility;
