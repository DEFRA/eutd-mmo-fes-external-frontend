import isEmpty from "lodash/isEmpty";
import type { IError } from "~/types";

export function scrollToId(id: string) {
  if (isEmpty(id)) return;

  // Convert eez.N to eez-N for EEZ field IDs
  const targetId = id.replace(/^eez\.(\d+)$/, "eez-$1");

  setTimeout(() => {
    document?.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    document?.getElementById(targetId)?.focus({ preventScroll: true });
  }, 100);
}

export function errorMessageText(hintText: any, errors: IError) {
  if (hintText) {
    return isEmpty(errors) ? "date-hint" : "date-hint error-message";
  } else {
    return isEmpty(errors) ? "" : "error-message";
  }
}
