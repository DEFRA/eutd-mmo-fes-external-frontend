import { useLoaderData, useActionData } from "@remix-run/react";
import { Main, BackToProgressLink, ErrorMessage, ErrorSummary, SecureForm } from "~/components";
import { useTranslation } from "react-i18next";
import type { Journey, Vehicle } from "~/types";
import { transportOptions } from "~/helpers/transport";
import { route } from "routes-gen";
import { displayErrorMessages, Page } from "~/helpers";
import isEmpty from "lodash/isEmpty";
import { ButtonGroup } from "./buttonGroup";
import { useScrollOnPageLoad } from "~/hooks";

type loaderDataProps = {
  documentNumber: string;
  vehicle: Vehicle;
  journey: Journey;
  csrf: string;
};

type howDoesTransportTakesPlaceInTheUkFormProps = {
  type: Page.HowDoesTheConsignmentArriveAToTheUk | Page.HowDoesTheExportLeaveTheUk;
  backUrl:
    | "/create-storage-document/:documentNumber/add-storage-facility-approval"
    | "/create-storage-document/:documentNumber/add-product-to-this-consignment"
    | "/create-storage-document/:documentNumber/you-have-added-a-product";
  progressUri: string;
};

export const HowDoesTransportTakesPlaceInTheUkSubComponent = ({
  type,
  errors,
  t,
}: {
  type: howDoesTransportTakesPlaceInTheUkFormProps["type"];
  errors: any;
  t: any;
}) => (
  <>
    <legend className="govuk-fieldset_legend govuk-fieldset__legend--xl">
      <h1 className="govuk-fieldset__heading">
        {t(
          `${type === Page.HowDoesTheExportLeaveTheUk ? "transportSelectionPageTitle" : "arrivalTransportSelectionPageTitle"}`,
          { ns: "transportation" }
        )}
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
  </>
);

export const HowDoesTransportTakesPlaceInTheUkForm = ({
  type,
  backUrl,
  progressUri,
}: howDoesTransportTakesPlaceInTheUkFormProps) => {
  const { documentNumber, vehicle, journey, csrf } = useLoaderData<loaderDataProps>();
  const actionData = useActionData<{ errors: any }>() ?? {};
  const { errors = {} } = actionData;
  const { t } = useTranslation(["common", "transportation", "errorsText"]);

  useScrollOnPageLoad();

  return (
    <Main backUrl={route(backUrl, { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <div className={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : "govuk-form-group"}>
              <fieldset
                className="govuk-fieldset"
                aria-describedby={isEmpty(errors) ? "vehicle-hint" : "vehicle-hint vehicle-error"}
              >
                <HowDoesTransportTakesPlaceInTheUkSubComponent type={type} errors={errors} t={t} />
                {transportOptions.map((transportOption) => (
                  <div key={transportOption.id} className="govuk-radios__item">
                    <input
                      className="govuk-radios__input"
                      id={transportOption.id}
                      name="vehicle"
                      type="radio"
                      value={transportOption.value}
                      defaultChecked={vehicle === transportOption.value}
                    />
                    <label
                      id={`label-${transportOption.id}`}
                      className="govuk-label govuk-radios__label"
                      htmlFor={transportOption.id}
                    >
                      {t(transportOption.label, { ns: "transportation" })}
                    </label>
                    {type === Page.HowDoesTheConsignmentArriveAToTheUk && transportOption.value === "truck" && (
                      <div id="transport-consignment-item-hint" className="govuk-hint govuk-radios__hint">
                        {t("arrivalTransportTruckHint", { ns: "transportation" })}
                      </div>
                    )}
                  </div>
                ))}
              </fieldset>
            </div>
            <ButtonGroup />
            <input type="hidden" name="journey" value={journey} />
          </SecureForm>
          <BackToProgressLink progressUri={progressUri} documentNumber={documentNumber} />
        </div>
      </div>
    </Main>
  );
};
