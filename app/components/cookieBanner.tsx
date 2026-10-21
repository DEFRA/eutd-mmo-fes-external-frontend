import * as React from "react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useRevalidator } from "react-router";
import { route } from "routes-gen";

export const CookieBanner = () => {
  const { t } = useTranslation("cookieBanner");
  const [isHidden, setIsHidden] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [acceptedChoice, setAcceptedChoice] = useState(false);
  const { revalidate } = useRevalidator();

  useEffect(() => {
    // Check if URL contains loggedIn=yes parameter
    const searchParams = new URLSearchParams(globalThis.location.search);
    const isLoggedIn = searchParams.get("loggedIn") === "yes";

    // Show banner only if loggedIn=yes parameter is present
    setIsHidden(!isLoggedIn);
  }, []);

  const saveCookiePreference = async (acceptsCookies: boolean) => {
    try {
      // Fetch a route-agnostic token so the banner works on any page, not just "/"
      const csrfResponse = await fetch("/set-cookie-preference", { credentials: "same-origin" });
      const { csrf } = (await csrfResponse.json()) as { csrf?: string };

      const body = new URLSearchParams();
      body.set("acceptsCookies", String(acceptsCookies));
      body.set("csrf", csrf ?? "");

      const response = await fetch("/set-cookie-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (response.ok) {
        void revalidate();
      }
    } catch {
      // Silent fail - banner confirmation still shown; preference not persisted
    }
  };

  const handleAccept = () => {
    setAcceptedChoice(true);
    setShowConfirmation(true);

    // Save to database and refresh the analytics cookie from the server
    void saveCookiePreference(true);
  };

  const handleReject = () => {
    setAcceptedChoice(false);
    setShowConfirmation(true);

    // Save to database and refresh the analytics cookie from the server
    void saveCookiePreference(false);
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
