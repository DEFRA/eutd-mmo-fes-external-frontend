import * as React from "react";
import { Main, Title } from "~/components";
import { FilterSearch } from "~/components/filterSearch";
import { NotificationBanner } from "~/components/notficationBanner";
import { GearDetails } from "~/components/gearDetails";
import { RfmoSelector } from "~/components/rfmoSelector";
import { ErrorSummaryView } from "~/components/errorSummaryView";
import { HighSeasAreaFixture } from "~/components/highSeasAreaFixture";
import {
  CommonDatePicker,
  getDateParts,
  getInitialSelectedDate,
  getPickerChangeState,
  getSynchronizedSelectedDate,
  shouldRenderAddDateButton,
  shouldRenderCalendarDatePicker,
} from "~/components/commonDatePicker";
import { TableHeader } from "~/components/tableHeader";
import { formatAddress } from "~/components/formatAddress";
import { PageNavigationLinks } from "~/composite-components/pageNavigationLinks";
import {
  AutocompleteFormField,
  getAutocompleteStatusText,
  getResolvedAutocompleteProps,
} from "~/components/autocompleteFormField-v2";
import { AutoCompleteErrorPosition } from "@capgeminiuk/dcx-react-library";

const CoverageFixtures = () => {
  const [selectedGearCategory, setSelectedGearCategory] = React.useState("");
  const [selectedGearType, setSelectedGearType] = React.useState("");
  const [selectedRfmo, setSelectedRfmo] = React.useState("IOTC");
  const [selectedDate, setSelectedDate] = React.useState("2026-01-01");
  const [autocompleteChangeValue, setAutocompleteChangeValue] = React.useState("");
  const [autocompleteSelectedValue, setAutocompleteSelectedValue] = React.useState("");
  const [showClientFilterSearch, setShowClientFilterSearch] = React.useState(true);
  const [showClientRfmoSelector, setShowClientRfmoSelector] = React.useState(true);
  const [showClientErrorSummary, setShowClientErrorSummary] = React.useState(true);
  const autocompleteOptions = ["Cod", "Coley", "Hake"];
  const autocompleteSearch = (query: string, options: string[]) => {
    const normalizedQuery = query.toLowerCase();
    if (normalizedQuery === "zz") return [];
    if (normalizedQuery === "hak") return ["Hake"];
    if (normalizedQuery === "co") return ["Cod", "Coley"];
    return options.filter((option) => option.toLowerCase().includes(normalizedQuery));
  };
  const autocompleteStatusTranslator = (key: string, options?: any) => {
    if (key === "commonNoResultsFound") return "No results found";
    if (key === "autocompleteSingleResult")
      return `single:${options?.length}:${options?.property}:${options?.position}`;
    if (key === "autocompleteMultipleResults") {
      return `multiple:${options?.length}:${options?.property}:${options?.position}`;
    }

    return key;
  };
  const paginationTranslator = (key: string) => {
    if (key === "commonDashboardPrev") return "Previous";
    if (key === "commonDashboardNext") return "Next";
    if (key === "commonDashboardPaginationCatchCertificates") return "Catch certificates pages";

    return key;
  };
  const paginationLinks = PageNavigationLinks(
    paginationTranslator,
    new URLSearchParams("month=10&year=2020&position=0"),
    "/create-catch-certificate/catch-certificates",
    "catchCertificate",
    "commonDashboardPaginationCatchCertificates"
  );
  const paginationLinksWithoutHiddenText = PageNavigationLinks(
    paginationTranslator,
    new URLSearchParams("month=10&year=2020&position=0"),
    "/create-catch-certificate/catch-certificates",
    "catchCertificate"
  );

  return (
    <div data-testid="coverage-fixtures">
      <FilterSearch
        label="Common name or FAO code"
        hint="For example, Lobster or LBE."
        defaultValue="Lobster"
        searchButtonLabel="Search"
        resetButtonLabel="Reset"
      />

      <FilterSearch
        label="Common name or FAO code"
        defaultValue="Hake"
        searchButtonLabel="Search"
        resetButtonLabel="Reset"
      />

      <NotificationBanner
        header="Information"
        messages={["A sample notification message"]}
        dataTestId="coverage-notification"
        role="alert"
      />

      <NotificationBanner
        header="Coverage"
        messages={["First message", "Second message"]}
        dataTestId="coverage-notification-multi"
      />

      <div data-testid="coverage-autocomplete-default-fixture">
        <AutocompleteFormField
          id="coverage-autocomplete"
          name="coverageAutocomplete"
          options={autocompleteOptions}
          optionsId="coverage-autocomplete-options"
          errorMessageText="Coverage error"
          defaultValue=""
          labelText="Fish"
          hintText="Start typing a fish name"
          selectProps={{ selectClassName: "govuk-select" }}
          inputProps={{}}
          minCharsBeforeSearch={0}
          onChange={setAutocompleteChangeValue}
          onSelected={setAutocompleteSelectedValue}
          searchHandler={autocompleteSearch}
        />
      </div>

      <div data-testid="coverage-autocomplete-custom-fixture">
        <AutocompleteFormField
          id="coverage-autocomplete-custom"
          name="coverageAutocompleteCustom"
          options={autocompleteOptions}
          optionsId="coverage-autocomplete-custom-options"
          notFoundText="No fish found"
          containerClassName="coverage-autocomplete-container"
          errorId="coverage-autocomplete-error"
          errorPosition={AutoCompleteErrorPosition.AFTER_LABEL}
          errorMessageText="Coverage custom error"
          errorMessageClassName="coverage-autocomplete-error-message"
          defaultValue={undefined as any}
          labelText="Fish custom"
          labelClassName="coverage-autocomplete-label"
          hintText="Type to search fish"
          hintClass="coverage-autocomplete-hint"
          selectProps={{ selectClassName: "coverage-autocomplete-select", id: "coverage-autocomplete-select" }}
          inputProps={{ defaultValue: "Co" }}
          resultUlClass="coverage-autocomplete-menu"
          resultlLiClass="coverage-autocomplete-option"
          resultNoOptionClass="coverage-autocomplete-no-results"
          minCharsBeforeSearch={0}
          minCharsMessage="Keep typing"
          promptId="coverage-autocomplete-prompt"
          promptMessage="Prompt message"
          promptCondition={() => true}
          searchHandler={autocompleteSearch}
          onChange={() => undefined}
          customNonJSComp={<div data-testid="coverage-autocomplete-non-js">Non JS</div>}
        />
      </div>

      <div data-testid="coverage-autocomplete-value-fixture">
        <AutocompleteFormField
          id="coverage-autocomplete-value"
          name="coverageAutocompleteValue"
          options={autocompleteOptions}
          optionsId="coverage-autocomplete-value-options"
          errorMessageText="Coverage value error"
          defaultValue=""
          labelText="Fish value"
          selectProps={{ selectClassName: "govuk-select" }}
          inputProps={{ value: "Cod" }}
        />
      </div>

      <div data-testid="coverage-autocomplete-change-value">{autocompleteChangeValue}</div>
      <div data-testid="coverage-autocomplete-selected-value">{autocompleteSelectedValue}</div>
      <div data-testid="coverage-autocomplete-status-none">
        {getAutocompleteStatusText({
          length: 0,
          property: "fish",
          position: 1,
          t: autocompleteStatusTranslator,
        })}
      </div>
      <div data-testid="coverage-autocomplete-status-one">
        {getAutocompleteStatusText({
          length: 1,
          property: "fish",
          position: 2,
          t: autocompleteStatusTranslator,
        })}
      </div>
      <div data-testid="coverage-autocomplete-status-many">
        {getAutocompleteStatusText({
          length: 2,
          property: "fish",
          position: 3,
          notFoundText: "No fish found",
          t: autocompleteStatusTranslator,
        })}
      </div>
      <div data-testid="coverage-autocomplete-status-negative">
        {getAutocompleteStatusText({
          length: -1,
          property: "fish",
          position: 0,
          t: autocompleteStatusTranslator,
        })}
      </div>
      <div data-testid="coverage-autocomplete-resolved-defaults">
        {JSON.stringify(
          getResolvedAutocompleteProps({
            id: "coverage-autocomplete-helper-defaults",
            inputProps: {},
            defaultValue: "",
            t: autocompleteStatusTranslator,
          })
        )}
      </div>
      <div data-testid="coverage-autocomplete-resolved-customs">
        {JSON.stringify(
          getResolvedAutocompleteProps({
            id: "coverage-autocomplete-helper-customs",
            notFoundText: "No fish found",
            containerClassName: "custom-container",
            errorPosition: AutoCompleteErrorPosition.AFTER_LABEL,
            errorMessageClassName: "custom-error",
            labelClassName: "custom-label",
            hintClass: "custom-hint",
            inputProps: { value: "Cod" },
            defaultValue: "",
            resultUlClass: "custom-menu",
            resultlLiClass: "custom-option",
            resultNoOptionClass: "custom-no-results",
            t: autocompleteStatusTranslator,
          })
        )}
      </div>
      <div data-testid="coverage-autocomplete-resolved-default-value">
        {JSON.stringify(
          getResolvedAutocompleteProps({
            id: "coverage-autocomplete-helper-default-value",
            inputProps: {},
            defaultValue: "Haddock",
            t: autocompleteStatusTranslator,
          })
        )}
      </div>
      <div data-testid="coverage-autocomplete-resolved-empty-fallback">
        {JSON.stringify(
          getResolvedAutocompleteProps({
            id: "coverage-autocomplete-helper-empty-fallback",
            inputProps: {},
            defaultValue: undefined as any,
            t: autocompleteStatusTranslator,
          })
        )}
      </div>
      <div data-testid="coverage-common-date-initial-valid">
        {getInitialSelectedDate("2026-08-15").toISOString().slice(0, 10)}
      </div>
      <div data-testid="coverage-common-date-initial-invalid">
        {String(getInitialSelectedDate("not-a-date") instanceof Date)}
      </div>
      <div data-testid="coverage-common-date-parts-complete">{JSON.stringify(getDateParts("2026-8-20"))}</div>
      <div data-testid="coverage-common-date-parts-empty">{JSON.stringify(getDateParts(""))}</div>
      <div data-testid="coverage-common-date-change-state-valid">
        {getPickerChangeState(new Date("2026-08-20T00:00:00.000Z")).formattedDate}
      </div>
      <div data-testid="coverage-common-date-change-state-null">{getPickerChangeState(null).formattedDate}</div>
      <div data-testid="coverage-common-date-sync-valid">
        {getSynchronizedSelectedDate("2026", "8", "20")?.toISOString().slice(0, 10) ?? "null"}
      </div>
      <div data-testid="coverage-common-date-sync-invalid">
        {String(getSynchronizedSelectedDate("2026", "99", "99"))}
      </div>
      <div data-testid="coverage-common-date-add-button-true">{String(shouldRenderAddDateButton(false, false))}</div>
      <div data-testid="coverage-common-date-add-button-false">{String(shouldRenderAddDateButton(true, false))}</div>
      <div data-testid="coverage-common-date-calendar-true">{String(shouldRenderCalendarDatePicker(true, true))}</div>
      <div data-testid="coverage-common-date-calendar-false">
        {String(shouldRenderCalendarDatePicker(false, false))}
      </div>
      <div data-testid="coverage-page-navigation-links" style={{ clear: "both" }}>
        <nav className="govuk-pagination" aria-label="Pagination">
          <div data-testid="coverage-page-navigation-prev">{paginationLinks.previousLink()}</div>
          <ul data-testid="coverage-page-navigation-monthly">{paginationLinks.monthlyLinks()}</ul>
          <div data-testid="coverage-page-navigation-next">{paginationLinks.nextLink()}</div>
          <div data-testid="coverage-page-navigation-prev-no-hidden">
            {paginationLinksWithoutHiddenText.previousLink()}
          </div>
          <div data-testid="coverage-page-navigation-next-no-hidden">{paginationLinksWithoutHiddenText.nextLink()}</div>
        </nav>
      </div>

      <CommonDatePicker
        id="coverage-date"
        name="coverageDate"
        errors={{} as any}
        hintText="commonDatePickerHintText"
        label="commonDatePickerLegend"
        labelStyle="bold"
        translationNs="common"
        dateSelected={selectedDate}
        getDateSelected={setSelectedDate}
      />

      <CommonDatePicker
        id="coverage-date-with-error"
        name="coverageDateWithError"
        errors={{ message: "commonErrorText", value: {} } as any}
        label="commonDatePickerLegend"
        translationNs="common"
        dateSelected=""
        hideAddDateButton={true}
        getDateSelected={setSelectedDate}
      />

      <CommonDatePicker
        id="coverage-date-add-button"
        name="coverageDateAddButton"
        errors={{} as any}
        label="commonDatePickerLegend"
        translationNs="common"
        dateSelected=""
        hideAddDateButton={false}
        isHydratedOverride={false}
        getDateSelected={setSelectedDate}
      />

      <table className="govuk-table" data-testid="coverage-table-header">
        <TableHeader headersToRender={["Document number", "", "Action"]} />
      </table>

      <div data-testid="coverage-format-address">{formatAddress("Line 1", null, "Line 2", undefined, "Line 3")}</div>

      <HighSeasAreaFixture idPrefix="hsa-option" hint="Select one option" highSeasAreaValue="yes" />

      <HighSeasAreaFixture idPrefix="hsa-option-error" hint="Select one option" highSeasAreaValue="no" showError />

      <GearDetails
        isHydrated={false}
        selectedGearCategory={selectedGearCategory}
        selectedGearType={selectedGearType}
        setSelectedGearCategory={setSelectedGearCategory}
        setSelectedGearType={setSelectedGearType}
        gearCategories={["Trawl", "Longline"]}
        gearTypes={
          [
            { gearName: "Drift nets", gearCode: "GN" },
            { gearName: "Pots", gearCode: "FPO" },
          ] as any
        }
        addLandingGearCategoryNullOption="Select category"
        addLandingGearTypeNullOption="Select type"
        groupedErrorIds={{ gearDetails: ["gearCategory-error", "gearType-error"] }}
        legendTitle="Gear details"
        gearDetailsHint="Select category and type"
        addLandingGearCategoryButton="Add"
        addLandingGearTypeLabel="Gear type"
        landingGearCategoryLabel="Gear category"
        visuallyHiddenText="Error"
        errors={
          {
            gearCategory: { fieldId: "gearCategory-error", message: "error" },
            gearType: { fieldId: "gearType-error", message: "error" },
          } as any
        }
        gearCategoryMessage="Select a gear category"
        gearTypeMessage="Select a gear type"
        values={{}}
      />

      <GearDetails
        isHydrated={true}
        selectedGearCategory={selectedGearCategory}
        selectedGearType={undefined}
        setSelectedGearCategory={setSelectedGearCategory}
        setSelectedGearType={setSelectedGearType}
        gearCategories={["Trawl"]}
        gearTypes={[{ gearName: "Drift nets", gearCode: "GN" }] as any}
        addLandingGearCategoryNullOption="Select category"
        addLandingGearTypeNullOption="Select type"
        groupedErrorIds={{}}
        legendTitle="Gear details"
        gearDetailsHint="Select category and type"
        addLandingGearCategoryButton="Add"
        addLandingGearTypeLabel="Gear type"
        landingGearCategoryLabel="Gear category"
        visuallyHiddenText="Error"
        errors={{ gearCategory: {}, gearType: {} } as any}
        gearCategoryMessage={undefined}
        gearTypeMessage={undefined}
        values={{ gearCategory: "Trawl" }}
      />

      <GearDetails
        isHydrated={true}
        selectedGearCategory={undefined}
        selectedGearType={undefined}
        setSelectedGearCategory={setSelectedGearCategory}
        setSelectedGearType={setSelectedGearType}
        gearCategories={null as any}
        gearTypes={[] as any}
        addLandingGearCategoryNullOption="Select category"
        addLandingGearTypeNullOption="Select type"
        groupedErrorIds={{}}
        legendTitle="Gear details"
        gearDetailsHint="Select category and type"
        addLandingGearCategoryButton="Add"
        addLandingGearTypeLabel="Gear type"
        landingGearCategoryLabel="Gear category"
        visuallyHiddenText="Error"
        errors={{ gearCategory: {}, gearType: {} } as any}
        gearCategoryMessage={undefined}
        gearTypeMessage={undefined}
        values={undefined}
      />

      <GearDetails
        isHydrated={true}
        selectedGearCategory={selectedGearCategory}
        selectedGearType={selectedGearType}
        setSelectedGearCategory={setSelectedGearCategory}
        setSelectedGearType={setSelectedGearType}
        gearCategories={["Trawl"]}
        gearTypes={[{ gearName: "Drift nets", gearCode: "GN" }] as any}
        addLandingGearCategoryNullOption="Select category"
        addLandingGearTypeNullOption="Select type"
        groupedErrorIds={{ gearDetails: ["gearType-error"] }}
        legendTitle="Gear details"
        gearDetailsHint="Select category and type"
        addLandingGearCategoryButton="Add"
        addLandingGearTypeLabel="Gear type"
        landingGearCategoryLabel="Gear category"
        visuallyHiddenText="Error"
        errors={
          {
            gearCategory: {},
            gearType: { message: "error" },
          } as any
        }
        gearCategoryMessage={undefined}
        gearTypeMessage="Select a gear type"
        values={{ gearCategory: "Trawl" }}
      />

      <RfmoSelector
        rfmos={["IOTC", "NEAFC"]}
        selectedRfmo={selectedRfmo}
        setRfmo={setSelectedRfmo}
        optionalLabel="RFMO"
        rfmoHintText="Select RFMO"
        rfmoNullOption="Select RFMO"
        ccRfmoNullOptionAriaLabel="Select RFMO"
        rfmoHelpSectionLink="<b>RFMO help</b>"
        rfmoHelpSectionContentOne="Help text"
        rfmoHelpSectionContentTwoLink="Read more"
      />

      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        data-testid="mount-client-rfmo-selector"
        onClick={() => setShowClientRfmoSelector(true)}
      >
        Mount rfmo selector
      </button>
      {showClientRfmoSelector && (
        <div data-testid="client-rfmo-selector-fixture">
          <RfmoSelector
            rfmos={["IOTC", "NEAFC"]}
            selectedRfmo={selectedRfmo}
            setRfmo={setSelectedRfmo}
            optionalLabel="Client RFMO"
            rfmoHintText="Select RFMO"
            rfmoNullOption="Select RFMO"
            ccRfmoNullOptionAriaLabel="Select RFMO"
            rfmoHelpSectionLink="<b>RFMO help</b>"
            rfmoHelpSectionContentOne="Help text"
            rfmoHelpSectionContentTwoLink="Read more"
          />
        </div>
      )}

      <ErrorSummaryView
        errors={[{ key: "field-1", message: "commonErrorText", value: { fieldName: "Field" } } as any]}
      />
      <ErrorSummaryView
        errors={[{ key: "field-2", message: "commonErrorText" } as any]}
        linkData={[{ href: "#field-2" } as any]}
      />
      <ErrorSummaryView errors={[]} />
      <ErrorSummaryView {...({} as any)} />

      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        data-testid="mount-client-filter-search"
        onClick={() => setShowClientFilterSearch(true)}
      >
        Mount filter search
      </button>
      {showClientFilterSearch && (
        <div data-testid="client-filter-search-fixture">
          <FilterSearch
            id="client-filter-search"
            label="Client filter search"
            defaultValue="Cod"
            searchButtonLabel="Search"
            resetButtonLabel="Reset"
          />
        </div>
      )}

      <button
        type="button"
        className="govuk-button govuk-button--secondary"
        data-testid="mount-client-error-summary"
        onClick={() => setShowClientErrorSummary(true)}
      >
        Mount error summary
      </button>
      {showClientErrorSummary && (
        <ErrorSummaryView
          containerClassName="client-mounted-error-summary"
          errors={[{ key: "field-3", message: "commonErrorText", value: { fieldName: "Field" } } as any]}
        />
      )}
    </div>
  );
};

const Health = () => (
  <Main showHelpLink={false}>
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <Title title="This is a devOps page to test frontDoor" />
        <CoverageFixtures />
      </div>
    </div>
  </Main>
);

export default Health;
