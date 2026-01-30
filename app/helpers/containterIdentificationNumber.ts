import type { ContainerInput } from "~/types";
import { v4 as uuidv4 } from "uuid";

const generateId = () => uuidv4();

// Default number of container fields to display in non-JS mode
const NON_JS_DEFAULT_CONTAINER_COUNT = 5;

export function getContainerInputData(
  isHydrated: boolean,
  maximumContainers: number,
  containerInputs: ContainerInput[]
) {
  if (!isHydrated) {
    const nonJsCount = Math.min(NON_JS_DEFAULT_CONTAINER_COUNT, maximumContainers);
    return Array.from({ length: nonJsCount }, (v, i) => containerInputs?.[i] ?? { id: generateId(), value: "" });
  }
  return containerInputs;
}
