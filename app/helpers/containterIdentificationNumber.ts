import type { ContainerInput } from "~/types";
import { v4 as uuidv4 } from "uuid";

const generateId = () => uuidv4();

export function getContainerInputData(
  isHydrated: boolean,
  maximumContainers: number,
  containerInputs: ContainerInput[]
) {
  if (!isHydrated) {
    return Array.from({ length: maximumContainers }, (v, i) => containerInputs?.[i] ?? { id: generateId(), value: "" });
  }
  return containerInputs;
}
