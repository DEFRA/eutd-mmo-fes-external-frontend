import { useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { scrollToId } from "~/helpers";
import { useScrollOnPageLoad } from "./useScrollOnPageLoad";

/**
 * Custom hook for handling common transportation details page logic
 * Manages error scrolling, page load scrolling, and returns error handling state
 */
export const useTransportationDetailsPageSetup = (errors: Record<string, any>) => {
  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return { hasErrors: !isEmpty(errors) };
};
