import { type ActionFunction } from "react-router";
import * as React from "react";
import { renderToString } from "react-dom/server";
import { onLoginAdminReturnHandler } from "~/.server";
import setApiMock from "tests/msw/helpers/setApiMock";
import logger from "~/logger.server";
import "~/routes/health";
import "~/routes/privacy-notice";
import "~/routes/there-is-a-problem-with-the-service";
import "~/routes/manage-favourites";
import "~/routes/service-improvement-plan";
import "~/components/accessibilityView";
import { FilterSearch } from "~/components/filterSearch";
import { NotificationBanner } from "~/components/notficationBanner";
import { HighSeasAreasDetails } from "~/components/highSeasAreasDetails";
import { GearDetails } from "~/components/gearDetails";

export const LegacyCoverageFixtures = () => {
  const [selectedGearCategory, setSelectedGearCategory] = React.useState("");
  const [selectedGearType, setSelectedGearType] = React.useState("");

  return (
    <div data-testid="coverage-fixtures">
      <FilterSearch label="Search" hint="hint" searchButtonLabel="Search" resetButtonLabel="Reset" />

      <NotificationBanner header="Header" messages={["Message"]} dataTestId="coverage-notification" />

      <HighSeasAreasDetails
        HSALabel="High seas area"
        HSAHint="Hint"
        confirmHSATypeOptions={
          [
            { id: "highSeasArea-yes", value: "yes" },
            { id: "highSeasArea-no", value: "no" },
          ] as any
        }
        highSeasArea={"yes" as any}
        getHSAOptionLabel={(option: any) => String(option.value)}
      />

      <HighSeasAreasDetails
        HSALabel="High seas area"
        HSAHint="Hint"
        confirmHSATypeOptions={
          [
            { id: "highSeasArea-error-yes", value: "yes" },
            { id: "highSeasArea-error-no", value: "no" },
          ] as any
        }
        highSeasArea={"yes" as any}
        getHSAOptionLabel={(option: any) => String(option.value)}
        errors={{ message: "commonErrorText", value: {} } as any}
      />

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
        addLandingGearCategoryNullOption="Select"
        addLandingGearTypeNullOption="Select"
        groupedErrorIds={{}}
        legendTitle="Legend"
        gearDetailsHint="Hint"
        addLandingGearCategoryButton="Add"
        addLandingGearTypeLabel="Type"
        landingGearCategoryLabel="Category"
        visuallyHiddenText="Error"
        errors={
          {
            gearCategory: { fieldId: "gearCategory-error", message: "error" },
            gearType: { fieldId: "gearType-error", message: "error" },
          } as any
        }
        gearCategoryMessage={undefined}
        gearTypeMessage={undefined}
        values={{}}
      />
    </div>
  );
};

export const action: ActionFunction = async ({ request }) => {
  setApiMock(request.url);

  renderToString(React.createElement(LegacyCoverageFixtures));

  logger.info(`[ADMIN-LOGIN][POST][Request: ${request.url}]`);

  return await onLoginAdminReturnHandler(request);
};
