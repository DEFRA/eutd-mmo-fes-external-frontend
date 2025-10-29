/* 
This file is temporary and will be removed once 
this issue https://github.com/Capgemini/dcx-react-library/issues/309 
in DCX react library for the Form Checkbox is fixed.
*/

import { FormCheckbox } from "@capgeminiuk/dcx-react-library";
import type { IWaterWhereFishCaught } from "~/types";
import { WatersWhereFishCaught } from "~/helpers";
import { useTranslation } from "react-i18next";
import classNames from "classnames/bind";
import { ErrorMessage } from "~/components";

type WhoseWatersProps = {
  error: string;
  caughtInUKWaters: string | undefined;
  caughtInEUWaters: string | undefined;
  caughtInOtherWaters: string | undefined;
  otherWaters: string | undefined;
};

export const WhoseWaters = ({
  error,
  caughtInUKWaters,
  caughtInEUWaters,
  caughtInOtherWaters,
  otherWaters,
}: WhoseWatersProps) => {
  const { t } = useTranslation(["whoseWatersWereTheyCaughtIn", "errorsText"]);
  return (
    <>
      {WatersWhereFishCaught.map((waterWereFishCaught: IWaterWhereFishCaught) => (
        <FormCheckbox
          key={waterWereFishCaught.name}
          id={waterWereFishCaught.id}
          value="Y"
          label={t(waterWereFishCaught.label)}
          labelClassName="govuk-label govuk-checkboxes__label"
          inputClassName="govuk-checkboxes__input"
          itemClassName="govuk-checkboxes__item"
          name={waterWereFishCaught.name}
          inputProps={{
            defaultChecked:
              (waterWereFishCaught.name === "caughtInUKWaters" && caughtInUKWaters === "Y") ||
              (waterWereFishCaught.name === "caughtInEUWaters" && caughtInEUWaters === "Y"),
          }}
        />
      ))}

      <div className="govuk-checkboxes__item">
        <input
          className="govuk-checkboxes__input"
          id="other"
          name="caughtInOtherWaters"
          type="checkbox"
          value="Y"
          defaultChecked={caughtInOtherWaters === "Y"}
        />
        <label className="govuk-label govuk-checkboxes__label" htmlFor="otherWaters">
          {t("ccWhoseWatersWereTheyCaughtInCheckBox3Text")}
        </label>
      </div>
      <div className="govuk-checkboxes__conditional">
        <div className={error ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
          <label className="govuk-label" htmlFor="otherWaters">
            {t("ccWhoseWatersWereTheyCaughtInInputText")}
          </label>
          {error && (
            <ErrorMessage
              text={t(error, { ns: "errorsText" })}
              visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
            />
          )}
          <input
            className={classNames("govuk-input govuk-!-width-one-third", {
              "govuk-input--error": error,
            })}
            id="otherWaters"
            name="otherWaters"
            type="text"
            defaultValue={otherWaters}
          />
        </div>
      </div>
    </>
  );
};
