import { useTranslation } from "react-i18next";
import { SecureForm, Title } from "~/components";
import type { Species } from "~/types";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
type ProductTableProps = {
  products: Species[];
  csrf: string;
};

export const ProductFavouritesTable = ({ products, csrf }: ProductTableProps) => {
  const { t } = useTranslation(["favourites"]);
  return (
    <>
      <Title title={t("ccProductFavouritesTableTitle")} />
      <table className="govuk-table" id="yourproducts">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header table-adjust-font">
              {t("commonProductIdText", { ns: "common" })}
            </th>
            <th scope="col" className="govuk-table__header table-adjust-font">
              {t("commonProductText", { ns: "common" })}
            </th>
            <th scope="col" className="govuk-table__header table-adjust-font">
              {t("commonDashboardAction", { ns: "common" })}
            </th>
          </tr>
        </thead>
        <tbody>
          {products?.map((favourites: Species) => (
            <tr className="govuk-table__row" key={favourites.id}>
              <td className="govuk-table__cell">{favourites.id}</td>

              <td className="govuk-table__cell">
                <strong>{t("ccFavouritesPageProductTableRowSpecies")}</strong>: {favourites.species}
                <br />
                <strong>{t("ccFavouritesPageProductTableRowState")}</strong>: {favourites.stateLabel}
                <br />
                <strong>{t("ccFavouritesPageProductTableRowPresentation")}</strong>:{favourites.presentationLabel}
                <br />
                <strong>{t("ccFavouritesPageProductTableRowCommodityCode")}</strong>:
                {`${favourites.commodity_code} ${
                  favourites.commodity_code_description ? "- " + favourites.commodity_code_description : ""
                }`.trim()}
              </td>
              <td className="govuk-table__cell">
                <SecureForm method="post" csrf={csrf}>
                  <input type="hidden" name="favouritesId" value={favourites.id} />
                  <input type="hidden" name="_action" value="remove" />

                  <Button
                    label={t("commonRemoveButton", { ns: "common" })}
                    className="govuk-button govuk-button--secondary"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    data-testid={`remove-button-${favourites.id}`}
                    visuallyHiddenText={{
                      text: favourites.species + " " + favourites.stateLabel + " " + favourites.presentationLabel,
                      className: "govuk-visually-hidden",
                    }}
                  />
                </SecureForm>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
