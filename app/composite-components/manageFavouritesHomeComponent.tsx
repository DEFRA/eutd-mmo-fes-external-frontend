import { useActionData, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";
import type { ManageFavouritesProps } from "~/types";
import { ManageFavouritesComponent } from "./manageFavouritesComponent";

export const ManageFavouritesHomeComponent = ({ backUrl }: { backUrl: string }) => {
  const { t } = useTranslation(["whatAreYouExporting", "common", "favourites"]);
  const {
    key,
    speciesExemptLink,
    species,
    favourites,
    stateLookup,
    commodityCodes,
    faoCode,
    stateLabel,
    stateCode,
    presentationLabel,
    presentationCode,
    commodityCode,
    csrf,
    scientificName,
    loaderSpecies,
  } = useLoaderData<ManageFavouritesProps>();
  const {
    errors = {},
    species: selectedSpecies,
    state: selectedState,
    presentation: selectedPresentation,
  } = useActionData() ?? {};

  return (
    <ManageFavouritesComponent
      key={key}
      csrf={csrf}
      speciesExemptLink={speciesExemptLink}
      species={species}
      favourites={favourites}
      stateLookup={stateLookup}
      commodityCodes={commodityCodes}
      faoCode={faoCode}
      stateLabel={stateLabel}
      stateCode={stateCode}
      presentationLabel={presentationLabel}
      presentationCode={presentationCode}
      commodityCode={commodityCode}
      scientificName={scientificName}
      loaderSpecies={loaderSpecies}
      errors={errors}
      selectedSpecies={selectedSpecies}
      selectedState={selectedState}
      selectedPresentation={selectedPresentation}
      t={t}
      backUrl={backUrl}
    />
  );
};
