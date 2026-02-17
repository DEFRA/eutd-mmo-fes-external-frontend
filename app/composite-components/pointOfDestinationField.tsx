import classNames from "classnames";
import { useTranslation } from "react-i18next";

type PointOfDestinationFieldProps = {
  errors?: any;
  formData: any;
  exportLocation?: any;
  labelKey: string;
  hintKey: string;
  namespace: string;
};

export const PointOfDestinationField = ({
  errors,
  formData,
  exportLocation,
  labelKey,
  hintKey,
  namespace,
}: PointOfDestinationFieldProps) => {
  const { t } = useTranslation(["errorsText", namespace]);

  return (
    <div
      className={classNames("govuk-form-group govuk-!-width-two-thirds", {
        "govuk-form-group--error": errors?.pointOfDestination,
      })}
    >
      <label htmlFor="pointOfDestination" className="govuk-label">
        {t(labelKey, { ns: namespace })}
      </label>
      <div className="govuk-hint" id="pointOfDestination-hint">
        {t(hintKey, { ns: namespace })}
      </div>
      {errors?.pointOfDestination && (
        <p className="govuk-error-message" id="pointOfDestination-error">
          <span className="govuk-visually-hidden">Error:</span>{" "}
          {t(errors?.pointOfDestination?.message, { ns: "errorsText" })}
        </p>
      )}
      <input
        id="pointOfDestination"
        name="pointOfDestination"
        defaultValue={formData.pointOfDestination ?? exportLocation?.pointOfDestination ?? ""}
        aria-describedby={classNames("pointOfDestination-hint", {
          "pointOfDestination-error": errors?.pointOfDestination,
        })}
        type="text"
        className={classNames("govuk-input", {
          "govuk-input--error": errors?.pointOfDestination,
        })}
      />
    </div>
  );
};
