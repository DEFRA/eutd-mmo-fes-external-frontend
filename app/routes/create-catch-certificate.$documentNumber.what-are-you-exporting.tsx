import * as React from "react";
import { Button, BUTTON_TYPE, Tab, TabGroup } from "@capgeminiuk/dcx-react-library";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import {
  Main,
  Title,
  BackToProgressLink,
  AutocompleteFormField,
  NotificationBanner,
  ManageYourProductFavouritesLink,
  SecureForm,
} from "~/components";
import { route } from "routes-gen";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { ProductsTable, AddProducts, ButtonGroup } from "~/composite-components";
import type { ErrorResponse, LabelAndValue, Product, SearchState, Species } from "~/types";
import { displayErrorMessages, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { ErrorSummary } from "~/components/errorSummary";
import { useScrollOnPageLoad } from "~/hooks";
import { WhatAreYouExportingAction, WhatAreYouExportingLoader } from "~/models";

type WhatAreYouExportingProps = {
  key: number;
  documentNumber: string;
  maxLandingsLimit: number;
  speciesExemptLink: string;
  species: Species[];
  favourites: Species[];
  stateLookup: SearchState[];
  commodityCodes: LabelAndValue[];
  faoName: string;
  faoCode: string;
  stateLabel: string;
  stateCode: string;
  presentationLabel: string;
  presentationCode: string;
  commodityCode: string;
  scientificName: string;
  products: Product[];
  isEditMode: boolean;
  isProductAddSuccess: string;
  isProductAddFailure: string;
  loaderSpecies: string;
  nextUri: string;
  defaultActiveTab?: string;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request, params }) => WhatAreYouExportingLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  WhatAreYouExportingAction(request, params);

