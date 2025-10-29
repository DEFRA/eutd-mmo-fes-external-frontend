import isEmpty from "lodash/isEmpty";
import { getTransformedError, isValidDate, getErrorMessage } from "~/helpers";
import i18next from "~/i18next.server";

export const nonJsDateValidation = async (
  request: Request,
  values: Record<string, FormDataEntryValue>,
  selectedDate: string,
  fieldPrefix: string
) => {
  const day = values[`${fieldPrefix}Day`];
  const month = values[`${fieldPrefix}Month`];
  const year = values[`${fieldPrefix}Year`];

  if (isEmpty(year) || isEmpty(month) || isEmpty(day)) {
    const t = await i18next.getFixedT(request, ["uploadFile"]);

    return new Response(
      JSON.stringify({
        values,
        errors: getTransformedError([
          {
            key: fieldPrefix,
            message: t(getErrorMessage(`error.${fieldPrefix}.date.missing`)),
          },
        ]),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else if (!isValidDate(selectedDate, ["YYYY-M-D", "YYYY-MM-DD"])) {
    const t = await i18next.getFixedT(request, ["uploadFile"]);

    return new Response(
      JSON.stringify({
        values,
        errors: getTransformedError([
          {
            key: fieldPrefix,
            message: t(getErrorMessage(`error.${fieldPrefix}.date.isoDate`)),
          },
        ]),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } else {
    return null;
  }
};
