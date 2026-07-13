import type { INotification } from "~/types";

export const Notification = ({ title, message }: INotification) => (
  <div className="govuk-notification-banner notification-banner" role="alert">
    <div className="govuk-notification-banner__header govuk-!-padding-top-4">
      <h2 className="govuk-heading-l notification-banner__heading">{title}</h2>
      <p className="notification-banner__message">{message}</p>
    </div>
  </div>
);
