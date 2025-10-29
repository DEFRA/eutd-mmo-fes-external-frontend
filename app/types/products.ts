import type { IError, IErrorsTransformed } from "./errors";
export interface Product {
  id: string;
  user_id: string | null;
  species?: string;
  speciesAdmin?: string;
  speciesCode?: string;
  scientificName?: string;
  state?: string;
  stateLabel?: string;
  stateAdmin?: string;
  presentation?: string;
  presentationLabel?: string;
  presentationAdmin?: string;
  commodity_code?: string;
  commodity_code_description?: string;
  commodity_code_admin?: string;
  factor?: number;
  caughtBy?: any[];
  addedToFavourites?: boolean;
  errors?: IError[] | IErrorsTransformed;
}

export interface Species {
  id?: string;
  species?: string;
  speciesCode?: string;
  scientificName?: string;
  state?: string;
  stateLabel?: string;
  presentation?: string;
  presentationLabel?: string;
  commodity_code?: string;
  commodity_code_description?: string;
  addedToFavourites?: boolean;
  redirect: string;
  faoCode?: string;
  faoName?: string;
  commonRank?: number;
  commonNames?: string[];
  rank?: number;
}
export interface Fish {
  id?: string;
  species?: string;
  speciesCode?: string;
  scientificName?: string;
  state?: string;
  stateLabel?: string;
  presentation?: string;
  presentationLabel?: string;
  commodity_code?: string;
  commodity_code_description?: string;
  addToFavourites?: boolean;
  redirect: string;
  isFavourite?: boolean;
}

export interface LabelAndValue {
  label: string;
  value: string;
  description?: string;
}

export interface CodeAndDescription {
  code: string;
  description: string;
}
export interface SpecieStateLookupResult {
  presentations: CodeAndDescription[];
  state: CodeAndDescription;
}

export interface CommodityCode extends CodeAndDescription {
  faoName: string;
  stateLabel: string;
  presentationLabel: string;
}

export interface SearchState {
  state: LabelAndValue;
  presentations: LabelAndValue[];
  scientificName: string;
}
