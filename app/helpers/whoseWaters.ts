import type { conservationProps, IWaterWhereFishCaught } from "~/types";

export const WatersWhereFishCaught: Array<IWaterWhereFishCaught> = [
  {
    id: "watersCaughtIn",
    label: "ccWhoseWatersWereTheyCaughtInCheckBox1Text",
    name: "caughtInUKWaters",
  },
  {
    id: "caughtInEUWaters",
    label: "ccWhoseWatersWereTheyCaughtInCheckBox2Text",
    name: "caughtInEUWaters",
  },
];

export const getWhoseWaters = (conservation: conservationProps) => {
  const whoseWaters = [];

  if (conservation.caughtInUKWaters === "Y") whoseWaters.push("UK, British Isles");
  if (conservation.caughtInEUWaters === "Y") whoseWaters.push("EU");
  if (conservation.caughtInOtherWaters === "Y") whoseWaters.push(conservation.otherWaters);

  return whoseWaters;
};
