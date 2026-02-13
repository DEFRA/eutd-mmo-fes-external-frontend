import type { ContainerInput } from "~/types";
import { v4 as uuidv4 } from "uuid";

const generateId = () => uuidv4();

export function getContainerInputData(
  isHydrated: boolean,
  maximumContainers: number,
  containerInputs: ContainerInput[]
) {
  if (!isHydrated) {
    // Non-JS mode: render exactly maximumContainers boxes with fallback to empty
    return Array.from({ length: maximumContainers }, (v, i) => containerInputs?.[i] ?? { id: generateId(), value: "" });
  }
  // JS mode: only show up to maximumContainers from the actual inputs
  // This prevents showing 10 boxes when maximumContainers=5
  return containerInputs.slice(0, maximumContainers);
}
