import type { LabelAndValue, SearchState, Species } from "./products";

export type ManageFavouritesProps = {
  key: number;
  documentNumber: string;
  csrf: string;
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
  loaderSpecies: string;
};
