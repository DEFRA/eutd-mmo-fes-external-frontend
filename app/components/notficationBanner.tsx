import type { INotificationBanner } from "~/types";
import classNames from "classnames/bind";

export const NotificationBanner = ({
  header,
  messages,
  className = "",
  dataTestId = "",
  role = "region",
}: INotificationBanner) => (
  <div
    className={classNames("govuk-notification-banner", className)}
    role={role}
    aria-labelledby="govuk-notification-banner-title"
    data-module="govuk-notification-banner"
  >
    <div className="govuk-notification-banner__header">
      <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
        {header}
      </h2>
    </div>
    <div className="govuk-notification-banner__content">
      {messages.map((message) => (
        <div key={`message-${dataTestId}`} className="govuk-notification-banner__heading" data-testid={dataTestId}>
          {message}
        </div>
      ))}
    </div>
  </div>
);
