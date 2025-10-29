import * as React from "react";
import { useEffect } from "react";
import { Main, SecureForm, Title } from "~/components";
import { useLoaderData } from "@remix-run/react";
import { type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import { useHydrated } from "remix-utils/use-hydrated";
import { CookieAction, CookieLoader } from "~/models/cookie.server";

const cookiePreferenceField = "saveCookiePreference";

type cookieLoaderDataType = {
  analyticsAccepted: boolean;
  showSuccessBanner: any;
  csrf: string;
};

export const loader: LoaderFunction = async ({ request }) => await CookieLoader(request);

export const action: ActionFunction = async ({ request }) => await CookieAction(request);

const Cookies = () => {
  const { analyticsAccepted, showSuccessBanner, csrf } = useLoaderData<cookieLoaderDataType>();
  const { t } = useTranslation("cookies");

  const isHydrated = useHydrated();
  const GoogleAnalyticsTable: Object[] = t("GoogleAnalyticsTable.tableContent", { returnObjects: true });
  const MSClarityTable: Object[] = t("MSClarityTable.tableContent", { returnObjects: true });

  useEffect(() => {
    if (showSuccessBanner) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [showSuccessBanner]);

  return (
    <Main showHelpLink={false}>
      <div className="govuk-grid-row">
        {showSuccessBanner && (
          <div
            className="govuk-notification-banner govuk-notification-banner--success"
            role="alert"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner"
          >
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                {t("success")}
              </h2>
            </div>
            <div className="govuk-notification-banner__content">
              <p className="govuk-notification-banner__heading">
                {t("goBackParagraph")}
                {isHydrated ? (
                  <a href="/" className="govuk-link">
                    {t("goBackLink")}
                  </a>
                ) : (
                  <>{t("goBackLink")}</>
                )}
              </p>
            </div>
          </div>
        )}

        <div className="govuk-grid-column-full">
          <Title title={t("cookiesPolicyTitle")} />
          <p className="govuk-body">{t("cookiesPolicyParagraph1")}</p>
          <p className="govuk-body">{t("cookiesPolicyParagraph2")}</p>
          <h2 className="govuk-heading-m">{t("cookiePreferences")}</h2>
          <p className="govuk-body">{t("cookiePreferencesParagraph")}</p>
          <h2 className="govuk-heading-m">{t("GoogleAnalytics")}</h2>
          <p className="govuk-body">{t("GoogleAnalyticsParagraph1")}</p>
          <p className="govuk-body"> {t("GoogleAnalyticsParagraph2")}</p>
          <p className="govuk-body"> {t("GoogleAnalyticsParagraph3")}</p>
          <ul className="govuk-list govuk-list--bullet">
            <li> {t("GoogleAnalyticsList1")}</li>
            <li>{t("GoogleAnalyticsList2")}</li>
            <li>{t("GoogleAnalyticsList3")}</li>
            <li>{t("GoogleAnalyticsList4")}</li>
            <li>{t("GoogleAnalyticsList5")}</li>
          </ul>
          <p className="govuk-body">
            {t("GoogleAnalyticsParagraph4")}
            <a href="https://tools.google.com/dlpage/gaoptout" className="govuk-link">
              {t("GoogleAnalyticsOptOut")}
            </a>
          </p>
          <table className="govuk-table" id="google-analytics-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  {t("GoogleAnalyticsTable.tableHeader.header1")}
                </th>
                <th scope="col" className="govuk-table__header">
                  {t("GoogleAnalyticsTable.tableHeader.header2")}
                </th>
                <th scope="col" className="govuk-table__header">
                  {t("GoogleAnalyticsTable.tableHeader.header3")}
                </th>
                <th scope="col" className="govuk-table__header">
                  {t("GoogleAnalyticsTable.tableHeader.header4")}
                </th>
              </tr>
            </thead>
            <tbody>
              {GoogleAnalyticsTable.map((obj: any) => (
                <tr className="govuk-table__row" key={`catches-${obj?.cookie}`}>
                  <td className="govuk-table__cell">
                    <p className="govuk-!-margin-0">{obj?.cookie}</p>
                  </td>
                  <td className="govuk-table__cell">
                    <p className="govuk-!-margin-0">{obj?.essential}</p>
                  </td>
                  <td className="govuk-table__cell">
                    <p className="govuk-!-margin-0">{obj?.purpose}</p>
                  </td>
                  <td className="govuk-table__cell">
                    <p className="govuk-!-margin-0">{obj?.expiry}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h2 className="govuk-heading-m">{t("MSClarityHeading")}</h2>
          <p className="govuk-body">{t("MSClarityParagraph1")}</p>
          <p className="govuk-body">{t("MSClarityParagraph2")}</p>
          <table className="govuk-table" id="ms-clarity-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  {t("MSClarityTable.tableHeader.header1")}
                </th>
                <th scope="col" className="govuk-table__header">
                  {t("MSClarityTable.tableHeader.header2")}
                </th>
                <th scope="col" className="govuk-table__header">
                  {t("MSClarityTable.tableHeader.header3")}
                </th>
              </tr>
            </thead>
            <tbody>
              {MSClarityTable.map((obj: any) => (
                <tr className="govuk-table__row" key={`catches-${obj?.name}`}>
                  <td className="govuk-table__cell">
                    <p className="govuk-!-margin-0">{obj?.name}</p>
                  </td>
                  <td className="govuk-table__cell">
                    <p className="govuk-!-margin-0">{obj?.purpose}</p>
                  </td>
                  <td className="govuk-table__cell">
                    <p className="govuk-!-margin-0">{obj?.expiry}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="govuk-body">
            {t("MSClarityParagraph3")}
            <a href="https://optout.aboutads.info/" className="govuk-link">
              {t("MSClarityWebChoiceServiceLinkOut")}
            </a>
          </p>
          <h2 className="govuk-heading-m">{t("introductoryCookieMessage")}</h2>
          <p className="govuk-body">{t("introductoryCookieMessageParagraph")}</p>
          <h2 className="govuk-heading-m">{t("cookiesRememberYourSettings")}</h2>
          <p className="govuk-body">{t("cookiesRememberYourSettingsParagraph")}</p>
          <h2 className="govuk-heading-m">{t("essentialCookies")}</h2>
          <p className="govuk-body">{t("essentialCookiesParagraph")}</p>
          <h2 className="govuk-heading-m"> {t("strictlyNecessaryCookies")}</h2>
          <p className="govuk-body">{t("strictlyNecessaryCookiesParagraph1")}</p>
          <p className="govuk-body">{t("strictlyNecessaryCookiesParagraph2")}</p>
          <p className="govuk-body">{t("strictlyNecessaryCookiesParagraph3")}</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>{t("strictlyNecessaryList1")}</li>
            <li>{t("strictlyNecessaryList2")}</li>
            <li>{t("strictlyNecessaryList3")}</li>
          </ul>
          <h2 className="govuk-heading-m">{t("functionalCookies")}</h2>
          <p className="govuk-body">{t("functionalCookiesPsragraph")}</p>
          <ul className="govuk-list govuk-list--bullet">
            <li>{t("functionalCookiesList")}</li>
          </ul>
          <h2 className="govuk-heading-m">{t("sessioncookie")}</h2>
          <p className="govuk-body">{t("sessioncookieParagraph")}</p>
          <br />
          <h2 className="govuk-heading-m">{t("changeyourCookieSettings")}</h2>
          <br />
          <SecureForm method="post" csrf={csrf} replace>
            <div id="radioButtons" className="govuk-form-group">
              <fieldset className="govuk-fieldset">
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">
                  <h2 className="govuk-fieldset__heading">{t("acceptCookies")}</h2>
                </legend>
                <div className="govuk-radios " data-module="govuk-radios">
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="cookieAnalyticsAccept"
                      name={cookiePreferenceField}
                      type="radio"
                      value="Yes"
                      defaultChecked={analyticsAccepted}
                    />
                    <label
                      id="label-cookieAnalyticsAccept"
                      className="govuk-label govuk-radios__label"
                      htmlFor="cookieAnalyticsAccept"
                    >
                      {t("commonYesLabel", { ns: "common" })}
                    </label>
                  </div>
                  <div className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id="cookieAnalyticsReject"
                      name={cookiePreferenceField}
                      type="radio"
                      value="No"
                      defaultChecked={!analyticsAccepted}
                    />
                    <label
                      id="label-cookieAnalyticsReject"
                      className="govuk-label govuk-radios__label"
                      htmlFor="cookieAnalyticsReject"
                    >
                      {t("commonNoLabel", { ns: "common" })}
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
            <br />
            <Button
              id="saveCookieSettings"
              label={t("saveCookieSetting")}
              type={BUTTON_TYPE.SUBMIT}
              className="govuk-button"
              name="_action"
              value="save"
              data-module="govuk-button"
            />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};

export default Cookies;
