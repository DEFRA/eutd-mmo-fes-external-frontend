import * as React from "react";
import {
  Main,
  Title,
  BackToProgressLink,
  AutocompleteFormField,
  ErrorSummary,
  SecureForm,
  ErrorMessage,
} from "~/components";
import { type LoaderFunction, type ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import {
  ButtonGroup,
  EntryDocumentGuidanceText,
  ProductArrivalCommodityDetails,
  ProductArrivalSpeciesDetails,
} from "~/composite-components";
import { getEnv } from "~/env.server";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { FormInput, ErrorPosition, Button, BUTTON_TYPE, Details } from "@capgeminiuk/dcx-react-library";
import {
  getAllSpecies,
  getCommodities,
  getStorageDocument,
  validateResponseData,
  getBearerTokenForRequest,
  instanceOfUnauthorised,
  getStorageDocumentCatchDetails,
  updateStorageDocumentCatchDetails,
  createCSRFToken,
  validateCSRFToken,
} from "~/.server";
import { useHydrated } from "remix-utils/use-hydrated";
import type {
  Species,
  LabelAndValue,
  CodeAndDescription,
  StorageDocument,
  IUnauthorised,
  StorageDocumentCatch,
  DocIssuedInUkRadioSelectOptionType,
  DocIssuedInUkRadioSelectType,
} from "~/types";
import { querySpecies, getCodeFromLabel, displayErrorMessages, scrollToId } from "~/helpers";
import setApiMock from "tests/msw/helpers/setApiMock";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import { transformedErrors, getKeysAndValues } from "~/helpers/speciesErrorsTransform";
import { commitSession, getSessionFromRequest } from "~/sessions.server";
import { json } from "~/communication.server";
import { confirmDocIssuedInUkRadioSelectTypeOptions } from "~/helpers/storageDocument";

interface ILoaderData {
  documentNumber: string;
  speciesExemptLink: string;
  commodityCodeLink: string;
  species: Species[];
  commodityCodes: LabelAndValue[];
  productIndex?: number;
  catchDetails?: StorageDocumentCatch;
  nextUri?: string;
  csrf: string;
  displayOptionalSuffix: boolean;
  maximumEntryDocsAllowed: number;
  updatedSupportingDocuments: string[];
}

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;
  const species = await getAllSpecies();
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const productIndex = parseInt(params["*"] ?? "") || 0;
  const commodities: CodeAndDescription[] = await getCommodities();
  const speciesExemptLink = getEnv().SPECIES_EXEMPT_LINK;
  const commodityCodeLink = getEnv().COMMODITY_CODE_LINK;
  const bearerToken = await getBearerTokenForRequest(request);
  const storageDocument: StorageDocument | IUnauthorised = await getStorageDocument(bearerToken, documentNumber);
  const displayOptionalSuffix = getEnv().EU_CATCH_FIELDS_OPTIONAL === "true";
  const maximumEntryDocsAllowed = getEnv().EU_SD_MAX_ENTRY_DOCS;

  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  if (instanceOfUnauthorised(storageDocument)) {
    return redirect("/forbidden");
  }

  validateResponseData(storageDocument);

  const { validCatchIndex, currentCatchDetails = {} } = getStorageDocumentCatchDetails(storageDocument, productIndex);

  const isAddSupportingDocumentButtonClicked = session.get("addSupportingDoc");

  let updatedSupportingDocuments: string[] =
    ((currentCatchDetails as StorageDocumentCatch) || undefined)?.supportingDocuments ?? [];
  if (isAddSupportingDocumentButtonClicked) {
    updatedSupportingDocuments = [...updatedSupportingDocuments, ""];
    session.unset("addSupportingDoc");
  }

  return json(
    {
      documentNumber,
      speciesExemptLink,
      commodityCodeLink,
      productIndex,
      catchDetails: currentCatchDetails || {},
      updatedSupportingDocuments: updatedSupportingDocuments,
      catchIndex: validCatchIndex,
      nextUri,
      species: Array.isArray(species) ? species : [],
      commodityCodes: Array.isArray(commodities)
        ? commodities.map((commodityCode: CodeAndDescription) => ({
            label: `${commodityCode.code} - ${commodityCode.description}`,
            value: commodityCode.code,
            description: commodityCode.description,
          }))
        : [],
      csrf,
      displayOptionalSuffix,
      maximumEntryDocsAllowed: parseInt(maximumEntryDocsAllowed, 10),
    },
    session
  );
};

