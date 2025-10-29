import { Details } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import { ErrorSummary, Main, SecureForm, Title } from "~/components";
import { displayErrorMessages, mapPresentations, mapStates } from "~/helpers";
import type { IErrorsTransformed, LabelAndValue, SearchState, Species } from "~/types";
import { AddProducts } from "./addProducts";
import { ProductFavouritesTable } from "./productFavouritesTable";
import type { TFunction } from "i18next";

type ManageFavouritesComponentProps = {
  key: number;
  speciesExemptLink: string;
  species: Species[];
  favourites: Species[];
  stateLookup: SearchState[];
  commodityCodes: LabelAndValue[];
  faoCode: string;
  stateLabel: string;
  stateCode: string;
  presentationLabel: string;
  presentationCode: string;
  commodityCode: string;
  scientificName: string;
  selectedSpecies: string;
  loaderSpecies: string;
  selectedState: string;
  selectedPresentation: string;
  backUrl: string;
  errors: IErrorsTransformed;
  csrf: string;
  t: TFunction<[string, string, string], undefined>;
};

export const ManageFavouritesComponent = ({
  key,
  species,
  speciesExemptLink,
  stateLookup,
  stateCode,
  selectedSpecies,
  loaderSpecies,
  selectedState,
  selectedPresentation,
  presentationCode,
  commodityCode,
  commodityCodes,
  stateLabel,
  presentationLabel,
  scientificName,
  faoCode,
  favourites,
  backUrl,
  errors,
  csrf,
  t,
}: ManageFavouritesComponentProps) => (
  <Main showHelpLink={false} backUrl={backUrl}>
    {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <Title dataTestId="favourites-page-header" title={t("ccFavouritesPageHeader", { ns: "favourites" })} />
      </div>
    </div>
    <SecureForm method="post" csrf={csrf}>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Details
            summary={t("ccFavouritesPageDetailsQuestion", { ns: "favourites" })}
            detailsClassName="govuk-details"
            summaryClassName="govuk-details__summary"
            detailsTextClassName="govuk-details__text"
            summaryTextProps={{ id: "product-favourites-details" }}
          >
            <>
              <p>{t("ccFavouritesPageDetailsAnswerOne", { ns: "favourites" })}</p>
              <p>{t("ccFavouritesPageDetailsAnswerTwo", { ns: "favourites" })}</p>
            </>
          </Details>
          <AddProducts
            key={key}
            speciesExemptLink={speciesExemptLink}
            primaryButtonLabel={t("ccFavouritesPageFormCommodityCodeAddProductFavourites", { ns: "favourites" })}
            species={species}
            states={mapStates(stateLookup)}
            presentations={mapPresentations(stateLookup, stateCode)}
            selectedSpecies={selectedSpecies || loaderSpecies}
            selectedState={selectedState || stateCode}
            selectedPresentation={selectedPresentation || presentationCode}
            selectedCommodityCode={commodityCode}
            commodityCodes={commodityCodes}
            errors={Object.keys(errors).reduce(
              (prev, curr) => ({
                ...prev,
                [errors[curr].key]: { key: errors[curr].key, message: errors[curr].message },
              }),
              {}
            )}
            stateLabel={stateLabel}
            presentationLabel={presentationLabel}
            scientificName={scientificName}
            speciesCode={faoCode}
            displayAddProduct={true}
            addToFavourites={false}
            showFavouriteCheckbox={false}
          />
        </div>
      </div>
    </SecureForm>
    <ProductFavouritesTable products={favourites} csrf={csrf} />
  </Main>
);
