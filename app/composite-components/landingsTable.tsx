import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import type { ICountry, LandingsTableProps, LandingTableProps } from "~/types";
import { SecureForm } from "~/components";
import { toDelimitedStr } from "~/helpers";

type landingTableRow = {
  dateLanded: string;
  faoArea: string;
  vesselName: string;
  startDate?: string;
  gearCategory?: string;
  gearType?: string;
  rfmo?: string;
  highSeasArea?: string;
  eez?: string[];
};

export const LandingsTable = ({ landings, csrf }: LandingsTableProps) => {
  const { t } = useTranslation("addLandings");

  const getHighSeasAreaValue = (landing: LandingTableProps, t: any): string | undefined => {
    if (!landing.highSeasArea) return undefined;
    if (landing.highSeasArea === "Yes") {
      return t("highSeasAreaOptionYesText", { ns: "checkYourInformation" });
    } else {
      return t("highSeasAreaOptionNoText", { ns: "checkYourInformation" });
    }
  };

  const getLandingTableRow = (data: landingTableRow) => (
    <>
      {data.startDate && (
        <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
          <b>{t("ccAddLandingStartdateLabel", { ns: "addLandings" })}:</b> {data.startDate}
        </span>
      )}
      <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
        <b>{t("ccAddLandingDateLandedLabel", { ns: "directLandings" })}:</b> {data.dateLanded}
      </span>
      <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
        <b>{t("ccAddLandingCatchAreaLabel", { ns: "directLandings" })}:</b> {data.faoArea}
      </span>
      {data.highSeasArea && (
        <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
          <b>{t("ccAddLandingHighSeasAreaLabel", { ns: "checkYourInformation" })}:</b> {data.highSeasArea}
        </span>
      )}
      {data.eez && data.eez.length > 0 && (
        <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
          <b>{t("ccLandingDetailsEezLabel", { ns: "addLandings" })}:</b> {toDelimitedStr(data.eez)}
        </span>
      )}
      {data.rfmo && (
        <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
          <b>{t("ccLandingDetailsRfmoLabel", { ns: "addLandings" })}:</b> {data.rfmo}
        </span>
      )}
      <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
        <b>{t("ccAddLandingVesselLabel", { ns: "addLandings" })}:</b> {data.vesselName}
      </span>
      {data.gearCategory && (
        <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
          <b>{t("ccAddLandingGearCategoryLabel", { ns: "addLandings" })}:</b> {data.gearCategory}
        </span>
      )}
      {data.gearType && (
        <span style={{ display: "block" }} className="govuk-!-font-size-19 table-adjust-font">
          <b>{t("ccAddLandingGearTypeLabel", { ns: "addLandings" })}:</b> {data.gearType}
        </span>
      )}
    </>
  );

  return (
    <>
      <h2>{t("ccAddLandingYourLandings")}</h2>
      <table className="govuk-table" id="yourlandings" data-testid="your-landings">
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-right-2 govuk-!-padding-bottom-4 govuk-!-font-size-19 table-adjust-font"
            >
              {t("ccAddLandingProductLabel", { ns: "directLandings" })}
            </th>
            <th
              scope="col"
              className="govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-right-2 govuk-!-padding-bottom-4 govuk-!-font-size-19 table-adjust-font"
            >
              {t("commonLandingLabel", { ns: "common" })}
            </th>
            <th
              scope="col"
              className="govuk-!-text-align-left govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-right-2 govuk-!-padding-bottom-4 govuk-!-font-size-19 table-adjust-font"
            >
              {t("ccAddLandingExportWeightWithUnit")}
            </th>
            <th
              scope="col"
              className="govuk-!-text-align-right govuk-table__header govuk-!-padding-0 govuk-!-padding-top-4 govuk-!-padding-bottom-4 govuk-!-font-size-19 table-adjust-font"
            >
              {t("commonDashboardAction", { ns: "common" })}
            </th>
          </tr>
        </thead>
        <tbody>
          {landings.map((landing: LandingTableProps) => (
            <tr key={landing.id} className="govuk-table__row" data-testid={`landings-row-${landing.id}`}>
              <td
                className="govuk-table__cell tablerowuserref govuk-!-padding-0 govuk-!-padding-top-2 govuk-!-padding-right-2 govuk-!-padding-bottom-2 govuk-!-font-size-19 table-adjust-font"
                style={{ width: "40%" }}
              >
                {landing.product}
              </td>
              <td
                className="govuk-table__cell tablerowuserref govuk-!-padding-0 govuk-!-padding-top-2 govuk-!-padding-right-2 govuk-!-padding-bottom-2 govuk-!-font-size-19 table-adjust-font"
                style={{ width: "30%" }}
              >
                {getLandingTableRow({
                  dateLanded: landing.dateLanded,
                  faoArea: landing.faoArea,
                  vesselName: landing.vesselName,
                  startDate: landing.startDate,
                  gearCategory: landing.gearCategory,
                  gearType: landing.gearType,
                  rfmo: landing.rfmo,
                  highSeasArea: getHighSeasAreaValue(landing, t),
                  eez: landing.exclusiveEconomicZones?.map((c: ICountry) => c.officialCountryName),
                })}
              </td>
              <td
                className="govuk-table__cell tablerowuserref govuk-!-padding-0 govuk-!-padding-top-2 govuk-!-padding-right-2 govuk-!-padding-bottom-2 govuk-!-font-size-19 table-adjust-font"
                style={{ width: "10%" }}
              >
                {landing.exportWeight?.toFixed(2)}
              </td>
              <td
                className="govuk-table__cell govuk-!-text-align-right govuk-!-padding-top-2 govuk-!-padding-bottom-2"
                style={{ width: "20%" }}
              >
                {!landing.isOverriddenByAdmin && (
                  <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                    <input type="hidden" name="landingId" value={landing.id} />
                    <input type="hidden" name="productId" value={landing.productId} />
                    <input type="hidden" name="_action" value="edit-landing" />
                    <Button
                      label={t("commonEditLink", { ns: "common" })}
                      className="govuk-button govuk-button--secondary govuk-!-margin-right-3"
                      type={BUTTON_TYPE.SUBMIT}
                      data-module="govuk-button"
                      data-testid={`edit_${landing.id || "new"}`}
                      visuallyHiddenText={{
                        text: t("commonLandingLabel", { ns: "common" }) + " " + landing.landing,
                        className: "govuk-visually-hidden",
                      }}
                      onClick={(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => evt?.currentTarget?.blur()}
                    />
                  </SecureForm>
                )}
                <SecureForm method="post" className="govuk-!-display-inline" csrf={csrf}>
                  <input type="hidden" name="landingId" value={landing.id} />
                  <input type="hidden" name="productId" value={landing.productId} />
                  <input type="hidden" name="_action" value="delete-landing" />
                  <Button
                    label={t("commonRemoveButton", { ns: "common" })}
                    className="govuk-button govuk-button--secondary"
                    type={BUTTON_TYPE.SUBMIT}
                    data-module="govuk-button"
                    data-testid={`remove_${landing.id || "new"}`}
                    visuallyHiddenText={{
                      text: t("commonLandingLabel", { ns: "common" }) + " " + landing.landing,
                      className: "govuk-visually-hidden",
                    }}
                  />
                </SecureForm>
              </td>
            </tr>
          ))}
          <tr className="govuk-table__row">
            <td className="govuk-table__cell govuk-!-padding-top-2 govuk-!-padding-bottom-2" colSpan={4}>
              <strong>
                {landings.length}{" "}
                {landings.length == 1
                  ? t("ccAddLandingValueFooterLabelLanding")
                  : t("ccAddLandingValueFooterLabelLandings")}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
