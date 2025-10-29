import type { LandingsEntryOptionType, ConfirmLandingsEntryOptionType, HSAOptionType } from "~/types";

export const landingsEntryOptions: LandingsEntryOptionType[] = [
  {
    label: "ccLandingsEntryOptionsDirectLandingLabel",
    value: "directLanding",
    name: "landingsEntry",
    id: "landingsEntryOption",
    hint: "ccLandingsEntryOptionsDirectLandingHint",
  },
  {
    label: "ccLandingsEntryOptionsManualEntryLabel",
    value: "manualEntry",
    name: "landingsEntry",
    id: "manualOptionEntry",
    hint: "ccLandingsEntryOptionsManualEntryHint",
  },
  {
    label: "ccLandingsEntryOptionsUploadEntryLabel",
    value: "uploadEntry",
    name: "landingsEntry",
    id: "uploadOptionEntry",
    hint: "ccLandingsEntryOptionsUploadEntryHint",
  },
];

export const confirmLandingsEntryOptions: ConfirmLandingsEntryOptionType[] = [
  {
    label: "ccLandingsTypeConfirmationOptionYesText",
    value: "Yes",
    name: "confirmLandingsChange",
    id: "confirmLandingsTypes",
  },
  {
    label: "ccLandingsTypeConfirmationOptionNoText",
    value: "No",
    name: "confirmLandingsChange",
    id: "landingsTypeNo",
  },
];

export const faoAreas = [
  "FAO18",
  "FAO21",
  "FAO27",
  "FAO31",
  "FAO34",
  "FAO37",
  "FAO41",
  "FAO47",
  "FAO48",
  "FAO51",
  "FAO57",
  "FAO58",
  "FAO61",
  "FAO67",
  "FAO71",
  "FAO77",
  "FAO81",
  "FAO87",
  "FAO88",
];

export const confirmHSATypeOptions: HSAOptionType[] = [
  {
    label: "commonThereIs",
    value: "Yes",
    id: "highSeasArea",
  },
  {
    label: "commonThereIsNot",
    value: "No",
    id: "separateHighSeasAreaFalse",
  },
];
