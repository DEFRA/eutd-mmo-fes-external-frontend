import { AutoCompleteErrorPosition } from "@capgeminiuk/dcx-react-library";
import { getAutocompleteStatusText, getResolvedAutocompleteProps } from "~/components/autocompleteFormField-v2.helpers";
import {
  getInitialSelectedDate,
  getPickerChangeState,
  getSynchronizedSelectedDate,
  shouldRenderAddDateButton,
  shouldRenderCalendarDatePicker,
} from "~/components/commonDatePicker.helpers";
import { decrementIdleTime, getWarningTimeToDisplay } from "~/routes/sign-out.helpers";

describe("component coverage helpers", () => {
  const t = (key: string) => {
    if (key === "commonNoResultsFound") return "No results found";
    return key;
  };

  describe("autocompleteFormField-v2 helpers", () => {
    it("covers status text branches for no results, single, multiple, and negative lengths", () => {
      expect(
        getAutocompleteStatusText({
          length: 0,
          property: "fish",
          position: 1,
          t,
        })
      ).to.equal("No results found");

      expect(
        getAutocompleteStatusText({
          length: 0,
          property: "fish",
          position: 1,
          notFoundText: "No fish found",
          t,
        })
      ).to.equal("No fish found");

      expect(
        getAutocompleteStatusText({
          length: 1,
          property: "fish",
          position: 2,
          t: (key, options) => `${key}:${options?.length}:${options?.property}:${options?.position}`,
        })
      ).to.equal("autocompleteSingleResult:1:fish:2");

      expect(
        getAutocompleteStatusText({
          length: 2,
          property: "fish",
          position: 3,
          t: (key, options) => `${key}:${options?.length}:${options?.property}:${options?.position}`,
        })
      ).to.equal("autocompleteMultipleResults:2:fish:3");

      expect(
        getAutocompleteStatusText({
          length: -1,
          property: "fish",
          position: 0,
          t,
        })
      ).to.equal("");
    });

    it("covers resolved props default-value fallback chain", () => {
      const withDefaultValue = getResolvedAutocompleteProps({
        id: "coverage-default",
        inputProps: {},
        defaultValue: "Haddock",
        t,
      });

      expect(withDefaultValue.inputProps.defaultValue).to.equal("Haddock");

      const withInputValue = getResolvedAutocompleteProps({
        id: "coverage-input-value",
        inputProps: { value: "Cod" },
        defaultValue: "",
        t,
      });

      expect(withInputValue.inputProps.defaultValue).to.equal("Cod");

      const withInputDefaultValue = getResolvedAutocompleteProps({
        id: "coverage-input-default",
        inputProps: { defaultValue: "Pollock" },
        defaultValue: "",
        t,
      });

      expect(withInputDefaultValue.inputProps.defaultValue).to.equal("Pollock");

      const finalEmptyFallback = getResolvedAutocompleteProps({
        id: "coverage-empty-fallback",
        inputProps: {},
        defaultValue: undefined as any,
        t,
      });

      expect(finalEmptyFallback.inputProps.defaultValue).to.equal("");
      expect(finalEmptyFallback.notFoundText).to.equal("No results found");
      expect(finalEmptyFallback.containerClassName).to.equal("govuk-form-group");
      expect(finalEmptyFallback.errorPosition).to.equal(AutoCompleteErrorPosition.AFTER_HINT);
    });
  });

  describe("commonDatePicker helpers", () => {
    it("covers initial date validity branch", () => {
      const valid = getInitialSelectedDate("2026-8-20");
      const invalid = getInitialSelectedDate("not-a-date");

      expect(valid).to.be.instanceOf(Date);
      expect(valid.getFullYear()).to.equal(2026);
      expect(valid.getMonth()).to.equal(7);
      expect(invalid).to.be.instanceOf(Date);
    });

    it("covers picker change state and synchronized date branches", () => {
      const changedWithDefaultFormat = getPickerChangeState(new Date("2026-08-20T00:00:00.000Z"));
      expect(changedWithDefaultFormat.day).to.equal("20");
      expect(changedWithDefaultFormat.month).to.equal("08");
      expect(changedWithDefaultFormat.year).to.equal("2026");
      expect(changedWithDefaultFormat.formattedDate).to.match(/^2026-08-/);

      const changedNull = getPickerChangeState(null);
      expect(changedNull.formattedDate).to.equal("Invalid date");

      const syncValid = getSynchronizedSelectedDate("2026", "8", "20");
      const syncInvalid = getSynchronizedSelectedDate("2026", "99", "99");
      // eslint-disable-next-line no-unused-expressions
      expect(syncValid).to.not.be.null;
      expect(syncValid?.getFullYear()).to.equal(2026);
      expect(syncValid?.getMonth()).to.equal(7);
      // eslint-disable-next-line no-unused-expressions
      expect(syncInvalid).to.be.null;
    });

    it("covers add-button and calendar render helper branches", () => {
      expect(shouldRenderAddDateButton(false, false)).to.equal(true);
      expect(shouldRenderAddDateButton(true, false)).to.equal(false);
      expect(shouldRenderCalendarDatePicker(true, true)).to.equal(true);
      expect(shouldRenderCalendarDatePicker(false, false)).to.equal(false);
    });
  });

  describe("sign-out helpers", () => {
    it("covers idle time decrement for positive and non-positive values", () => {
      expect(decrementIdleTime(5000, 1000)).to.equal(4000);
      expect(decrementIdleTime(0, 1000)).to.equal(0);
      expect(decrementIdleTime(-1000, 1000)).to.equal(0);
    });

    it("covers warning time display in minutes and seconds", () => {
      const tSignOut = (key: string) => {
        if (key === "signOutMinutes") return "minutes";
        if (key === "signOutSeconds") return "seconds";
        return key;
      };

      expect(getWarningTimeToDisplay(65000, 60000, 1000, tSignOut)).to.equal("2 minutes");
      expect(getWarningTimeToDisplay(5000, 60000, 1000, tSignOut)).to.equal("5 seconds");
    });
  });
});
