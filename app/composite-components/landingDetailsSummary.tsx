import moment from "moment";
import { Fragment } from "react";
import type { ProductLanded, ProductsLanded, LandingsEntryOptionType, LandingStatus, IError, Landing } from "~/types";
import { useTranslation } from "react-i18next";
import lowerCase from "lodash/lowerCase";
import { totalWeight } from "~/helpers";
import { route } from "routes-gen";

type LandingDetailsSummaryProps = {
  documentNumber: string;
  landingsEntry: LandingsEntryOptionType | {};
  exportPayload: ProductsLanded;
  isLocked: boolean;
  isDirectLanding: boolean;
  isOverriddenByAdmin: boolean;
  errors: IError[];
};

export const LandingDetailsSummary = ({
  documentNumber,
  landingsEntry,
  exportPayload,
  isLocked,
  isDirectLanding,
  isOverriddenByAdmin,
  errors,
}: LandingDetailsSummaryProps) => {
  const { t } = useTranslation([
    "checkYourInformation",
    "common",
    "landingsEntry",
    "whatAreYouExporting",
    "addLandings",
  ]);
  const checkIfErrorExist: (
    errorObj: IError[],
    species: string,
    vessel: string | undefined,
    dateLanded: string | undefined
  ) => IError | undefined = (
    errorObj: IError[],
    species: string,
    vessel: string | undefined,
    dateLanded: string | undefined
  ) =>
    Array.isArray(errorObj)
      ? errorObj.find(
          (err: IError) =>
            err.value?.species === species &&
            err.value?.vessel === vessel &&
            err.value?.dateLanded === moment(dateLanded).format("DD/MM/YYYY")
        )
      : undefined;

  const getLandingFields = (model: Landing) =>
    [
      model?.startDate && {
        label: t("ccAddLandingStartDateLabel", { ns: "checkYourInformation" }),
        value: moment(model.startDate).format("D MMMM YYYY"),
        hasChangeLink: true,
        idAttribute: "startDate-hint",
      },
      {
        label: t("ccAddLandingVesselNameLabel", { ns: "checkYourInformation" }),
        value: model?.vessel?.label,
        hasChangeLink: true,
        idAttribute: "vessel-label",
      },
      {
        label: t("ccAddLandingCatchAreaLabel", { ns: "checkYourInformation" }),
        value: model.faoArea,
      },
      model?.highSeasArea && {
        label: t("ccAddLandingHighSeasAreaLabel", { ns: "checkYourInformation" }),
        value:
          model.highSeasArea === "Yes"
            ? t("highSeasAreaOptionYesText", { ns: "checkYourInformation" })
            : t("highSeasAreaOptionNoText", { ns: "checkYourInformation" }),
        hasChangeLink: true,
        idAttribute: "highSeasArea-hint",
      },
      model?.rfmo && {
        label: t("ccRFMOlabel", { ns: "checkYourInformation" }),
        value: model.rfmo,
        hasChangeLink: true,
        idAttribute: "rfmo",
      },
      ...(model?.exclusiveEconomicZones?.map((c, i) => ({
        label: t("ccAddLandingExclusiveZoneLabel", { ns: "checkYourInformation" }),
        value: c.officialCountryName,
        hasChangeLink: true,
        idAttribute: `eez-${i}`,
      })) ?? []),
      {
        label: t("ccAddLandingDateLandedLabel", { ns: "checkYourInformation" }),
        value: moment(model.dateLanded).format("D MMMM YYYY"),
      },
      {
        label: t("ccAddLandingExportWeightFieldLabel", { ns: "checkYourInformation" }),
        value: `${model.exportWeight?.toFixed(2)}kg`,
      },
      model?.gearCategory && {
        label: t("ccAddLandingGearCategoryFieldLabel", { ns: "checkYourInformation" }),
        value: model.gearCategory,
        hasChangeLink: true,
        idAttribute: "gearType",
      },
      model?.gearType && {
        label: t("ccAddLandingGearTypeFieldLabel", { ns: "checkYourInformation" }),
        value: model.gearType,
      },
    ].filter(Boolean);

  const renderErrorMessage = (
    errorObject: IError | undefined,
    speciesLabel: string,
    vesselName: string,
    dateLanded: string
  ) => {
    if (!errorObject?.message) return null;

    return (
      <div className="govuk-summary-list__row govuk-form-group--error" id={errorObject.key}>
        <dd className="govuk-summary-list__value" style={{ borderBottom: "none" }}>
          <p className="govuk-error-message govuk-!-margin-left-2 govuk-!-padding-top-2">
            {t(errorObject.message, {
              ns: "errorsText",
              species: speciesLabel,
              vessel: vesselName,
              dateLanded: moment(dateLanded).format("DD/MM/YYYY"),
              interpolation: { escapeValue: false },
            })}
          </p>
        </dd>
      </div>
    );
  };

  const renderLandingField = (
    field: any,
    index: number,
    shouldShowChangeLink: boolean,
    getChangeLink: (id: string) => string
  ) => (
    <div key={`landingdata-${field.label}`} className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{field.label}</dt>
      <dd className="govuk-summary-list__value">{field.value}</dd>
      {field.hasChangeLink && shouldShowChangeLink && (
        <dd className="govuk-summary-list__actions">
          <div>
            <a
              className="govuk-link"
              data-testid={`change-${index}-${field.idAttribute}`}
              aria-label={t("commonWhatExportersAddressChangeLink", { ns: "common" })}
              href={getChangeLink(field.idAttribute)}
            >
              {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
              <span className="govuk-visually-hidden">{lowerCase(t("ccAddLandingHeader", { ns: "addLandings" }))}</span>
            </a>
          </div>
        </dd>
      )}
    </div>
  );

  const renderLandingsDetails = (item: ProductLanded, index: number) =>
    item.landings?.map((landing: LandingStatus) => {
      const { model } = landing;
      const speciesLabel = item?.product?.species?.label ?? "";
      const vesselName = model?.vessel?.vesselName ?? "";
      const dateLanded = model?.dateLanded ?? "";

      const errorObject = checkIfErrorExist(errors, speciesLabel, vesselName, dateLanded);

      const shouldShowChangeLink =
        !isLocked && !(isDirectLanding && isOverriddenByAdmin) && !model?.vessel?.vesselOverriddenByAdmin;

      const getChangeLink = (idAttribute: string) => {
        const baseRoute = isDirectLanding
          ? route("/create-catch-certificate/:documentNumber/direct-landing", { documentNumber })
          : route("/create-catch-certificate/:documentNumber/add-landings", { documentNumber });

        const nextUri = route("/create-catch-certificate/:documentNumber/check-your-information", {
          documentNumber,
        });

        return `${baseRoute}?productId=${item.product.id}&landingId=${model.id}&nextUri=${nextUri}#${encodeURIComponent(idAttribute ?? "")}`;
      };

      const landingFields = getLandingFields(model);

      return (
        <Fragment key={`landing-${model.id}`}>
          {renderErrorMessage(errorObject, speciesLabel, vesselName, dateLanded)}
          {landingFields.map((field) => renderLandingField(field, index, shouldShowChangeLink, getChangeLink))}
        </Fragment>
      );
    });

  return (
    <>
      <h2 className="govuk-heading-l">{t("ccSummaryPageLandingDetails", { ns: "checkYourInformation" })}</h2>
      {exportPayload.items !== undefined && (
        <dl className="govuk-summary-list govuk-!-margin-bottom-5">
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("ccLandingsEntryPageTitle", { ns: "landingsEntry" })}
            </dt>
            <dd className="govuk-summary-list__value">
              {landingsEntry.label ? `${t(landingsEntry.label, { ns: "landingsEntry" })}` : ""}
            </dd>
            <dd className="govuk-summary-list__actions">
              {!isLocked && (
                <a
                  className="govuk-link"
                  href={
                    route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber }) +
                    `?nextUri=${route("/create-catch-certificate/:documentNumber/check-your-information", {
                      documentNumber,
                    })}`
                  }
                  aria-label={t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                >
                  {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                  <span className="govuk-visually-hidden">
                    {" "}
                    {lowerCase(t("ccLandingsEntryPageTitle", { ns: "landingsEntry" }))}
                  </span>
                </a>
              )}
            </dd>
          </div>
          {exportPayload.items?.map((item: ProductLanded, index: number) => (
            <Fragment key={`exportitems-${item.product.id}`}>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("commonSummaryPageCatchesSpecies", { ns: "checkYourInformation" })}
                </dt>
                <dd className="govuk-summary-list__value">
                  {item.product.species.admin ?? item.product.species.label}
                </dd>
                <dd className="govuk-summary-list__actions">
                  {!isLocked && !(isDirectLanding && isOverriddenByAdmin) && (
                    <a
                      className="govuk-link"
                      href={`${route("/create-catch-certificate/:documentNumber/what-are-you-exporting", {
                        documentNumber,
                      })}?productId=${item.product.id}&nextUri=${route(
                        "/create-catch-certificate/:documentNumber/check-your-information",
                        { documentNumber }
                      )}`}
                      aria-label={t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                    >
                      {t("commonWhatExportersAddressChangeLink", { ns: "common" })}
                      <span className="govuk-visually-hidden">
                        {" "}
                        {lowerCase(t("commonSummaryPageCatchesSpecies", { ns: "checkYourInformation" }))}
                      </span>
                    </a>
                  )}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("ccSpeciesBlockLabelStateText", { ns: "whatAreYouExporting" })}
                </dt>
                <dd className="govuk-summary-list__value">{item.product.state?.admin ?? item.product.state?.label}</dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("ccSpeciesBlockLabelPresentationText", { ns: "whatAreYouExporting" })}
                </dt>
                <dd className="govuk-summary-list__value">
                  {item.product.presentation?.admin ?? item.product.presentation?.label}
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key govuk-!-width-one-half">
                  {t("commonCommodityCodeLabel", { ns: "common" })}
                </dt>
                <dd className="govuk-summary-list__value">
                  {item.product.commodityCodeAdmin ?? item.product.commodityCode}
                </dd>
              </div>
              {Array.isArray(item.landings) && item.landings.length > 0 && renderLandingsDetails(item, index)}
            </Fragment>
          ))}

          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key govuk-!-width-one-half">
              {t("ccAddLandingTotalExportWeight", { ns: "checkYourInformation" })}
            </dt>
            <dd className="govuk-summary-list__value">{totalWeight(exportPayload)!.toFixed(2)}kg</dd>
          </div>
        </dl>
      )}
    </>
  );
};
