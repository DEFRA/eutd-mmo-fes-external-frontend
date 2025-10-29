import moment from "moment";
import type {
  ProductLanded,
  LandingStatus,
  ProductsLanded,
  SelectOption,
  IVessel,
  AddLandingProductTableProps,
  LandingTableProps,
  IBase,
  Landing,
  IUnauthorised,
  ICountry,
} from "~/types";
import { post } from "~/communication.server";
import { VALIDATE_LANDINGS_URL } from "~/urls.server";
import { getErrorMessage } from "~/helpers";
import { getEnv } from "~/env.server";
import isEmpty from "lodash/isEmpty";

const getProductLabel = (
  species: string,
  state: string,
  presentation: string,
  commodityCode: string,
  adminSpecies?: string,
  adminState?: string,
  adminPresentation?: string,
  adminCommodityCode?: string
): string =>
  `${adminSpecies ?? species}, ${adminState ?? state}, ${adminPresentation ?? presentation}, ${
    adminCommodityCode ?? commodityCode
  }`;

export type ManualEntryLandingsData = {
  productOptions: SelectOption[];
  productsTableData: AddLandingProductTableProps[];
  landingsTableData: LandingTableProps[];
};

export const getLandingsData = (exportPayload: ProductsLanded) => {
  const data: ManualEntryLandingsData = { productOptions: [], productsTableData: [], landingsTableData: [] };

  if (Array.isArray(exportPayload?.items)) {
    return exportPayload.items.reduce((accumulator, item: ProductLanded) => {
      // productOptions
      accumulator.productOptions.push({
        value: item.product.id,
        label: getProductLabel(
          item.product.species.label,
          item.product.state.label,
          item.product.presentation.label,
          item.product.commodityCode,
          item.product.species.admin,
          item.product.state.admin,
          item.product.presentation.admin,
          item.product.commodityCodeAdmin
        ),
      });

      // productsTableData
      accumulator.productsTableData.push({
        id: item.product.id,
        product: getProductLabel(
          item.product.species.label,
          item.product.state.label,
          item.product.presentation.label,
          item.product.commodityCode,
          item.product.species.admin,
          item.product.state.admin,
          item.product.presentation.admin,
          item.product.commodityCodeAdmin
        ),
        exportWeight: Array.isArray(item?.landings)
          ? parseFloat(
              item.landings
                .reduce(
                  (previousValue: number, currentValue: LandingStatus) =>
                    currentValue.model.exportWeight ? previousValue + currentValue.model.exportWeight : previousValue,
                  0
                )
                .toFixed(2)
            )
          : 0,
        species: item.product.species.admin ?? item.product.species.label,
      });

      // landingsTableData
      if (Array.isArray(item?.landings)) {
        const enhancedLandings = item.landings.map((i: LandingStatus) => ({
          id: i.model.id,
          productId: item.product.id,
          product: `${item.product.species.admin ?? item.product.species.label}, ${
            item.product.state.admin ?? item.product.state.label
          }, ${item.product.presentation.admin ?? item.product.presentation.label}, ${
            item.product.commodityCodeAdmin ?? item.product.commodityCode
          } `,
          landing: `${i.model.startDate ? moment(i.model.startDate).format("DD/MM/YYYY") + ", " : ""}${moment(i.model.dateLanded).format("DD/MM/YYYY")}, ${i.model.faoArea}, ${i.model.vessel?.label}${i.model?.gearCategory ? +", " + i.model.gearCategory + "," : ""} ${i.model?.gearType ?? ""}`,
          exportWeight: i.model.exportWeight,
          startDate: i.model?.startDate ? moment(i.model.startDate).format("DD/MM/YYYY") : undefined,
          dateLanded: moment(i.model.dateLanded).format("DD/MM/YYYY"),
          faoArea: i.model.faoArea ?? "FAO27",
          vesselName: i.model.vessel?.label ?? "",
          gearCategory: i.model?.gearCategory,
          gearType: i.model?.gearType,
          isOverriddenByAdmin: i.model.vessel?.vesselOverriddenByAdmin ?? false,
          species: item.product.species.admin ?? item.product.species.label,
          rfmo: i.model.rfmo ?? "",
          highSeasArea: i.model.highSeasArea ?? "",
          exclusiveEconomicZones: i.model.exclusiveEconomicZones,
        }));

        accumulator.landingsTableData = [...accumulator.landingsTableData, ...enhancedLandings];
      }

      return accumulator;
    }, data);
  }

  return data;
};

export const isMaxLandingsExceeded = (exportPayload: ProductsLanded, totalLandings: number) => {
  const { items = [] } = exportPayload;
  return totalLandings >= Number(getEnv().LIMIT_ADD_LANDINGS) && items.some((item: ProductLanded) => !item.landings);
};

export const getLandingData = (
  { items }: ProductsLanded,
  productId: string,
  landingId: string
): Landing | undefined => {
  if (Array.isArray(items)) {
    const item: ProductLanded | undefined = items.find((p: ProductLanded) => p.product.id === productId);
    return item !== undefined && Array.isArray(item?.landings)
      ? item.landings.find((l: LandingStatus) => l.model.id === landingId)?.model
      : undefined;
  }
};

export const addLanding = async (
  bearerToken: string,
  documentNumber: string | undefined,
  dates: { startDate?: string; dateLanded: string },
  exportWeight: string,
  faoArea: string,
  highSeasArea: string | undefined,
  product: string,
  landingId: string,
  gearFields: {
    gearCategory: string;
    gearType: string;
    gearCode: string | undefined;
  },
  rfmo: string | undefined,
  vessel: IVessel = {},
  exclusiveEconomicZones: (ICountry | undefined)[] = []
): Promise<ProductsLanded | IUnauthorised | IBase> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await post(
    bearerToken,
    VALIDATE_LANDINGS_URL,
    {
      documentNumber: documentNumber,
    },
    {
      startDate: dates.startDate,
      dateLanded: dates.dateLanded,
      exportWeight,
      faoArea,
      highSeasArea,
      product,
      vessel,
      gearCategory: isEmpty(gearFields.gearCategory) ? undefined : gearFields.gearCategory,
      gearType: isEmpty(gearFields.gearType) ? undefined : gearFields.gearType,
      gearCode: isEmpty(gearFields.gearCode) ? undefined : gearFields.gearCode,
      rfmo,
      exclusiveEconomicZones,
      ...(landingId && { id: landingId }),
    }
  );

  return onAddLandingResponse(response, product);
};

const onAddLandingResponse = async (
  response: Response,
  productId: string
): Promise<ProductsLanded | { unauthorised: boolean; supportId?: string } | IBase> => {
  switch (response.status) {
    case 200:
    case 204:
      return await response.json();
    case 400:
      const errorsResponse = await response.json();
      const products: ProductLanded[] = errorsResponse?.items ?? [];
      const product: string =
        products.find((p: ProductLanded) => p.product.id === productId)?.product.species.label ?? "";

      return {
        errors: Object.keys(errorsResponse.errors).map((error) => ({
          key: error,
          message: getErrorMessage(errorsResponse.errors[error]),
          ...(errorsResponse.errors[error] === "error.dateLanded.date.max" && {
            value: { dynamicValue: getEnv().LANDING_LIMIT_DAYS_FUTURE },
          }),
          ...(errorsResponse.errors[error] === "error.seasonalFish.invalidate" && {
            value: { dynamicValue: product },
          }),
          ...(errorsResponse.errors[error] === "error.startDate.seasonalFish.invalidate" && {
            value: { dynamicValue: product },
          }),
        })),
      };
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
