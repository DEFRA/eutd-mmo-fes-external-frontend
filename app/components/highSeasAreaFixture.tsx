import { HighSeasAreasDetails } from "~/components/highSeasAreasDetails";

type HighSeasAreaFixtureProps = {
  idPrefix: string;
  hint: string;
  highSeasAreaValue: "yes" | "no";
  showError?: boolean;
};

export const HighSeasAreaFixture = ({
  idPrefix,
  hint,
  highSeasAreaValue,
  showError = false,
}: HighSeasAreaFixtureProps) => {
  const options = [
    { id: `${idPrefix}-yes`, value: "yes" },
    { id: `${idPrefix}-no`, value: "no" },
  ] as any;

  return (
    <HighSeasAreasDetails
      HSALabel="High seas area"
      HSAHint={hint}
      confirmHSATypeOptions={options}
      highSeasArea={highSeasAreaValue as any}
      getHSAOptionLabel={(option: any) => String(option.value)}
      errors={showError ? ({ message: "commonErrorText", value: {} } as any) : undefined}
    />
  );
};
