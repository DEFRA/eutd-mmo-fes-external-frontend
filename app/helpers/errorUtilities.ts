import isEmpty from "lodash/isEmpty";
import type { IError } from "~/types";

export function scrollToId(id: string) {
  if (isEmpty(id)) return;

  setTimeout(() => {
    document?.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    document?.getElementById(id)?.focus({ preventScroll: true });
  }, 100);
}

export function errorMessageText(hintText: any, errors: IError) {
  if (hintText) {
    return isEmpty(errors) ? "date-hint" : "date-hint error-message";
  } else {
    return isEmpty(errors) ? "" : "error-message";
  }
}
