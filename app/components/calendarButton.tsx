import { BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import { forwardRef, type ForwardedRef } from "react";

export const CalendarDateButton = forwardRef(
  (
    { value, onClick }: { value?: string | number; onClick?: (evt: React.MouseEvent<HTMLButtonElement>) => void },
    ref: ForwardedRef<unknown>
  ) => {
    const { t } = useTranslation();
    return (
      <button
        className="date-picker"
        type={BUTTON_TYPE.BUTTON}
        value={value}
        onClick={onClick}
        aria-label={t("commonCalenderButtonLabel", { ns: "common" })}
        // @ts-ignore
        ref={ref}
      >
        <img alt="calendar" src="/assets/images/calendar.png" />
      </button>
    );
  }
);
CalendarDateButton.displayName = "CalenderButton";
