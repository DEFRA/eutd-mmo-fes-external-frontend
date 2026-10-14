export interface EstablishmentAddress {
  line1?: string;
  line2?: string;
  line3?: string;
  line4?: string;
  cityName?: string;
  postCode?: { code?: string | null };
  country?: { countryName?: string };
}

export interface Establishment {
  id?: string;
  approvalNumber?: { content?: string };
  tradingName?: string;
  address?: EstablishmentAddress;
  country?: string;
}
