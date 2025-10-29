import isEmpty from "lodash/isEmpty";
import { useEffect } from "react";
import { scrollToId } from "~/helpers";
import type { IError, IErrorsTransformed } from "~/types";

export const useScrollOnPageError = (errors: IError[] | IErrorsTransformed | undefined) => {
  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);
};
