import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { route } from "routes-gen";

export const CookieBanner = () => {
  const { t } = useTranslation("cookieBanner");
  const [isHidden, setIsHidden] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [acceptedChoice, setAcceptedChoice] = useState(false);

  useEffect(() => {
    // Check if URL contains loggedIn=yes parameter
    const searchParams = new URLSearchParams(globalThis.location.search);
    const isLoggedIn = searchParams.get("loggedIn") === "yes";

    // Show banner only if loggedIn=yes parameter is present
    setIsHidden(!isLoggedIn);
  }, []);

  const saveCookiePreference = async (acceptsCookies: boolean) => {
    try {
      await fetch("/set-cookie-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ acceptsCookies }),
      });
    } catch {
      // Silent fail - cookie is still set locally for immediate UX
    }
  };

  const handleAccept = () => {
    // Set cookie client-side
    document.cookie = `analytics_cookies_accepted=${JSON.stringify({ analyticsAccepted: true })}; path=/; SameSite=Strict; Secure`;
    setAcceptedChoice(true);
    setShowConfirmation(true);

    // Save to database
    saveCookiePreference(true);
  };

  const handleReject = () => {
    // Set cookie client-side
    document.cookie = `analytics_cookies_accepted=${JSON.stringify({ analyticsAccepted: false })}; path=/; SameSite=Strict; Secure`;
    setAcceptedChoice(false);
    setShowConfirmation(true);

    // Save to database
    saveCookiePreference(false);
  };

  const handleHideBanner = () => {
    setIsHidden(true);
  };

  if (isHidden) {
    return null;
  }

  if (showConfirmation) {
    return (
      <section className="govuk-cookie-banner" data-nosnippet aria-label={t("cookieBannerLabel")}>
        <div className="govuk-cookie-banner__message govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">
                  {acceptedChoice ? t("acceptedMessage") : t("rejectedMessage")}{" "}
                  <Link to={route("/cookies")} className="govuk-link">
                    {t("changeCookieSettings")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
          <div className="govuk-button-group">
            <button type="button" className="govuk-button" data-module="govuk-button" onClick={handleHideBanner}>
              {t("hideButton")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="govuk-cookie-banner" data-nosnippet aria-label={t("cookieBannerLabel")}>
      <div className="govuk-cookie-banner__message govuk-width-container">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-cookie-banner__heading govuk-heading-m">{t("heading")}</h2>
            <div className="govuk-cookie-banner__content">
              <p className="govuk-body">
                {t("message")}{" "}
                <Link to={route("/cookies")} className="govuk-link">
                  {t("cookiesLink")}
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="govuk-button-group">
          <button type="button" className="govuk-button" data-module="govuk-button" onClick={handleAccept}>
            {t("acceptButton")}
          </button>
          <button type="button" className="govuk-button" data-module="govuk-button" onClick={handleReject}>
            {t("rejectButton")}
          </button>
          <Link to={route("/cookies")} className="govuk-link">
            {t("viewCookiesLink")}
          </Link>
        </div>
      </div>
    </section>
  );
};
