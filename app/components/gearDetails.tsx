import classNames from "classnames/bind";
import { ErrorMessage } from "./errorMessage";
import type { IErrorsTransformed, IGearType } from "~/types";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";

type gearDetailsProps = {
  isHydrated: boolean;
  selectedGearCategory: string | undefined;
  selectedGearType: string | undefined;
  setSelectedGearCategory: (value: React.SetStateAction<string>) => void;
  setSelectedGearType: (value: React.SetStateAction<string>) => void;
  gearCategories: string[];
  gearTypes: IGearType[];
  gearType: string;
  addLandingGearCategoryNullOption: string;
  addLandingGearTypeNullOption: string;
  groupedErrorIds: Record<string, string[]>;
  legendTitle: string;
  gearDetailsHint: string;
  addLandingGearCategoryButton: string;
  addLandingGearTypeLabel: string;
  landingGearCategoryLabel: string;
  visuallyHiddenText: string;
  errors: IErrorsTransformed;
  gearCategoryMessage: string | undefined;
  gearTypeMessage: string | undefined;
  values?: any;
};

export const GearDetails = ({
  isHydrated,
  selectedGearCategory,
  selectedGearType,
  setSelectedGearCategory,
  setSelectedGearType,
  gearCategories,
  gearTypes,
  gearType,
  addLandingGearCategoryNullOption,
  addLandingGearTypeNullOption,
  groupedErrorIds,
  legendTitle,
  landingGearCategoryLabel,
  visuallyHiddenText,
  gearDetailsHint,
  addLandingGearCategoryButton,
  addLandingGearTypeLabel,
  errors,
  gearCategoryMessage,
  gearTypeMessage,
  values,
}: gearDetailsProps) => (
  <div
    className={classNames("govuk-form-group", {
      "govuk-form-group--error": groupedErrorIds["gearDetails"]?.length > 0,
    })}
  >
    <fieldset
      className="govuk-fieldset"
      role="group"
      aria-describedby={`gearDetails-hint ${groupedErrorIds["gearDetails"]?.join(" ") ?? ""}`}
    >
      <legend className="govuk-fieldset__legend">
        <b>{legendTitle}</b>
      </legend>
      <div id="gearDetails-hint" className="govuk-hint">
        {gearDetailsHint}
      </div>
      <div
        className={classNames("govuk-form-group govuk-!-margin-bottom-3", {
          "govuk-form-group--error": errors.gearCategory?.message,
        })}
      >
        <label htmlFor="gearCategory" className="govuk-label">
          {landingGearCategoryLabel}
        </label>
        {gearCategoryMessage && (
          <ErrorMessage
            id={errors.gearCategory.fieldId ?? "gearCategory-error"}
            text={gearCategoryMessage}
            visuallyHiddenText={visuallyHiddenText}
          />
        )}
        <select
          name="gearCategory"
          id="gearCategory"
          className={classNames("govuk-select govuk-!-width-one-half govuk-!-margin-bottom-3 govuk-!-margin-right-4", {
            " govuk-select--error": errors?.gearCategory?.message,
          })}
          defaultValue={values?.gearCategory ?? selectedGearCategory}
          onChange={(e) => setSelectedGearCategory(e.target.value)}
        >
          <option value="" selected aria-label={addLandingGearCategoryNullOption}>
            {addLandingGearCategoryNullOption}
          </option>
          {Array.isArray(gearCategories) &&
            gearCategories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
        </select>
        {!isHydrated && (
          <Button
            id="add-gear-category"
            label={addLandingGearCategoryButton}
            type={BUTTON_TYPE.SUBMIT}
            className="govuk-button govuk-button--primary govuk-!-margin-bottom-0"
            data-module="govuk-button"
            name="_action"
            // @ts-ignore
            value="addGearCategory"
            data-testid="add-gear-category"
          />
        )}
      </div>
      <div
        className={classNames("govuk-form-group", {
          "govuk-form-group--error": errors.gearType?.message,
        })}
      >
        <label htmlFor="gearType" className="govuk-label">
          {addLandingGearTypeLabel}
        </label>
        {gearTypeMessage && (
          <ErrorMessage
            id={errors.gearType.fieldId ?? "gearType-error"}
            text={gearTypeMessage}
            visuallyHiddenText={visuallyHiddenText}
          />
        )}
        <select
          name="gearType"
          id="gearType"
          className={classNames("govuk-select govuk-!-width-one-half", {
            " govuk-select--error": errors?.gearType?.message,
          })}
          defaultValue={selectedGearType}
          onChange={(e) => setSelectedGearType(e.target.value)}
        >
          <option value="" selected aria-label={addLandingGearTypeNullOption}>
            {addLandingGearTypeNullOption}
          </option>
          {gearTypes.map(({ gearName, gearCode }) => (
            <option
              key={gearCode}
              value={`${gearName} (${gearCode})`}
              selected={`${gearName} (${gearCode})` === gearType}
            >
              {`${gearName} (${gearCode})`}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  </div>
);
