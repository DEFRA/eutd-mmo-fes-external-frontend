import type { INotification } from "~/types";

export const Notification = ({ title, message }: INotification) => (
  <div style={{ border: 0, marginBottom: "30px" }} className="govuk-notification-banner" role="alert">
    <div className="govuk-notification-banner__header govuk-!-padding-top-4">
      <h2 style={{ color: "white", marginBottom: "15px" }} className="govuk-heading-l">
        {title}
      </h2>
      <p style={{ color: "white", marginTop: 0 }}>{message}</p>
    </div>
  </div>
);
