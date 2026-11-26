export interface EstablishmentAddress {
  line1?: string;
  line2?: string;
  line3?: string | null;
  line4?: string | null;
  cityName?: string;
  identification?: string;
  postCode?: { code?: string | null };
  country?: {
    name?: string;
    identifier?: string;
    identificationSchemeAgency?: { identifier?: string };
    countrySubDivision?: { name?: string; identifier?: string };
  };
}

export interface Establishment {
  id?: string;
  approvalNumber?: { content?: string };
  tradingName?: string;
  address?: EstablishmentAddress;
  country?: string | { countryName?: string };
}
