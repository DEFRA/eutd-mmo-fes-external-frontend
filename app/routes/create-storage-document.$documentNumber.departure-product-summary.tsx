import * as React from "react";
import { Button, BUTTON_TYPE, Tab, TabGroup } from "@capgeminiuk/dcx-react-library";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { Main, Title, BackToProgressLink, SecureForm } from "~/components";
import { route } from "routes-gen";
import { Trans, useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { ButtonGroup, WeightInput } from "~/composite-components";
import type { IErrorsTransformed, ITransport, IUnauthorised, StorageDocument, StorageDocumentCatch } from "~/types";
import { backUri, displayErrorMessages, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { ErrorSummary } from "~/components/errorSummary";
import { useScrollOnPageLoad } from "~/hooks";
import { ImportantIcon } from "~/components/icons/ImportantIcon";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getStorageDocument,
  instanceOfUnauthorised,
  removeStorageDocumentCatch,
  updateStorageDocumentCatchDepartureWeights,
  validateCSRFToken,
} from "~/.server";
import { getSessionFromRequest } from "~/sessions.server";
import { json } from "~/communication.server";

type DepartureProductSummaryProps = {
  key: number;
  documentNumber: string;
  catches: StorageDocumentCatch[];
  transport: ITransport;
  defaultActiveTab?: string;
  csrf: string;
  nextUri: string;
};

type ConsignmentWeightTableFormProps = {
  catches: StorageDocumentCatch[] | undefined;
  transportType: "arrival" | "departure";
};

export const ConsignmentWeightTableForm = ({ catches, transportType }: ConsignmentWeightTableFormProps) => {
  const { t } = useTranslation(["sdDepartureProductSummary", "common"]);
  const actionData = useActionData() as { errors?: Record<string, any> } | undefined;
  const errors = actionData?.errors ?? {};
  const isArrival = transportType === "arrival";
  const sdDepartureProductSummaryNetWeightArrival = "sdDepartureProductSummaryNetWeightArrival";
  const sdDepartureProductSummaryNetWeightDeparture = "sdDepartureProductSummaryNetWeightDeparture";

  const getNetProductWeightFromCatches = (catchItem: StorageDocumentCatch | undefined) => {
    if (isArrival) {
      return catchItem?.netWeightProductArrival?.toString();
    } else {
      if (
        !catchItem?.netWeightProductDeparture &&
        !catchItem?.netWeightFisheryProductDeparture &&
        catchItem?.netWeightProductArrival
      ) {
        return catchItem.netWeightProductArrival.toString();
      }
      return catchItem?.netWeightProductDeparture?.toString();
    }
  };

  const getNetFisheryWeightFromCatches = (catchItem: StorageDocumentCatch | undefined) => {
    if (isArrival) {
      return catchItem?.netWeightFisheryProductArrival?.toString();
    } else {
      if (
        !catchItem?.netWeightProductDeparture &&
        !catchItem?.netWeightFisheryProductDeparture &&
        catchItem?.netWeightFisheryProductArrival
      ) {
        return catchItem.netWeightFisheryProductArrival.toString();
      }
      return catchItem?.netWeightFisheryProductDeparture?.toString();
    }
  };

  return (
    <table className="govuk-table" id="depatureProductSummaryTable">
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th
            scope="col"
            className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
          >
            {t("sdDepartureProductSummaryProduct")}
          </th>
          <th
            scope="col"
            className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
          >
            {isArrival ? t(sdDepartureProductSummaryNetWeightArrival) : t(sdDepartureProductSummaryNetWeightDeparture)}
          </th>
          <th
            scope="col"
            className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
          >
            {t("sdDepartureProductSummaryFisheryProduct")}
          </th>
          <th
            scope="col"
            className="govuk-table__header govuk-!-padding-0 govuk-!-text-align-right govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
            aria-label="Actions"
          >
            &nbsp;
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(catches) &&
          catches.map((catchItem: StorageDocumentCatch, index: number) => (
            <tr className="govuk-table__row" key={`producttable-${catchItem.scientificName}-${catchItem.id}`}>
              <td className="govuk-table__cell">
                <p className="govuk-!-margin-0">{catchItem.product}</p>
              </td>
              <td className="govuk-table__cell">
                <WeightInput
                  key={`net-weight-${catchItem.scientificName}-${catchItem.id}`}
                  weightKey={`net-weight-${catchItem.scientificName}-${catchItem.id}`}
                  errorID={
                    isArrival
                      ? `catches-${index}-netWeightProductArrival`
                      : `catches-${index}-netWeightProductDeparture`
                  }
                  inputWidth={8}
                  id="weight"
                  unit="kg"
                  errors={errors ?? {}}
                  formValue={getNetProductWeightFromCatches(catchItem)}
                  speciesId={
                    isArrival ? `net-weight-product-arrival-${index}` : `net-weight-product-departure-${index}`
                  }
                  index={index}
                  exportWeight={
                    isArrival
                      ? catchItem?.netWeightProductArrival?.toString()
                      : catchItem?.netWeightProductDeparture?.toString()
                  }
                  totalWeight={() => {}}
                  readOnly={isArrival}
                  inputType="text"
                />
              </td>
              <td className="govuk-table__cell">
                <WeightInput
                  key={`net-fishery-weight-${catchItem.scientificName}-${catchItem.id}`}
                  weightKey={`net-fishery-weight-${catchItem.scientificName}-${catchItem.id}`}
                  errorID={
                    isArrival
                      ? `catches-${index}-netWeightFisheryProductArrival`
                      : `catches-${index}-netWeightFisheryProductDeparture`
                  }
                  inputWidth={8}
                  id="weight"
                  unit="kg"
                  errors={errors ?? {}}
                  formValue={getNetFisheryWeightFromCatches(catchItem)}
                  speciesId={
                    isArrival
                      ? `net-weight-fishery-product-arrival-${index}`
                      : `net-weight-fishery-product-departure-${index}`
                  }
                  index={index}
                  exportWeight={
                    isArrival
                      ? catchItem?.netWeightFisheryProductArrival?.toString()
                      : catchItem?.netWeightFisheryProductDeparture?.toString()
                  }
                  totalWeight={() => {}}
                  readOnly={isArrival}
                  inputType="text"
                />
              </td>
              <td className="govuk-table__cell govuk-!-text-align-right">
                {isArrival ? (
                  <>
                    <Button
                      label={t("commonEditLink", { ns: "common" })}
                      type={BUTTON_TYPE.SUBMIT}
                      className="govuk-button govuk-!-margin-right-3 govuk-button--secondary"
                      data-module="govuk-button"
                      name="_action"
                      // @ts-ignore
                      value={`edit-` + index}
                      data-testid={`edit-button-${catchItem.id}`}
                    />
                    {catches.length > 1 && (
                      <Button
                        label={t("commonRemoveButton", { ns: "common" })}
                        type={BUTTON_TYPE.SUBMIT}
                        className="govuk-button govuk-!-margin-right-3 govuk-button--secondary"
                        data-module="govuk-button"
                        name="_action"
                        // @ts-ignore
                        value={`remove-` + index}
                        data-testid={`edit-button-${catchItem.id}`}
                      />
                    )}
                  </>
                ) : (
                  <>&nbsp;</>
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

function getFromSearchParams(url: URL, key: string) {
  return url.searchParams.get(key) ?? "";
}

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber = "" } = params;
  // Get bearer token for API requests
  const bearerToken = await getBearerTokenForRequest(request);
  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);

  if (instanceOfUnauthorised(storageDocument)) {
    return redirect("/forbidden");
  }

  if (!storageDocument.transport?.vehicle) {
    return redirect(
      route("/create-storage-document/:documentNumber/how-does-the-export-leave-the-uk", { documentNumber })
    );
  }

  if (!Array.isArray(storageDocument.catches) || storageDocument.catches.length <= 0) {
    return redirect(`/create-storage-document/${documentNumber}/add-product-to-this-consignment`);
  }

  const nextUri = getFromSearchParams(new URL(request.url), "nextUri");

  return json(
    {
      documentNumber,
      catches: storageDocument.catches,
      transport: storageDocument.transport,
      csrf,
      nextUri,
    },
    session
  );
};

export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const form = await request.formData();

  const isNonJs = form.get("isNonJs") === "true";
  const { _action, ...values } = Object.fromEntries(form);
  const saveToRedisIfErrors = true;
  const isDraft = form.get("_action") === "saveAsDraft";

  const isEdit = (_action as string)?.startsWith("edit-");
  const isRemove = (_action as string)?.startsWith("remove-");

  // Validate CSRF token
  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  if (isEdit) {
    const editIndex = (_action as string).split("-")[1];
    return redirect(`/create-storage-document/${documentNumber}/add-product-to-this-consignment/${editIndex}`);
  }

  if (isRemove) {
    const removeIndex = (_action as string).split("-")[1];
    const errorResponse = await removeStorageDocumentCatch(
      bearerToken,
      documentNumber,
      "",
      removeIndex,
      saveToRedisIfErrors,
      false,
      isNonJs
    );

    if (errorResponse) {
      return errorResponse as Response;
    }

    return redirect(`/create-storage-document/${documentNumber}/departure-product-summary`);
  }

  const errorResponse = await updateStorageDocumentCatchDepartureWeights(
    bearerToken,
    documentNumber,
    values,
    `/create-storage-document/${documentNumber}/departure-product-summary`,
    saveToRedisIfErrors,
    false,
    isNonJs
  );

  if (isDraft) {
    return redirect(route("/create-storage-document/storage-documents"));
  }

  // If errorResponse is a Response, extract its body as text
  if (errorResponse instanceof Response) {
    const body = await errorResponse.text();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  return isEmpty(values.nextUri)
    ? redirect(`/create-storage-document/${documentNumber}/progress`)
    : redirect(values.nextUri as string);
};

const DepartureProductSummary = () => {
  const { documentNumber, catches, csrf, displayOptionalSuffix, transport, nextUri } =
    useLoaderData<DepartureProductSummaryProps>();
  const actionData = useActionData() as { errors?: Record<string, unknown> } | undefined;
  const errors = actionData?.errors ?? {};
  const { t } = useTranslation(["sdDepartureProductSummary", "common"]);
  const tabRef = useRef<{ updateActiveTab: (id: string) => boolean } | null>();
  const handleTab: (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void = () => {
    if (tabRef.current) {
      tabRef.current.updateActiveTab("storageDepartureTab");
    }

    scrollToId("storageDepartureTab");
  };

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  const consignmentTableTabParams = {
    catches,
    csrf,
    displayOptionalSuffix: displayOptionalSuffix,
    documentNumber,
  };

  return (
    <Main backUrl={`/create-storage-document/${documentNumber}/${backUri(transport, "storageNotes")}`}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors as IErrorsTransformed)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("sdDepartureProductSummaryHeading")} />
          <div className="govuk-!-display-inline-block">
            <div className="govuk-!-display-inline-block govuk-!-margin-bottom-4">
              <ImportantIcon />
            </div>
            <div
              className="govuk-!-display-inline-block govuk-!-padding-left-2 govuk-phase-banner__text"
              style={{ width: "90%" }}
              id="sdProductSummaryGuidanceMessage"
            >
              <Trans i18nKey="multiline">
                <strong>{t("sdDepartureProductSummaryInfo")}</strong>
              </Trans>
            </div>
          </div>
          <div className="govuk-tabs" data-module="govuk-tabs" id="productTabs">
            <SecureForm method="post" csrf={csrf}>
              <TabGroup
                containerClassName="govuk-tabs"
                className="govuk-tabs__list"
                tabClassName="govuk-tabs__list-item"
                tabLinkClassName="govuk-tabs__tab"
                activeTabClassName="govuk-tabs__list-item--selected"
                contentClassName="govuk-tabs__panel"
                onSelect={() => handleTab}
                ref={tabRef}
                activeKey="storageDepartureTab"
              >
                <Tab eventKey="storageArrivalTab" label={t("sdDepartureProductSummaryTabHeading1")}>
                  <div id="storage-arrival-tab">
                    <h2 className="govuk-heading-l">{t("sdDepartureProductSummaryTabHeading1")}</h2>
                    <ConsignmentWeightTableForm transportType="arrival" {...consignmentTableTabParams} />
                  </div>
                </Tab>
                <Tab eventKey="storageDepartureTab" label={t("sdDepartureProductSummaryTabHeading2")}>
                  <div id="storage-departure-tab">
                    <h2 className="govuk-heading-l">{t("sdDepartureProductSummaryTabHeading2")}</h2>
                    <ConsignmentWeightTableForm transportType="departure" {...consignmentTableTabParams} />
                  </div>
                </Tab>
              </TabGroup>
              <ButtonGroup saveButtonLabel={t("sdDepartureProductSummarySaveButtonLabel")} />
              <input type="hidden" name="nextUri" value={nextUri} />
            </SecureForm>
            <BackToProgressLink
              progressUri="/create-storage-document/:documentNumber/progress"
              documentNumber={documentNumber}
            />
          </div>
        </div>
      </div>
    </Main>
  );
};

export default DepartureProductSummary;
