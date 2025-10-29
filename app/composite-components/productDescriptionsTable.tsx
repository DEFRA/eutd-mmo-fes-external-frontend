import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import type { ProcessingStatementProduct } from "~/types";
import { useTranslation } from "react-i18next";
import { type MouseEventHandler } from "react";

type ProductTableRowProps = {
  products: ProcessingStatementProduct[];
  onClickHandler: MouseEventHandler<HTMLButtonElement>;
};

export const ProductDescriptionsTable = ({ products, onClickHandler }: ProductTableRowProps) => {
  const { t } = useTranslation(["whatAreYouExporting", "common"]);
  const displayRemoveBtn = products.length > 1;
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
              {t("commonCommodityCodeLabel", { ns: "common" })}
            </th>
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-width-one-quarter govuk-!-font-size-19 table-adjust-font"
            >
              {t("commonProductDescription", { ns: "common" })}
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
          {products.map((product: ProcessingStatementProduct, index: number) => (
            <tr className="govuk-table__row" key={`products-${product.commodityCode}`}>
              <td className="govuk-table__cell">
                <p className="govuk-!-margin-0">{product.commodityCode}</p>
              </td>
              <td className="govuk-table__cell">{product.description}</td>
              <td className="govuk-table__cell govuk-!-text-align-right">
                <Button
                  label={t("commonEditLink", { ns: "common" })}
                  className="govuk-button govuk-button--secondary govuk-!-margin-right-3"
                  type={BUTTON_TYPE.SUBMIT}
                  data-module="govuk-button"
                  onClick={onClickHandler}
                  data-testid={`edit-button-${index}`}
                  name="_action"
                  value={`editButton-${index}`}
                  visuallyHiddenText={{
                    text:
                      t("commonCommodityCodeLabel", { ns: "common" }) +
                      " " +
                      product.commodityCode +
                      " " +
                      t("commonProductDescription", { ns: "common" }) +
                      " " +
                      product.description,
                    className: "govuk-visually-hidden",
                  }}
                />
                {displayRemoveBtn && (
                  <Button
                    label={t("commonRemoveButton", { ns: "common" })}
                    className="govuk-button govuk-button--secondary"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    data-testid={`remove-button-${index}`}
                    name="_action"
                    value={`removeProduct-${index}`}
                    visuallyHiddenText={{
                      text:
                        t("commonCommodityCodeLabel", { ns: "common" }) +
                        " " +
                        product.commodityCode +
                        " " +
                        t("commonProductDescription", { ns: "common" }) +
                        " " +
                        product.description,
                      className: "govuk-visually-hidden",
                    }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