const WhatAreYouExporting = () => {
  const {
    key,
    documentNumber,
    maxLandingsLimit,
    speciesExemptLink,
    favourites,
    species,
    stateLookup,
    faoCode,
    stateLabel,
    stateCode,
    presentationLabel,
    presentationCode,
    commodityCodes,
    commodityCode,
    products,
    scientificName,
    isEditMode,
    isProductAddSuccess,
    isProductAddFailure,
    loaderSpecies,
    nextUri,
    csrf,
  } = useLoaderData<WhatAreYouExportingProps>();
  const {
    errors = {},
    addToFavourites,
    species: selectedSpecies,
    state: selectedState,
    presentation: selectedPresentation,
    stateLookup: stateLookupNonJs,
    commodityCodes: commodityCodesNonJs,
    commodityCode: selectedCommodityCodeNonJs,
    presentationLabel: presentationLabelNonJs,
    stateLabel: stateLabelNonJs,
  } = useActionData() ?? {};
  const { t } = useTranslation(["whatAreYouExporting", "common"]);
  const tabRef = useRef<{ updateActiveTab: (id: string) => boolean } | null>();
  const handleTab: (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void = () => {
    if (tabRef.current) {
      tabRef.current.updateActiveTab("productsTab");
    }

    scrollToId("productsTab");
  };

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={route("/create-catch-certificate/:documentNumber/add-exporter-details", { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      {isProductAddSuccess && (
        <NotificationBanner
          header={t("commonImportant", { ns: "common" })}
          messages={[
            `${t("commonProductText", { ns: "common" })} ${isProductAddSuccess} ${t(
              "ccWhatExportingFromAddtoFavouriteNotification",
              { ns: "whatAreYouExporting" }
            )}`,
          ]}
        />
      )}
      {isProductAddFailure && (
        <NotificationBanner
          header={t("commonImportant", { ns: "common" })}
          messages={[
            `${t("commonProductText", { ns: "common" })} ${isProductAddFailure} ${t(
              "ccWhatExportingFromProductExistNotification",
              { ns: "whatAreYouExporting" }
            )}`,
          ]}
        />
      )}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <div className="govuk-inset-text" id="speciesAndLandingsGuidanceMessage">
            <p>{t("ccAddSpeciesPageGuidanceMessageHeaderText")}</p>
            <ul className="govuk-list govuk-list--bullet">
              <li>{t("ccAddSpeciesPageGuidanceMessageHeader1LiText")}</li>
              <li>{t("ccAddSpeciesPageGuidanceMessageHeader2LiText", { maxLandingsLimit })}</li>
            </ul>
          </div>
          <Title title={t("ccAddSpeciesPageHeader")} />
          <div className="govuk-tabs" data-module="govuk-tabs" id="productTabs">
            <TabGroup
              containerClassName="govuk-tabs"
              className="govuk-tabs__list"
              tabClassName="govuk-tabs__list-item"
              tabLinkClassName="govuk-tabs__tab"
              activeTabClassName="govuk-tabs__list-item--selected"
              contentClassName="govuk-tabs__panel"
              onSelect={() => handleTab}
              ref={tabRef}
            >
              <Tab eventKey="productsTab" label={t("ccAddSpeciesPageH2Text")}>
                <div id="add-products">
                  <h2 className="govuk-heading-l">{t("ccAddSpeciesPageH2Text")}</h2>
                  <SecureForm method="post" csrf={csrf}>
                    <AddProducts
                      key={key}
                      speciesExemptLink={speciesExemptLink}
                      primaryButtonLabel={t("ccAddSpeciesPageAddButtonText")}
                      species={species}
                      states={
                        !isEmpty(stateLookup)
                          ? stateLookup.map((_: SearchState) => ({ label: _.state.label, value: _.state.value })) ?? []
                          : stateLookupNonJs?.map((_: SearchState) => ({
                              label: _.state.label,
                              value: _.state.value,
                            })) ?? []
                      }
                      presentations={
                        !isEmpty(stateLookup)
                          ? stateLookup?.find((_: SearchState) => _.state.value === stateCode)?.presentations ?? []
                          : stateLookupNonJs?.find((_: SearchState) => _.state.value === selectedState)
                              ?.presentations ?? []
                      }
                      selectedSpecies={selectedSpecies ?? loaderSpecies}
                      selectedState={selectedState ?? stateCode}
                      selectedPresentation={selectedPresentation ?? presentationCode}
                      selectedCommodityCode={selectedCommodityCodeNonJs ?? commodityCode}
                      commodityCodes={commodityCodesNonJs ?? commodityCodes}
                      errors={Object.keys(errors).reduce(
                        (prev, curr) => ({
                          ...prev,
                          [errors[curr].key]: { key: errors[curr].key, message: errors[curr].message },
                        }),
                        {}
                      )}
                      stateLabel={stateLabelNonJs ?? stateLabel}
                      presentationLabel={presentationLabelNonJs ?? presentationLabel}
                      scientificName={scientificName}
                      speciesCode={faoCode}
                      displayAddProduct={products?.length < maxLandingsLimit}
                      isEdit={isEditMode}
                      addToFavourites={addToFavourites}
                      showFavouriteCheckbox={products?.length < maxLandingsLimit}
                    />
                  </SecureForm>
                </div>
              </Tab>
              <Tab eventKey="favouritesTab" label={t("ccAddSpeciesPageFavouritesH2Text")}>
                <div id="add-from-favourites">
                  <h2 className="govuk-heading-l">{t("ccAddSpeciesPageFavouritesH2Text")}</h2>
                  <SecureForm method="post" csrf={csrf}>
                    <AutocompleteFormField
                      id="product"
                      name="favourite"
                      errorMessageText={t(errors?.product?.message, { ns: "errorsText" })}
                      defaultValue=""
                      key={key}
                      options={[
                        "",
                        ...favourites.map(
                          (favourite: Species) =>
                            `${favourite.species} ${favourite.stateLabel},${favourite.presentationLabel}, ${favourite.commodity_code}`
                        ),
                      ]}
                      optionsId="product-option"
                      selectProps={{
                        id: "product",
                        selectClassName: `govuk-select govuk-!-width-full ${
                          !isEmpty(errors?.product) && "govuk-select--error"
                        }`.trim(),
                      }}
                      labelClassName="govuk-label govuk-!-font-weight-bold"
                      labelText={t("ccFavouritesPageProductTableHeaderTwo")}
                      containerClassName={`govuk-!-width-one-half ${
                        isEmpty(errors?.product) ? "govuk-form-group" : "govuk-form-group--error"
                      }`}
                      inputProps={{
                        className: `govuk-input ${!isEmpty(errors?.product) && "govuk-input--error"}`.trim(),
                      }}
                    />
                    <ManageYourProductFavouritesLink
                      href={route("/create-catch-certificate/:documentNumber/manage-favourites", { documentNumber })}
                    />
                    {products?.length < maxLandingsLimit && (
                      <div className="govuk-button-group govuk-!-margin-top-4">
                        <Button
                          type={BUTTON_TYPE.SUBMIT}
                          name="_action"
                          //@ts-ignore
                          value="addFromFavourite"
                          label={t("ccAddSpeciesPageAddButtonText")}
                          className="govuk-button"
                          data-testid="add-product"
                        />
                      </div>
                    )}
                  </SecureForm>
                </div>
              </Tab>
            </TabGroup>
            <ProductsTable products={products} onClickHandler={handleTab} csrf={csrf} />
            <SecureForm method="post" csrf={csrf}>
              <ButtonGroup />
              <input type="hidden" name="nextUri" value={nextUri} />
            </SecureForm>
            <BackToProgressLink
              progressUri="/create-catch-certificate/:documentNumber/progress"
              documentNumber={documentNumber}
            />
          </div>
        </div>
      </div>
    </Main>
  );
};

export default WhatAreYouExporting;
