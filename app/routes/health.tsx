import * as React from "react";
import { Main, Title } from "~/components";
import { FilterSearch } from "~/components/filterSearch";
import { NotificationBanner } from "~/components/notficationBanner";
import { GearDetails } from "~/components/gearDetails";
import { RfmoSelector } from "~/components/rfmoSelector";
import { ErrorSummaryView } from "~/components/errorSummaryView";
import { HighSeasAreaFixture } from "~/components/highSeasAreaFixture";

const CoverageFixtures = () => {
  const [selectedGearCategory, setSelectedGearCategory] = React.useState("");
  const [selectedGearType, setSelectedGearType] = React.useState("");
  const [selectedRfmo, setSelectedRfmo] = React.useState("IOTC");
  const [showClientFilterSearch, setShowClientFilterSearch] = React.useState(true);
  const [showClientRfmoSelector, setShowClientRfmoSelector] = React.useState(true);
  const [showClientErrorSummary, setShowClientErrorSummary] = React.useState(true);

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
