import type { IExporter } from "~/types";
import { getUserDetails, getAddresses, getAccounts } from "~/.server";

export async function loadIdmData(
  bearerToken: string
): Promise<{ userDetails: IExporter; addresses: IExporter; accounts: IExporter }> {
  const userDetails: IExporter = await getUserDetails(bearerToken);
  const addresses: IExporter = await getAddresses(bearerToken);
  const accounts: IExporter = getAccounts(bearerToken);

  return { userDetails, addresses, accounts };
}
