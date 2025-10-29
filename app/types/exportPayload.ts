import type { ICountry } from "./common";
import type { IError } from "./errors";

interface CodeAndLabel {
  code: string;
  label: string;
  admin?: string;
}

type Presentation = CodeAndLabel;
type State = CodeAndLabel;
type Species = CodeAndLabel;

export interface ProductsLanded {
  items: ProductLanded[];
  errors?: IError[];
}

export interface ProductLanded {
  product: ExportPayloadProduct;
  landings?: LandingStatus[];
}

export interface ExportPayloadProduct {
  id: string;
  commodityCode: string;
  commodityCodeAdmin?: string;
  commodityCodeDescription: string;
  presentation: Presentation;
  scientificName: string;
  state: State;
  species: Species;
}

export interface LandingStatus {
  addMode?: boolean;
  editMode?: boolean;
  error?: string;
  errors?: {};
  model: Landing;
  modelCopy?: Landing;
}

export type HighSeasAreaType = "Yes" | "No" | undefined;

export interface Landing {
  id: string;
  vessel?: Vessel;
  startDate?: string;
  dateLanded?: string;
  exportWeight?: number;
  faoArea?: string;
  highSeasArea?: HighSeasAreaType;
  exclusiveEconomicZones?: ICountry[];
  numberOfSubmissions?: number;
  gearType?: string;
  gearCategory?: string;
  _status?: string;
  rfmo?: string;
}

export interface Vessel {
  pln: string; // Port Letter and Number
  vesselName: string;
  homePort?: string;
  flag?: string; // jurisdiction under whose laws the vessel is registered or licensed
  cfr?: string; // cost and freight (CFR) is a legal term
  licenceNumber?: string;
  licenceHolder?: string;
  imoNumber?: string; // International Maritime Organisation
  licenceValidTo?: string;
  rssNumber?: string; // Registry of Shipping and Seamen
  vesselLength?: number;
  label?: string;
  domId?: string;
  vesselOverriddenByAdmin?: boolean;
  vesselNotFound?: boolean;
}

export type AddLandingProductTableProps = {
  id: string;
  product: string;
  exportWeight: number;
  species?: string;
};

export type AddLandingsProductTableProps = {
  products: AddLandingProductTableProps[];
  csrf: string;
};

export type LandingTableProps = {
  id: string;
  productId: string;
  product: string;
  landing: string;
  dateLanded: string;
  faoArea: string;
  vesselName: string;
  exportWeight?: number;
  isOverriddenByAdmin?: boolean;
  species?: string;
  startDate?: string;
  gearCategory?: string;
  gearType?: string;
  rfmo?: string;
  highSeasArea?: HighSeasAreaType;
  exclusiveEconomicZones?: ICountry[];
};

export type LandingsTableProps = {
  landings: LandingTableProps[];
  csrf: string;
};
