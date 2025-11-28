import type { ICountry } from "./common";
import type { ErrorLookup, IError, IErrorsTransformed } from "./errors";
import type { HighSeasAreaType } from "./exportPayload";

export interface IVessel {
  pln?: string;
  vesselName?: string;
  flag?: string;
  cfr?: string;
  homePort?: string;
  licenceNumber?: string;
  imoNumber?: number | null;
  licenceValidTo?: string;
  rssNumber?: string;
  vesselLength?: number;
  licenceHolder?: string;
  label?: string;
  domId?: string;
}

export interface IDirectLandingsDetails {
  speciesId?: string | null;
  speciesLabel?: string | null;
  exportWeight?: string | null;
}

export interface IDirectLandings {
  startDate?: string;
  dateLanded?: string;
  faoArea?: string;
  id?: string;
  numberOfSubmissions?: number;
  vessel?: IVessel;
  weights?: IDirectLandingsDetails[];
  errors?: IError[];
  gearCategory?: string;
  gearType?: string;
  highSeasArea?: HighSeasAreaType;
  rfmo?: string;
  exclusiveEconomicZones: ICountry[];
}

export interface ILabels {
  code: string;
  label: string;
}

export interface ProductDetails {
  id?: string;
  commodityCode?: string;
  commodityCodeDescription?: string;
  presentation: ILabels;
  scientificName: string;
  state: ILabels;
  species: ILabels;
}

export interface landingsDetails {
  addMode: boolean;
  editMode: boolean;
  error: string;
  errors: ErrorLookup;
  model: ILandings;
}

export interface ILandings {
  id?: string;
  vessel?: IVessel;
  startDate?: string;
  dateLanded?: string;
  exportWeight?: number;
  faoArea?: string;
  weights?: IDirectLandingsDetails[];
  gearType?: string;
  gearCategory?: string;
}

export interface IDirectLandingsResponseDetails {
  product: ProductDetails;
  landings: landingsDetails[];
}

export interface IDirectLandingsResponse {
  items: IDirectLandingsResponseDetails[];
  error: string;
  errors?: IError;
}

export interface DateForm {
  day?: string;
  month?: string;
  year?: string;
}

export type WeightDetails = {
  id: string;
  value: number;
};

export type WeightInputProps = {
  id: "weight";
  unit: "kg";
  exportWeight?: string;
  totalWeight: (weightDetails: WeightDetails) => void;
  index: number;
  errors: IErrorsTransformed;
  formValue: string | undefined;
  speciesId: string | null | undefined;
  readOnly?: boolean;
  errorID?: string;
  inputWidth?: number;
  key?: string;
  weightKey?: string;
  inputType?: string;
  label?: string;
  hint?: string;
  inputName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export interface IGearType {
  gearName: string;
  gearCode: string;
}