const getUpdateStorageDocumentData = (
  commodityCode: string,
  values: {
    [k: string]: FormDataEntryValue;
  },
  scientificName: string | undefined,
  supportingDocumentsFromForm: string[]
) => ({
  commodityCode: commodityCode,
  product: values.species as string,
  scientificName: scientificName as string,
  certificateNumber: values.entryDocument as string,
  weightOnCC: values.weight as string,
  certificateType: values.docIssuedInUk as DocIssuedInUkRadioSelectType,
  supportingDocuments: supportingDocumentsFromForm.length > 0 ? supportingDocumentsFromForm : undefined,
  productDescription: !isEmpty(values.productDescription) ? (values.productDescription as string) : undefined,
  netWeightProductArrival: !isEmpty(values.netWeightProductArrival)
    ? (values.netWeightProductArrival as string)
    : undefined,
  netWeightFisheryProductArrival: !isEmpty(values.netWeightFisheryProductArrival)
    ? (values.netWeightFisheryProductArrival as string)
    : undefined,
});
export const action: ActionFunction = async ({ request, params }): Promise<Response> => {
  const { documentNumber } = params;
  const bearerToken = await getBearerTokenForRequest(request);
  const productIndex = parseInt(params["*"] ?? "") || 0;
  const productIndexUrlFragment = productIndex >= 0 ? `/${productIndex}` : "";
  const form = await request.formData();
  const isNonJs = form.get("isNonJs") === "true";
  const { _action, ...values } = Object.fromEntries(form);
  const isDraft = form.get("_action") === "saveAsDraft";
  const addSupportingDoc = form.get("_action") === "addSupportingDoc";
  const removeSupportingDoc = getRemoveSupportingDoc(form, _action as string);
  const removeIndex = getRemoveIndex(removeSupportingDoc, _action as string);
  const nextUri = form.get("nextUri") as string;
  const session = await getSessionFromRequest(request);

  const faoCode = getCodeFromLabel(values?.species as string);
  const commodityCode = (values["commodityCode"] as string).split(" - ")[0];

  let scientificName;

  const allSpecies: Species[] = await getAllSpecies();

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  if (Array.isArray(allSpecies)) {
    ({ scientificName } = allSpecies.find((s: Species) => s.faoCode === faoCode) ?? {});
  }

  const supportingDocumentsFromForm = form.getAll("supportingDocuments").filter(Boolean) as string[];
  if (isNonJs && removeSupportingDoc && removeIndex > -1) {
    supportingDocumentsFromForm.splice(removeIndex, 1);
  }

  const updateData: Partial<StorageDocument | StorageDocumentCatch> = getUpdateStorageDocumentData(
    commodityCode,
    values,
    scientificName,
    supportingDocumentsFromForm
  );
  const saveToRedisIfErrors = true;
  const errorResponse = await updateStorageDocumentCatchDetails(
    bearerToken,
    documentNumber,
    { ...updateData },
    `/create-storage-document/${documentNumber}/add-product-to-this-consignment${productIndexUrlFragment}`,
    productIndex,
    saveToRedisIfErrors,
    false,
    isNonJs
  );

  if (errorResponse) {
    return errorResponse as Response;
  }

  if (isDraft) {
    return redirect(route("/create-storage-document/storage-documents"));
  }

  if (addSupportingDoc && isNonJs) {
    session.set("addSupportingDoc", true);
    return redirect("?#add-supporting-doc", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (removeSupportingDoc && isNonJs) {
    return redirect("?#remove-supporting-doc", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return redirect(
    isEmpty(nextUri)
      ? `/create-storage-document/${documentNumber}/you-have-added-a-product`
      : `/create-storage-document/${documentNumber}/you-have-added-a-product?nextUri=${nextUri}`
  );
};

const getRemoveSupportingDoc = (form: FormData, action: string) =>
  form.get("_action") === null ? false : action.startsWith("removeSupportingDoc");

const getRemoveIndex = (removeSupportingDoc: boolean, action: string) =>
  removeSupportingDoc ? parseInt(action.split("-")[1], 10) : -1;

const AddProduct = () => {
  const {
    documentNumber,
    speciesExemptLink,
    commodityCodeLink,
    species,
    commodityCodes,
    productIndex,
    catchDetails,
    nextUri,
    csrf,
    displayOptionalSuffix,
    maximumEntryDocsAllowed,
    updatedSupportingDocuments,
  } = useLoaderData<ILoaderData>();
  const { t } = useTranslation();
  const { errors = {} } = useActionData<{ errors: any }>() ?? {};
  const isHydrated = useHydrated();
  const [selectedCommodityCode, setSelectedCommodityCode] = useState<string | undefined>();
  const [isNonJs, setIsNonJs] = useState(true);

  const commodityCodeKey = `catches-${productIndex}-commodityCode`;
  const productKey = `catches-${productIndex}-product`;
  const speciesKey = "catches-species";
  const weightKey = `catches-${productIndex}-weightOnCC`;
  const certificateTypeKey = `catches-${productIndex}-certificateType`;
  const certKey = `catches-${productIndex}-certificateNumber`;
  const supportingDocumentsKey = `catches-${productIndex}-supportingDocuments`;
  const productDescriptionKey = `catches-${productIndex}-productDescription`;
  const netWeightProductArrivalKey = `catches-${productIndex}-netWeightProductArrival`;
  const netWeightFisheryProductArrivalKey = `catches-${productIndex}-netWeightFisheryProductArrival`;

  const supportingDocumentsLabel = t(
    `${displayOptionalSuffix ? "supportingDocumentsOptional" : "supportingDocuments"}`,
    {
      ns: "addProductToThisConsignment",
    }
  );

  const hasCatchesSpeciesError = Object.keys(errors).some((key) => key.startsWith(speciesKey));

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useEffect(() => {
    if (isHydrated) {
      setIsNonJs(false);
    }
  }, [isHydrated]);

  const allErrors = transformedErrors(errors);
  const keysAndValues = getKeysAndValues(allErrors, speciesKey);

  const getErrorMessageForSpecies = (): string => {
    if (isHydrated || (!isHydrated && errors?.[productKey]?.message)) {
      return t(errors?.[productKey]?.message, { ns: "errorsText" });
    } else {
      return t(keysAndValues?.key, { dynamicValue: keysAndValues?.value, ns: "errorsText" });
    }
  };

  const constructErrorProps = (fieldKey: string) =>
    errors?.[fieldKey]?.message ? { className: "govuk-error-message" } : {};
  const constructStaticErrorMessage = (fieldKey: string) =>
    errors?.[fieldKey]?.message ? t(errors?.[fieldKey]?.message, { ns: "errorsText" }) : "";
  const constructContainerClassNameError = (fieldKey: string) =>
    errors?.[fieldKey]?.message ? "govuk-form-group--error" : "";

  const [supportingDocuments, setSupportingDocuments] = useState<string[]>(
    updatedSupportingDocuments?.length ? [...updatedSupportingDocuments] : [""]
  );

  const handleAddDoc = () => {
    if (supportingDocuments.length < maximumEntryDocsAllowed) {
      setSupportingDocuments((prev) => [...prev, ""]);
    }
  };

  const handleRemoveDoc = (index: number) => {
    if (supportingDocuments.length > 1) {
      setSupportingDocuments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleInputChange = (index: number, value: string) => {
    setSupportingDocuments((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const confirmTypeOptions = confirmDocIssuedInUkRadioSelectTypeOptions;
  const labelText = t("documentIssuedInTheUK", { ns: "addProductToThisConsignment" });
  const hintText = t("documentIssuedInTheUKHint", { ns: "addProductToThisConsignment" });
  const value = catchDetails?.certificateType;
  const getOptionLabel = (option: DocIssuedInUkRadioSelectOptionType) => t(option.label, { ns: "common" });

  return (
    <Main backUrl={route("/create-storage-document/:documentNumber/add-exporter-details", { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(allErrors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title title={t("productDetails", { ns: "addProductToThisConsignment" })} />
        </div>
      </div>
      <div className="govuk-warning-text" data-testid="warning-message">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">
          {t("productDetailsInfoText", { ns: "addProductToThisConsignment" })}
        </strong>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm
            method="post"
            action={`/create-storage-document/${documentNumber}/add-product-to-this-consignment/${productIndex}`}
            csrf={csrf}
          >
            <div className="add-landings-form">
              <div
                id={certificateTypeKey}
                className={
                  !isEmpty(errors?.[certificateTypeKey])
                    ? "govuk-form-group govuk-form-group--error"
                    : "govuk-form-group"
                }
              >
                <fieldset
                  className="govuk-fieldset"
                  aria-describedby={
                    !isEmpty(errors?.[certificateTypeKey]) ? "certificateType-error" : `${certificateTypeKey}-hint`
                  }
                >
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor={certificateTypeKey}>
                    <b>{labelText}</b>
                  </label>
                  <div id={`${certificateTypeKey}-hint`} className="govuk-hint">
                    {hintText}
                  </div>
                  {!isEmpty(errors?.[certificateTypeKey]) && (
                    <ErrorMessage
                      id="certificateType-error"
                      text={t(errors?.[certificateTypeKey]?.message, { ns: "errorsText" })}
                      visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                    />
                  )}
                  <div className="govuk-radios govuk-radios--inline">
                    {confirmTypeOptions.map((option: DocIssuedInUkRadioSelectOptionType) => (
                      <div key={option.id} className="govuk-radios__item">
                        <input
                          id={option.id}
                          type="radio"
                          name="docIssuedInUk"
                          className="govuk-radios__input"
                          value={option.value}
                          defaultChecked={option.value === value}
                          aria-describedby={`${certificateTypeKey}-hint`}
                        />
                        <label htmlFor={option.id} className="govuk-label govuk-radios__label">
                          {getOptionLabel(option)}
                        </label>
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
              <FormInput
                containerClassName="govuk-form-group"
                label={t("entryDocument", { ns: "addProductToThisConsignment" })}
                labelClassName="govuk-label govuk-!-font-weight-bold"
                name="entryDocument"
                type="text"
                inputClassName={classNames("govuk-input govuk-!-width-one-half", {
                  "govuk-input--error": errors?.[certKey]?.message,
                })}
                inputProps={{
                  id: certKey,
                  defaultValue: catchDetails?.certificateNumber,
                  "aria-describedby": `${certKey}-hint`,
                }}
                hint={{
                  id: `${certKey}-hint`,
                  position: "above",
                  text: `${t("entryDocumentHint", { ns: "addProductToThisConsignment" })}`,
                  className: "govuk-hint",
                }}
                errorPosition={ErrorPosition.AFTER_LABEL}
                errorProps={constructErrorProps(certKey)}
                staticErrorMessage={constructStaticErrorMessage(certKey)}
                containerClassNameError={constructContainerClassNameError(certKey)}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              />
              <FormInput
                containerClassName="govuk-form-group"
                label={t("weightOnDocumentLabel", { ns: "addProductToThisConsignment" })}
                name="weight"
                type="text"
                inputClassName={classNames("govuk-input govuk-!-width-one-quarter", {
                  "govuk-input--error": errors?.[weightKey]?.message,
                })}
                inputProps={{
                  id: weightKey,
                  defaultValue: catchDetails?.weightOnCC,
                  "aria-describedby": `hint-${weightKey}`,
                }}
                hint={{
                  id: `hint-${weightKey}`,
                  position: "above",
                  text: t("weightOnCcHint", { ns: "addProductToThisConsignment" }),
                  className: "govuk-hint",
                }}
                errorProps={constructErrorProps(weightKey)}
                staticErrorMessage={constructStaticErrorMessage(weightKey)}
                errorPosition={ErrorPosition.AFTER_LABEL}
                containerClassNameError={constructContainerClassNameError(weightKey)}
                hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                labelClassName="govuk-!-font-weight-bold"
              />
              <EntryDocumentGuidanceText />
              <fieldset className="govuk-fieldset" aria-describedby={`${supportingDocumentsKey}-0-hint`}>
                {supportingDocuments.map((value: string, index: number) => (
                  <div
                    key={`supporting-document-${index + 1}`}
                    className="govuk-button-group govuk-!-margin-bottom-4"
                    style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}
                  >
                    <FormInput
                      containerClassName="govuk-!-width-one-half govuk-!-margin-right-3"
                      labelClassName="govuk-label govuk-!-font-weight-bold"
                      label={index === 0 ? supportingDocumentsLabel : undefined}
                      name="supportingDocuments"
                      type="text"
                      inputClassName={classNames("govuk-input")}
                      inputProps={{
                        value,
                        id: `${supportingDocumentsKey}-${index}`,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(index, e.target.value),
                        "aria-describedby": `${supportingDocumentsKey}-${index}-hint`,
                      }}
                      hint={
                        index === 0
                          ? {
                              id: `${supportingDocumentsKey}-${index}-hint`,
                              position: "above",
                              text: t("supportingDocumentsHint", { ns: "addProductToThisConsignment" }),
                              className: "govuk-hint",
                            }
                          : undefined
                      }
                      errorPosition={ErrorPosition.AFTER_LABEL}
                      errorProps={
                        errors?.[`${supportingDocumentsKey}-${index}`]?.message
                          ? { className: "govuk-error-message" }
                          : {}
                      }
                      staticErrorMessage={
                        errors?.[`${supportingDocumentsKey}-${index}`]?.message
                          ? t(errors[`${supportingDocumentsKey}-${index}`].message, { ns: "errorsText" })
                          : ""
                      }
                      containerClassNameError={
                        errors?.[`${supportingDocumentsKey}-${index}`]?.message ? "govuk-form-group--error" : ""
                      }
                      hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                      hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                    />
                    {supportingDocuments.length > 1 && (
                      <Button
                        key={`remove-supporting-doc-${index + 1}`}
                        id={`remove-supporting-doc-button-${index}`}
                        data-testid={`remove-supporting-doc-${index}`}
                        label={t("commonRemoveButton", { ns: "common" })}
                        className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                        type={!isHydrated ? BUTTON_TYPE.SUBMIT : BUTTON_TYPE.BUTTON}
                        data-module="govuk-button"
                        onClick={() => handleRemoveDoc(index)}
                        style={{ top: "15px" }}
                        name="_action"
                        // @ts-ignore
                        value={`removeSupportingDoc-${index}`}
                        aria-label={t("commonRemoveButton", { ns: "addProductToThisConsignment" })}
                      />
                    )}
                  </div>
                ))}
                {supportingDocuments.length < maximumEntryDocsAllowed && (
                  <Button
                    id="add-supporting-doc-button"
                    data-testid="add-supporting-doc-button"
                    label={t("commonAddAnotherButtonText", { ns: "common" })}
                    className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
                    type={!isHydrated ? BUTTON_TYPE.SUBMIT : BUTTON_TYPE.BUTTON}
                    data-module="govuk-button"
                    onClick={handleAddDoc}
                    aria-label={t("commonAddAnotherButtonText", { ns: "common" })}
                    name="_action"
                    value="addSupportingDoc"
                  />
                )}
              </fieldset>
              <Details
                detailsTextClassName="govuk-details__text"
                detailsClassName="govuk-details"
                summaryClassName="govuk-details__summary"
                summary={t("supportingDocumentsGuidanceTitle", { ns: "addProductToThisConsignment" })}
              >
                <>
                  <p>{t("supportingDocumentsGuidanceTextOne", { ns: "addProductToThisConsignment" })}</p>
                  <p>{t("supportingDocumentsGuidanceTextTwo", { ns: "addProductToThisConsignment" })}</p>
                  <p>{t("supportingDocumentsGuidanceTextThree", { ns: "addProductToThisConsignment" })}</p>
                  <ul className="govuk-list govuk-list--bullet">
                    <li key="1">{t("supportingDocumentsGuidanceTextFour", { ns: "addProductToThisConsignment" })}</li>
                    <li key="2">{t("supportingDocumentsGuidanceTextFive", { ns: "addProductToThisConsignment" })}</li>
                    <li key="3">{t("supportingDocumentsGuidanceTextSix", { ns: "addProductToThisConsignment" })}</li>
                  </ul>
                </>
              </Details>
            </div>
            <br></br>
            <AutocompleteFormField
              id={`catches-${productIndex}-product`}
              name="species"
              errorMessageText={getErrorMessageForSpecies()}
              defaultValue={catchDetails?.product ?? ""}
              options={isHydrated ? species : ["", ...species.map((s: Species) => `${s.faoName} (${s.faoCode})`)]}
              optionsId="species-option"
              labelClassName="govuk-label govuk-!-font-weight-bold"
              labelText={t("speciesNameText", { ns: "addProductToThisConsignment" })}
              hintText={t("speciesNameHintText", { ns: "addProductToThisConsignment" })}
              containerClassName={classNames("govuk-form-group", {
                "govuk-form-group--error": errors?.[productKey]?.message ?? hasCatchesSpeciesError,
              })}
              selectProps={{
                selectClassName: classNames("govuk-select govuk-!-width-one-half", {
                  "govuk-select--error": errors?.[productKey]?.message,
                }),
              }}
              inputProps={{
                className: classNames("govuk-input govuk-!-width-one-half", {
                  "govuk-input--error": errors?.[productKey]?.message,
                }),
                "aria-describedby": `catches-${productIndex}-product-hint`,
              }}
              searchHandler={querySpecies}
              customNonJSComp={
                <FormInput
                  containerClassName="govuk-form-group govuk-!-width-full"
                  name="species"
                  type="text"
                  inputClassName={classNames("govuk-input", {
                    "govuk-input--error": hasCatchesSpeciesError,
                  })}
                  inputProps={{
                    defaultValue: catchDetails?.product ?? "",
                    id: Object.keys(allErrors)[0],
                  }}
                  hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
                  hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
                />
              }
            />
            <ProductArrivalSpeciesDetails speciesExemptLink={speciesExemptLink} />
            <AutocompleteFormField
              id={`catches-${productIndex}-commodityCode`}
              name="commodityCode"
              labelText={t("commonCommodityCodeLabel", { ns: "common" })}
              labelClassName="govuk-label govuk-!-font-weight-bold"
              hintText={t("commodityHintText", { ns: "addProductToThisConsignment" })}
              errorMessageText={t(errors?.[commodityCodeKey]?.message, { ns: "errorsText" })}
              defaultValue={
                commodityCodes.find((autoCompleteOption) => autoCompleteOption.value === catchDetails?.commodityCode)
                  ?.label ??
                selectedCommodityCode ??
                ""
              }
              options={
                isHydrated
                  ? commodityCodes.map(({ label }) => label)
                  : ["", ...commodityCodes.map(({ label }) => label)]
              }
              optionsId="commodity-option"
              containerClassName={classNames("govuk-form-group", {
                "govuk-form-group--error": errors?.[commodityCodeKey]?.message,
              })}
              selectProps={{
                selectClassName: classNames("govuk-select govuk-!-width-one-half", {
                  "govuk-select--error": errors?.[commodityCodeKey]?.message,
                }),
              }}
              inputProps={{
                className: classNames("govuk-input govuk-!-width-one-half", {
                  "govuk-input--error": errors?.[commodityCodeKey]?.message,
                }),
                "aria-describedby": `catches-${productIndex}-commodityCode-hint`,
              }}
              onSelected={(value) => setSelectedCommodityCode(value)}
            />
            <ProductArrivalCommodityDetails commodityCodeLink={commodityCodeLink} />
            <FormInput
              containerClassName="govuk-form-group"
              label={t(`${displayOptionalSuffix ? "productDescriptionOptional" : "productDescription"}`, {
                ns: "addProductToThisConsignment",
              })}
              labelClassName="govuk-label govuk-!-font-weight-bold"
              name="productDescription"
              type="text"
              inputProps={{
                id: productDescriptionKey,
                defaultValue: catchDetails?.productDescription,
                "aria-describedby": `${productDescriptionKey}-hint`,
              }}
              data-testid="productDescription"
              errorProps={constructErrorProps(productDescriptionKey)}
              staticErrorMessage={constructStaticErrorMessage(productDescriptionKey)}
              containerClassNameError={constructContainerClassNameError(productDescriptionKey)}
              errorPosition={ErrorPosition.AFTER_LABEL}
              inputClassName={"govuk-input govuk-!-width-one-half"}
              hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
              hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
              hint={{
                id: `${productDescriptionKey}-hint`,
                position: "above",
                text: t("productDescriptionHint", { ns: "addProductToThisConsignment" }),
                className: "govuk-hint",
              }}
            />
            <div
              className={classNames("govuk-form-group", {
                "govuk-form-group--error": errors?.[netWeightProductArrivalKey]?.message,
              })}
              id={netWeightProductArrivalKey}
              aria-describedby={`${netWeightProductArrivalKey}-hint`}
            >
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="netWeightProductArrival">
                {t(`${displayOptionalSuffix ? "netWeightOfProductOnArrivalOptional" : "netWeightOfProductOnArrival"}`, {
                  ns: "addProductToThisConsignment",
                })}
              </label>
              {errors?.[netWeightProductArrivalKey] && (
                <p id="netWeightProductArrival-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">{t("commonErrorText", { ns: "errorsText" })}</span>{" "}
                  {t(errors?.[netWeightProductArrivalKey].message, { ns: "errorsText" })}
                </p>
              )}
              <div id={`${netWeightProductArrivalKey}-hint`} className="govuk-hint">
                {t("netWeightOfProductOnArrivalHint", { ns: "addProductToThisConsignment" })}
              </div>
              <div className="govuk-input__wrapper">
                <input
                  className={classNames("govuk-input govuk-input--width-10", {
                    "govuk-input--error": errors?.[netWeightProductArrivalKey],
                  })}
                  id="netWeightProductArrival"
                  name="netWeightProductArrival"
                  type="text"
                  spellCheck="false"
                  defaultValue={catchDetails?.netWeightProductArrival}
                  minLength={0}
                  maxLength={16}
                  size={16}
                />
                <div className="govuk-input__suffix" aria-hidden="true">
                  kg
                </div>
              </div>
            </div>
            <div
              className={classNames("govuk-form-group", {
                "govuk-form-group--error": errors?.[netWeightFisheryProductArrivalKey]?.message,
              })}
              id={netWeightFisheryProductArrivalKey}
              aria-describedby={`${netWeightFisheryProductArrivalKey}-hint`}
            >
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="netWeightFisheryProductArrival">
                {t(
                  `${displayOptionalSuffix ? "netWeightOfFisheryProductOnArrivalOptional" : "netWeightOfFisheryProductOnArrival"}`,
                  {
                    ns: "addProductToThisConsignment",
                  }
                )}
              </label>
              {errors?.[netWeightFisheryProductArrivalKey] && (
                <p id="netWeightProductArrival-error" className="govuk-error-message">
                  <span className="govuk-visually-hidden">{t("commonErrorText", { ns: "errorsText" })}</span>{" "}
                  {t(errors?.[netWeightFisheryProductArrivalKey].message, { ns: "errorsText" })}
                </p>
              )}
              <div id={`${netWeightFisheryProductArrivalKey}-hint`} className="govuk-hint">
                {t("netWeightOfFisheryProductOnArrivalHint", { ns: "addProductToThisConsignment" })}
              </div>
              <div className="govuk-input__wrapper">
                <input
                  className={classNames("govuk-input govuk-input--width-10", {
                    "govuk-input--error": errors?.[netWeightFisheryProductArrivalKey],
                  })}
                  id="netWeightFisheryProductArrival"
                  name="netWeightFisheryProductArrival"
                  type="text"
                  spellCheck="false"
                  defaultValue={catchDetails?.netWeightFisheryProductArrival}
                  minLength={0}
                  maxLength={16}
                  size={16}
                />
                <div className="govuk-input__suffix" aria-hidden="true">
                  kg
                </div>
              </div>
            </div>
            <ButtonGroup />
            <input type="hidden" name="nextUri" value={nextUri} />
            <input type="hidden" name="isNonJs" value={isNonJs} />
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

export default AddProduct;
