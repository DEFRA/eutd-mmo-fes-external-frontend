import { FormInput, Button, BUTTON_TYPE, ErrorPosition } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import classNames from "classnames";
import isEmpty from "lodash/isEmpty";
import { getContainerErrorClassName, getContainerInputData, getErrorMessageClassName } from "~/helpers";
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
}

export const ContainerIdentificationNumber = ({
  containers,
  maximumContainers,
  errors,
  displayOptionalSuffix,
  vehicleType,
  labelKey,
  hintKey,
}: ContainerIdentificationNumberProps) => {
  const { t } = useTranslation("transportation");
  const actionData = useActionData() ?? {};
  const isHydrated = useIsHydrated();

  const [containerInputs, setContainerInputs] = useState<ContainerInput[]>(
    containers && containers.length > 0
      ? containers.map((c) => ({ id: generateId(), value: c }))
      : [{ id: generateId(), value: "" }]
  );

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const TRAIN_REGEX = /^[A-Z]{4}\d{7}$/i;
  const TRUCK_REGEX = /^[A-Z]{3}[UJZR]\d{7}$/i;

  const validateContainerValue = (id: string, value: string) => {
    const trimmed = value?.trim() ?? "";
    if (trimmed.length === 0) {
      // clear any existing client-side error for this id
      setClientErrors((prev) => {
        if (!prev[id]) return prev;
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      return true;
    }

    if (vehicleType === "train") {
      if (!TRAIN_REGEX.test(trimmed)) {
        setClientErrors((prev) => ({ ...prev, [id]: "ccContainerIdentificationNumberInvalidFormat" }));
        return false;
      }
    }

    if (vehicleType === "truck") {
      if (!TRUCK_REGEX.test(trimmed)) {
        setClientErrors((prev) => ({ ...prev, [id]: "ccShippingContainerInvalidFormat" }));
        return false;
      }
    }

    // clear any existing client-side error for this id
    setClientErrors((prev) => {
      if (!prev[id]) return prev;
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    return true;
  };

  const handleAddContainer = () => {
    if (containerInputs.length < maximumContainers) {
      setContainerInputs((prev) => [...prev, { id: generateId(), value: "" }]);
    }
  };

  const handleRemoveContainer = (id: string) => {
    if (containerInputs.length > 1) {
      setContainerInputs((prev) => prev.filter((input) => input.id !== id));
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
      {containerInputData.map((input, index) => (
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
              "govuk-input--error": errors?.[`containerNumbers.${index}`],
            })}
            inputProps={{
              value: (isHydrated ? input.value : actionData[`containerNumbers.${index}`] ?? input.value) as string,
              id: `containerNumbers.${index}`,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(input.id, e.target.value),
              onBlur: (e: React.FocusEvent<HTMLInputElement>) =>
                validateContainerValue(input.id, e.target.value as string),
            }}
            errorProps={{
              className: getErrorMessageClassName(!isEmpty(errors?.[`containerNumbers.${index}`])),
            }}
            staticErrorMessage={
              clientErrors[input.id]
                ? t(clientErrors[input.id], { ns: "errorsText" })
                : errors?.[`containerNumbers.${index}`]?.message
                  ? t(errors[`containerNumbers.${index}`].message, { ns: "errorsText" })
                  : undefined
            }
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={getContainerErrorClassName(!isEmpty(errors?.[`containerNumbers.${index}`]))}
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
      ))}
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
