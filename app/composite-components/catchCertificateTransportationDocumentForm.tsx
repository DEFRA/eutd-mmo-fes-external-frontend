import { Button, BUTTON_TYPE, ErrorPosition, FormInput } from "@capgeminiuk/dcx-react-library";
import classNames from "classnames/bind";
import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";
import { useTranslation } from "react-i18next";
import type { AdditionalDocumentForm, IErrorsTransformed } from "~/types";

export const CatchCertificateTransportationDocumentForm = ({
  documentId,
  documentName,
  documentReference,
  index,
  errors,
  transportType,
  showRemoveButton,
  displayOptionalSuffix,
}: AdditionalDocumentForm & {
  errors: IErrorsTransformed;
  showRemoveButton: boolean;
  displayOptionalSuffix: boolean;
}) => {
  const { t } = useTranslation("transportation");
  const isDocumentNameHasError = !isEmpty(errors[`documents.${index}.name`]);
  const isDocumentReferenceHasError = !isEmpty(errors[`documents.${index}.reference`]);
  const translationsKey = startCase(transportType).replaceAll(" ", "");

  return (
    <fieldset className="govuk-fieldset" id="documents">
      <input type="hidden" name={`documentId${index + 1}`} id={`documents.${index}.id`} value={documentId ?? ""} />
      <FormInput
        containerClassName="govuk-form-group govuk-!-width-one-half"
        label={
          displayOptionalSuffix
            ? t(`addAdditionalTransportDocuments${translationsKey}DocumentNameOptional`)
            : t(`addAdditionalTransportDocuments${translationsKey}DocumentName`)
        }
        name={`documentName${Number(index) + 1}`}
        type="text"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": isDocumentNameHasError,
        })}
        inputProps={{
          defaultValue: documentName ?? "",
          id: `documents.${index}.name`,
          "aria-describedby": `hint-${transportType}DocumentName${index}`,
        }}
        hint={{
          id: `hint-${transportType}DocumentName${index}`,
          position: "above",
          text: t(`addAdditionalTransportDocuments${translationsKey}DocumentNameHint`),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
        errorProps={{ className: isDocumentNameHasError ? "govuk-error-message" : "" }}
        staticErrorMessage={t(errors[`documents.${index}.name`]?.message, { ns: "errorsText" })}
        errorPosition={ErrorPosition.AFTER_LABEL}
        containerClassNameError={isDocumentNameHasError ? "govuk-form-group--error" : ""}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
      />
      <FormInput
        containerClassName="govuk-form-group govuk-!-width-one-half"
        label={
          displayOptionalSuffix
            ? t(`addAdditionalTransportDocuments${translationsKey}DocumentReferenceOptional`)
            : t(`addAdditionalTransportDocuments${translationsKey}DocumentReference`)
        }
        name={`documentReference${Number(index) + 1}`}
        type="text"
        inputClassName={classNames("govuk-input", {
          "govuk-input--error": isDocumentReferenceHasError,
        })}
        inputProps={{
          defaultValue: documentReference ?? "",
          id: `documents.${index}.reference`,
          "aria-describedby": `hint-${transportType}DocumentReference${index}`,
        }}
        hint={{
          id: `hint-${transportType}DocumentReference${index}`,
          position: "above",
          text: t(`addAdditionalTransportDocuments${translationsKey}DocumentReferenceHint`),
          className: "govuk-hint govuk-!-margin-bottom-0",
        }}
        errorProps={{ className: isDocumentReferenceHasError ? "govuk-error-message" : "" }}
        staticErrorMessage={t(errors[`documents.${index}.reference`]?.message, { ns: "errorsText" })}
        errorPosition={ErrorPosition.AFTER_LABEL}
        containerClassNameError={isDocumentReferenceHasError ? "govuk-form-group--error" : ""}
        hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
        hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
      />
      {showRemoveButton && (
        <Button
          id="removeCurrentDocument"
          label={t("addAdditionalTransportDocumentsRemoveButton", { ns: "transportation" })}
          className="govuk-button govuk-button--secondary"
          type={BUTTON_TYPE.SUBMIT}
          data-module="govuk-button"
          // @ts-ignore
          value={`removeCurrentDocument-${index}`}
          name="_action"
          data-testid="remove-current-document-button"
        />
      )}
    </fieldset>
  );
};
