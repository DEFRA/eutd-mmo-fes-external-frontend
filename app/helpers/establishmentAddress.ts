import type { EstablishmentAddress } from "~/types";

export const formatEstablishmentAddress = (address?: EstablishmentAddress) => {
  const addressLines = [address?.line1, address?.line2, address?.line3, address?.line4].filter((line): line is string =>
    Boolean(line?.trim())
  );
  const cityName = address?.cityName ?? addressLines.pop() ?? "";

  return {
    addressLine: addressLines.join(", "),
    cityName,
  };
};
