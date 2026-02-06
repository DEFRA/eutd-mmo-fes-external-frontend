import isEmpty from "lodash/isEmpty";
import { getTransformedError, isValidDate, getErrorMessage } from "~/helpers";
import i18next from "~/i18next.server";
import { type Session, type SessionData } from "react-router";

export const nonJsDateValidation = async (
  request: Request,
  values: Record<string, FormDataEntryValue>,
  selectedDate: string,
  fieldPrefix: string,
  session?: Session<SessionData, SessionData>
) => {
  const day = values[`${fieldPrefix}Day`];
  const month = values[`${fieldPrefix}Month`];
  const year = values[`${fieldPrefix}Year`];
  if (isEmpty(year) || isEmpty(month) || isEmpty(day) || !isValidDate(selectedDate, ["YYYY-M-D", "YYYY-MM-DD"])) {
    const t = await i18next.getFixedT(request, ["uploadFile"]);

    const errors = getTransformedError([
      {
        key: fieldPrefix,
        message: t(getErrorMessage(`error.${fieldPrefix}.date.isoDate`)),
      },
    ]);

    // If session provided, save errors to session and return null
    // Caller will handle redirect
    if (session) {
      session.set("errors", errors);
      session.set("groupedErrorIds", {});
      return null;
    }

    return new Response(
      JSON.stringify({
        values,
        errors,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    return null;
  }
};
