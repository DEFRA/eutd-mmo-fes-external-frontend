import { useTranslation } from "react-i18next";
import type { IUploadedLanding } from "~/types";
import _ from "lodash";

type renderUploadFileLandingsDataProps = {
  landing: IUploadedLanding;
};

export const RenderUploadFileLandingsData = ({ landing }: renderUploadFileLandingsDataProps) => {
  const { t } = useTranslation(["uploadFile", "common"]);
  return (
    <td className="govuk-table__cell">
      <strong>{t("ccUploadFilePageTableProductInfo")}:</strong> {landing.product!.species},{" "}
      {landing.product!.stateLabel}, {landing.product!.presentationLabel}, {landing.product!.commodity_code} <br />
      <strong>{t("commonLandingLabel", { ns: "common" })}:</strong> {landing.startDate ? landing.startDate + "," : ""}
      {landing.landingDate}, {landing.faoArea},{landing.highSeasArea ? ` ${_.capitalize(landing.highSeasArea)},` : ""}
      {landing.eezCode ? ` ${landing.eezCode},` : ""}
      {landing.rfmoCode ? ` ${landing.rfmoCode},` : ""} {landing.vessel.vesselName} ({landing.vessel.pln})
      {landing.gearCode ? `, ${landing.gearCode} ` : " "}
      <br />
      <strong>{t("ccUploadFilePageTableExportWeightInfo")}:</strong> {landing.exportWeight}
    </td>
  );
};
