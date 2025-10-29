import { useTranslation } from "react-i18next";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import type { AddLandingProductTableProps, AddLandingsProductTableProps } from "~/types";
import { SecureForm } from "~/components";

export const LandingProductTable = ({ products, csrf }: AddLandingsProductTableProps) => {
  const { t } = useTranslation("addLandings");

  return (
    <>
      <h2>{t("ccAddSpeciesPageProductTableCaption")}</h2>
      <table className="govuk-table" id="yourproducts">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
            >
              {t("ccAddLandingProductLabel", { ns: "directLandings" })}
            </th>
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
            >
              {t("ccAddLandingExportWeightWithUnit")}
            </th>
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font govuk-!-text-align-right"
            >
              {t("commonDashboardAction", { ns: "common" })}
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product: AddLandingProductTableProps) => (
            <tr id={`product_${product.id}`} className="govuk-table__row" key={`product_${product.id}`}>
              <td className="govuk-table__cell tablerowuserref govuk-!-padding-0 govuk-!-padding-top-2 govuk-!-padding-bottom-2 govuk-!-width-three-quarters govuk-!-font-size-19 table-adjust-font">
                {product.product}
              </td>
              <td className="govuk-table__cell tablerowuserref govuk-!-padding-0 govuk-!-padding-top-2 govuk-!-padding-bottom-2 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font">
                {product.exportWeight.toFixed(2)}
              </td>
              <td className="govuk-table__cell govuk-!-text-align-right govuk-!-padding-top-2 govuk-!-padding-bottom-2">
                {products.length > 1 && (
                  <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="_action" value="delete-product" />
                    <Button
                      label={t("commonRemoveButton", { ns: "common" })}
                      className="govuk-button govuk-button--secondary govuk-!-margin-0"
                      type={BUTTON_TYPE.SUBMIT}
                      data-module="govuk-button"
                      data-testid={`remove-button-${product.id}`}
                      visuallyHiddenText={{
                        text: product.product,
                        className: "govuk-visually-hidden",
                      }}
                    />
                  </SecureForm>
                )}
              </td>
            </tr>
          ))}
          <tr className="govuk-table__row">
            <td className="govuk-table__cell">
              <strong>{t("ccAddLandingTotalExportWeight", { ns: "directLandings" })}</strong>
            </td>
            <td className="govuk-table__cell">
              <strong>
                {products
                  .reduce(
                    (previousValue: number, currentValue: AddLandingProductTableProps) =>
                      currentValue.exportWeight ? previousValue + currentValue.exportWeight : previousValue,
                    0
                  )
                  .toFixed(2)}
                kg
              </strong>
            </td>
            <td className="govuk-table__cell tablerowuserref govuk-!-padding-0  govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"></td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
