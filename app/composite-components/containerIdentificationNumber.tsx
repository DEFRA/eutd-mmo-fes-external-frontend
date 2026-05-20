import { Button, BUTTON_TYPE, ErrorPosition } from "@capgeminiuk/dcx-react-library";
import { EmojiBlockingInput as FormInput } from "~/components";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import { getContainerErrorClassName, getContainerInputData, getErrorMessageClassName } from "~/helpers";
import { reindexContainerErrors } from "~/helpers/errorReindexing";
import type { ContainerInput, IErrorsTransformed } from "~/types";
import { v4 as uuidv4 } from "uuid";
import { useIsHydrated } from "~/hooks";
import { useActionData } from "react-router";

const generateId = () => uuidv4();

interface ContainerIdentificationNumberProps {
  containers?: string[];
  maximumContainers: number;
  errors?: IErrorsTransformed;
  displayOptionalSuffix?: boolean;
  vehicleType?: "truck" | "train" | "containerVessel" | "plane";
  labelKey?: string;
  hintKey?: string;
  onErrorsChange?: (updatedErrors: IErrorsTransformed) => void;
}

export const ContainerIdentificationNumber = ({
  containers,
  maximumContainers,
  errors,
  displayOptionalSuffix,
  vehicleType,
  labelKey,
  hintKey,
  onErrorsChange,
}: ContainerIdentificationNumberProps) => {
  const { t } = useTranslation("transportation");
  const actionData = useActionData() ?? {};
  const isHydrated = useIsHydrated();

  const [containerInputs, setContainerInputs] = useState<ContainerInput[]>(
    containers && containers.length > 0
      ? containers.map((c) => ({ id: generateId(), value: c }))
      : [{ id: generateId(), value: "" }]
  );

  const handleAddContainer = () => {
    if (containerInputs.length < maximumContainers) {
      setContainerInputs((prev) => [...prev, { id: generateId(), value: "" }]);
    }
  };

  const handleRemoveContainer = (id: string) => {
    if (containerInputs.length > 1) {
      const index = containerInputs.findIndex((input) => input.id === id);

      setContainerInputs((prev) => prev.filter((input) => input.id !== id));

      if (errors && index >= 0) {
        onErrorsChange?.(reindexContainerErrors(errors, index));
      }
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setContainerInputs((prev) => prev.map((input) => (input.id === id ? { ...input, value } : input)));
  };

  const containerInputData = getContainerInputData(isHydrated, maximumContainers, containerInputs);

  let containerIdentificationLabel = "";
  if (labelKey) {
    containerIdentificationLabel = t(labelKey);
  } else if (vehicleType === "containerVessel") {
    containerIdentificationLabel = displayOptionalSuffix
      ? t("addTransportationArrivalDetailsContainerIdentificationNumberOptional")
      : t("addTransportationArrivalDetailsContainerIdentificationNumberContainerVessel");
  } else if (displayOptionalSuffix) {
    containerIdentificationLabel = t("addTransportationArrivalDetailsContainerIdentificationNumberOptional");
  } else {
    containerIdentificationLabel = t("addTransportationArrivalDetailsContainerIdentificationNumber");
  }

  const getHintText = () => {
    if (hintKey) return t(hintKey);
    if (vehicleType === "truck") return t("addTransportationDetailsContainerIdentificationNumberHintTruck");
    if (vehicleType === "train") return t("addTransportationDetailsContainerIdentificationNumberTrainHint");
    if (vehicleType === "containerVessel")
      return t("addTransportationArrivalDetailsContainerIdentificationNumberHintContainerVessel");
    return t("addTransportationArrivalDetailsContainerIdentificationNumberHint");
  };

  return (
    <div>
      {containerInputData.map((input, index) => {
        const errorKey = `containerNumbers.${index}`;
        const hasError = errors?.[errorKey];

        return (
          <div key={input.id} className="govuk-button-group" style={{ display: "flex", alignItems: "flex-end" }}>
            <FormInput
              containerClassName="govuk-!-width-one-half govuk-!-margin-right-3"
              labelClassName={index === 0 ? "govuk-label govuk-!-font-weight-bold" : "govuk-visually-hidden"}
              label={containerIdentificationLabel}
              hint={
                index === 0
                  ? {
                      id: "hint-containerIdentificationNumber",
                      position: "above",
                      text: getHintText(),
                      className: "govuk-hint govuk-!-margin-bottom-0",
                    }
                  : undefined
              }
              name={`containerNumbers.${index}`}
              type="text"
              inputClassName={classNames("govuk-input", {
                "govuk-input--error": hasError,
              })}
              inputProps={{
                value: (isHydrated ? input.value : actionData[errorKey] ?? input.value) as string,
                id: `containerNumbers.${index}`,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(input.id, e.target.value),
              }}
              errorProps={{
                className: getErrorMessageClassName(!isEmpty(hasError)),
              }}
              staticErrorMessage={
                hasError && errors[errorKey]?.message ? t(errors[errorKey].message, { ns: "errorsText" }) : undefined
              }
              errorPosition={ErrorPosition.AFTER_LABEL}
              containerClassNameError={getContainerErrorClassName(!isEmpty(hasError))}
              hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
              hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
            />
            {isHydrated && containerInputs.length > 1 && (
              <Button
                key={`remove-container-${input.id}`}
                id={`remove-container-button-${index}`}
                data-testid={`remove-container-${index}`}
                label={t("removeContainerButton")}
                className="govuk-button govuk-button--secondary govuk-!-margin-left-2"
                type={BUTTON_TYPE.BUTTON}
                data-module="govuk-button"
                onClick={() => handleRemoveContainer(input.id)}
                style={{ top: "15px" }}
              />
            )}
          </div>
        );
      })}
      {isHydrated && containerInputs.length < maximumContainers && (
        <Button
          id="add-container-button"
          data-testid="add-another-container"
          label={t("addAnotherContainerButton")}
          className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
          type={BUTTON_TYPE.BUTTON}
          data-module="govuk-button"
          onClick={handleAddContainer}
        />
      )}
    </div>
  );
};
