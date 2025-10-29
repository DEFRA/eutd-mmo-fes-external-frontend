import * as React from "react";
import { type MetaFunction, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import type { Vehicle, ErrorResponse, TransportOptionType } from "~/types";
import { route } from "routes-gen";
import { useEffect } from "react";
import { useLoaderData, useActionData } from "@remix-run/react";
import { Main, BackToProgressLink, ErrorMessage, ErrorSummary, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import { transportOptions } from "~/helpers/transport";
import { displayErrorMessages, getMeta, scrollToId } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { ButtonGroup } from "~/composite-components";
import { useScrollOnPageLoad } from "~/hooks";
import { HowDoesTheExportLeaveUkAction, HowDoesTheExportLeaveUkLoader } from "~/models";

type loaderDataProps = {
  documentNumber: string;
  vehicle: Vehicle;
  transportId?: string;
  csrf: string;
};

export const meta: MetaFunction = ({ data }) => getMeta(data);
export const loader: LoaderFunction = async ({ request, params }) => HowDoesTheExportLeaveUkLoader(request, params);

export const action: ActionFunction = async ({ request, params }): Promise<Response | ErrorResponse> =>
  HowDoesTheExportLeaveUkAction(request, params);

const HowDoesTheExportLeaveTheUk = () => {
  const { documentNumber, vehicle, transportId, csrf } = useLoaderData<loaderDataProps>();

  const actionData = useActionData() ?? {};
  const { errors = {} } = actionData;
  const { t } = useTranslation(["common", "transportation", "errorsText"]);
  const actionUrl = transportId
    ? `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk/${transportId}`
    : `/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk`;

  useScrollOnPageLoad();

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  return (
    <Main backUrl={route("/create-catch-certificate/:documentNumber/what-export-journey", { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" action={actionUrl} csrf={csrf}>
            <div className={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
              <fieldset
                className="govuk-fieldset"
                aria-describedby={isEmpty(errors) ? "vehicle-hint" : "vehicle-hint vehicle-error"}
              >
                <legend className="govuk-fieldset__legend govuk-fieldset__legend--xl">
                  <h1 className="govuk-fieldset__heading">
                    {t("transportSelectionPageTitle", { ns: "transportation" })}
                  </h1>
                </legend>
                <div id="vehicle-hint" className="govuk-hint">
                  {t("transportSelectionSelectTypeTransportLabel", { ns: "transportation" })}
                </div>
                {!isEmpty(errors) && (
                  <ErrorMessage
                    id="vehicle-error"
                    text={t(errors.vehicle.message, { ns: "errorsText" })}
                    visuallyHiddenText={t("commonErrorText", { ns: "errorsText" })}
                  />
                )}
                {transportOptions.map((option: TransportOptionType) => (
                  <div key={option.id} className="govuk-radios__item">
                    <input
                      id={option.id}
                      type="radio"
                      name="vehicle"
                      className="govuk-radios__input"
                      value={option.value}
                      defaultChecked={vehicle === option.value}
                    />
                    <label htmlFor={option.id} className="govuk-label govuk-radios__label">
                      {t(option.label, { ns: "transportation" })}
                    </label>
                  </div>
                ))}
              </fieldset>
            </div>
            <ButtonGroup />
            <input type="hidden" name="transportId" value={transportId} />
          </SecureForm>
          <BackToProgressLink
            progressUri={"/create-catch-certificate/:documentNumber/progress"}
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};

export default HowDoesTheExportLeaveTheUk;
