import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import type { Product } from "~/types";
import { useTranslation } from "react-i18next";
import { SecureForm } from "~/components";

type ProductTableRowProps = {
  products: Product[];
  onClickHandler: (event: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  csrf: string;
};

export const ProductsTable = ({ products, onClickHandler, csrf }: ProductTableRowProps) => {
  const { t } = useTranslation(["whatAreYouExporting", "common"]);

  const getProductCode = (product: Product) => {
    if (product.commodity_code_admin) {
      return product.commodity_code_admin;
    }
    return `${product.commodity_code} ${product.commodity_code_description ? "- " + product.commodity_code_description : ""}`.trim();
  };
  return (
    <>
      <h2 className={"govuk-heading-l govuk-!-margin-top-5"}>{t("ccAddSpeciesPageProductTableCaption")}</h2>
      <table className="govuk-table" id="yourproducts">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
            >
              {t("ccFavouritesPageProductTableHeaderTwo")}
            </th>
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
            >
              {t("ccFavouritesPageFormCommodityCodeField")}
            </th>
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-text-align-right govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
            >
              {t("commonDashboardAction", { ns: "common" })}
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: Product) => (
            <tr className="govuk-table__row" key={`producttable-${product.id}`}>
              <td className="govuk-table__cell">
                <p className="govuk-!-margin-0">
                  {product.speciesAdmin ?? product.species},<br />
                  {product.stateAdmin ?? product.stateLabel},<br />
                  {product.presentationAdmin ?? product.presentationLabel}
                </p>
              </td>
              <td className="govuk-table__cell">{getProductCode(product)}</td>
              <td className="govuk-table__cell govuk-!-text-align-right">
                <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="_action" value="edit" />
                  <Button
                    id={`edit-button-${product.id}`}
                    label={t("commonEditLink", { ns: "common" })}
                    className="govuk-button govuk-button--secondary govuk-!-margin-right-3"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    data-testid={`edit-button-${product.id}`}
                    onClick={onClickHandler}
                    visuallyHiddenText={{
                      text: product.species + " " + product.stateLabel + " " + product.presentationLabel,
                      className: "govuk-visually-hidden",
                    }}
                  />
                </SecureForm>
                <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="_action" value="remove" />
                  <Button
                    id={`remove-button-${product.id}`}
                    label={t("commonRemoveButton", { ns: "common" })}
                    className="govuk-button govuk-button--secondary"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    data-testid={`remove-button-${product.id}`}
                    visuallyHiddenText={{
                      text: product.species + " " + product.stateLabel + " " + product.presentationLabel,
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
