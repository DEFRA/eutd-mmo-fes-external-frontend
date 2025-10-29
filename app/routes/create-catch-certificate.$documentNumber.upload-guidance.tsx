import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLoaderData } from "@remix-run/react";
import { Main, Title } from "~/components";
import { route } from "routes-gen";
import { type LoaderFunction } from "@remix-run/node";
import setApiMock from "tests/msw/helpers/setApiMock";

export const loader: LoaderFunction = async ({ request, params }) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const { documentNumber } = params;

  return new Response(JSON.stringify({ documentNumber }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

const createTableHeader = (options: string[]) => (
  <thead className="govuk-table__head">
    <tr className="govuk-table__row">
      {options.map((option) => (
        <th scope="col" className="govuk-table__header" key={option}>
          {option}
        </th>
      ))}
    </tr>
  </thead>
);

const UploadGuidance = () => {
  const { documentNumber } = useLoaderData<{ documentNumber: string | undefined }>();
  const { t } = useTranslation(["uploadGuidance", "common"]);
  return (
    <Main backUrl={route("/create-catch-certificate/:documentNumber/upload-file", { documentNumber })}>
      <Title title={t("ccUploadGuidanceHeader")} />
      <div className="govuk-warning-text" data-testid="warning-message">
        <span className="govuk-warning-text__icon" aria-hidden="true">
          !
        </span>
        <strong className="govuk-warning-text__text">{t("ccUploadGuidanceMessage")} </strong>
      </div>
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--l" data-testid="data-general-label">
          {t("ccUploadGuidanceHeading")}
        </caption>
        {createTableHeader([t("ccUploadGuidanceSubject"), t("ccUploadGuidanceGuidance")])}
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              <b>
                {t("ccUploadGuidanceUpload")}
                <br />
                {t("ccUploadGuidanceProcess")}
                <br />
              </b>
            </th>
            <td className="govuk-table__cell">
              <ol className="govuk-list govuk-list--bullet">
                <li>
                  <span>{t("ccUploadGuidanceUploadProcessLineOne")}</span>
                  <ol className="govuk-list govuk-list--number">
                    <li>
                      <strong>{t("ccUploadGuidanceUploadProcessLineTwoBold")}</strong>
                      {t("ccUploadGuidanceUploadProcessLineTwo")}
                    </li>
                    <li>
                      <strong>{t("ccUploadGuidanceUploadProcessLineThreeBold")}</strong>
                      {t("ccUploadGuidanceUploadProcessLineThree")}
                    </li>
                    <li>
                      <strong>{t("ccUploadGuidanceUploadProcessLinefourBold")}</strong>
                      {t("ccUploadGuidanceUploadProcessLinefour")}
                    </li>
                  </ol>
                </li>
                <li className="">{t("ccUploadGuidanceUploadProcessLinefive")}</li>
              </ol>
            </td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceLimitation")}
            </th>
            <td className="govuk-table__cell">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceLimitationLineOne")}</li>
                <li>{t("ccUploadGuidanceLimitationLineTwo")}</li>
                <li>{t("ccUploadGuidanceLimitationLineThree")}</li>
              </ol>
            </td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceProductId")}
            </th>
            <td className="govuk-table__cell">
              <ol className="govuk-list govuk-list--bullet">
                <li>
                  {t("ccUploadGuidanceProductIdLineOne")} &nbsp;
                  <Link
                    className="govuk-link"
                    to={route("/create-catch-certificate/:documentNumber/upload-favourites", { documentNumber })}
                    aria-label="Opens link for information on product favourites"
                  >
                    <span className="govuk-visually-hidden">(opens in same tab)</span>
                    {t("ccUploadGuidanceProductIdFavouriteLink")}
                  </Link>
                  &nbsp; {t("ccUploadGuidanceProductIdLineOneIsSaved")}
                </li>
                <li>
                  <span>{t("ccUploadGuidanceProductIdLineTwo")}</span>
                </li>
                <li>
                  <span>{t("ccUploadGuidanceProductIdLineThree")}</span>
                </li>
              </ol>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--l" data-testid="data-csvfile-label">
          {t("ccUploadGuidanceCsvFile")}
        </caption>
        {createTableHeader([t("ccUploadGuidanceSubject"), t("ccUploadGuidanceGuidance")])}
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceCsvFileType")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceCsvFileTypeLineOne")}</li>
                <li>{t("ccUploadGuidanceCsvFileTypeLineTwo")}</li>
              </ol>
            </td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceCsvDataStructure")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceCsvDataStructureLineOne")}</li>
                <li>{t("ccUploadGuidanceCsvDataStructureLineTwo")}</li>
                <div className="govuk-inset-text">
                  <b>{t("ccUploadGuidanceCsvDataStructureLineThreeBold")}</b>
                  <br />
                  <span className="example-data-structure-short">{t("ccUploadGuidanceCsvDataStructureLineFour")}</span>
                  <br />
                </div>
                <li>{t("ccUploadGuidanceCsvDataStructureLineFive")}</li>
                <li>{t("ccUploadGuidanceCsvDataStructureLineSix")}</li>
                <li>{t("ccUploadGuidanceCsvDataStructureLineSeven")}</li>
                <div className="govuk-inset-text">
                  <b>{t("ccUploadGuidanceCsvDataStructureLineEightBold")}</b>
                  <br />
                  <span className="example-data-structure-full">{t("ccUploadGuidanceCsvDataStructureLineNine")}</span>
                  <br />
                </div>
                <li>{t("ccUploadGuidanceCsvDataStructureLineTen")}</li>
                <div className="govuk-inset-text">
                  <b>{t("ccUploadGuidanceCsvDataStructureLineElevenBold")}</b>
                  <br />
                  <span className="example-data-structure-short">
                    {t("ccUploadGuidanceCsvDataStructureLineTwelve")}
                  </span>
                  <br />
                </div>
              </ol>
            </td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceCsvValidation")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceCsvValidationlineOne")}</li>
                <li>{t("ccUploadGuidanceCsvValidationlineTwo")}</li>
              </ol>
            </td>
          </tr>
        </tbody>
      </table>

      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--l" data-testid="data-requirements-label">
          {t("ccUploadGuidanceDataRequirment")}
        </caption>
        {createTableHeader([
          t("ccUploadGuidanceDataRequirmentField"),
          t("ccUploadGuidanceGuidance"),
          t("ccUploadGuidanceDataRequirmentExample"),
        ])}
        <tbody className="govuk-table__body">
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentProductId")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentProductIdLine")}</li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">PRD123</td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentStartDate")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentStartDateLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentStartDateLineTwo")} </li>
                <li>{t("ccUploadGuidanceDataRequirmentStartDateLineThree")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentStartDateLineFour")}</li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">01/01/2021</td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentDateLanded")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentDateLandedLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentDateLandedLineTwo")} </li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">01/01/2021</td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentCatchArea")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentCatchAreaLineOne")}</li>
                <li>
                  {t("ccUploadGuidanceDataRequirmentCatchAreaLineTwo")}
                  <a
                    className="govuk-link govuk-link--no-visited-state"
                    href="https://www.fao.org"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Opens external link for information on FAO major fishing areas"
                  >
                    www.fao.org {t("ccUploadGuidanceOpensInNewTab")}
                  </a>
                </li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">FAO27</td>
          </tr>
          {/* High Seas */}
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentHighSeas")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentHighSeasLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentHighSeasLineTwo")}</li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">Yes</td>
          </tr>
          {/* EEZ */}
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentEEZ")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentEEZLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentEEZLineTwo")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentEEZLineThree")}</li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">GBR</td>
          </tr>
          {/* RFMO */}
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentRFMO")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentRFMOLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentRFMOLineTwo")}</li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">IOTC</td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentVesselPln")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentVesselPlnLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentVesselPlnLineTwo")}</li>
                <li>
                  {t("ccUploadGuidanceDataRequirmentVesselPlnLineThree")}
                  <a
                    className="govuk-link govuk-link--no-visited-state"
                    href="https://fishhub.cefas.co.uk/vessel-register/"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Opens external link for vessel register information"
                  >
                    fishhub.cefas.co.uk/vessel-register/ {t("ccUploadGuidanceOpensInNewTab")}
                  </a>
                </li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">PH1100</td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentGearType")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentGearTypeLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentGearTypeLineTwo")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentGearTypeLineThree")}</li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">PS</td>
          </tr>
          <tr className="govuk-table__row">
            <th scope="row" className="govuk-table__header">
              {t("ccUploadGuidanceDataRequirmentExportweight")}
            </th>
            <td className="govuk-table__cell td-width">
              <ol className="govuk-list govuk-list--bullet">
                <li>{t("ccUploadGuidanceDataRequirmentExportweightLineOne")}</li>
                <li>{t("ccUploadGuidanceDataRequirmentExportweightLineTwo")}</li>
              </ol>
            </td>
            <td className="govuk-table__cell td-width">50.95</td>
          </tr>
        </tbody>
      </table>
    </Main>
  );
};

export default UploadGuidance;
