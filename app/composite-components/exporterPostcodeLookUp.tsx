import { useTranslation } from "react-i18next";
import { FormInput, Button, BUTTON_TYPE, ErrorPosition } from "@capgeminiuk/dcx-react-library";
import isEmpty from "lodash/isEmpty";
import type { IErrorsTransformed } from "~/types";
import classNames from "classnames/bind";
import { SecureForm } from "~/components";

type ExporterPostcodeLookUpProps = {
  errors: IErrorsTransformed;
  postcode: string;
  actionUri?: string;
  csrf: string;
  postcodeHintText?: string;
};

export const ExporterPostcodeLookUp = ({
  errors,
  postcode,
  actionUri,
  csrf,
  postcodeHintText,
}: ExporterPostcodeLookUpProps) => {
  const { t } = useTranslation("common");
  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <SecureForm method="post" action={actionUri} csrf={csrf}>
          <FormInput
            label={t("commonWhatExportersAddressEnterPostCode")}
            containerClassName="govuk-form-group"
            inputClassName={classNames("govuk-input govuk-!-width-three-quarters", {
              "govuk-input--error": errors?.postcode,
            })}
            type="text"
            name="postcode"
            inputProps={{
              defaultValue: postcode,
              id: "postcode",
              "aria-describedby": "hint-postcode",
            }}
            hint={{
              id: "hint-postcode",
              position: "above",
              text: postcodeHintText ?? `${t("commonWhatExportersAddressEnterPostCodeHelpText")}`,
              className: "govuk-hint govuk-!-margin-bottom-0",
            }}
            errorProps={{ className: !isEmpty(errors) ? "govuk-error-message" : "" }}
            staticErrorMessage={t(errors?.postcode?.message, { ns: "errorsText" })}
            errorPosition={ErrorPosition.AFTER_LABEL}
            containerClassNameError={!isEmpty(errors) ? "govuk-form-group--error" : ""}
            hiddenErrorText={t("commonErrorText", { ns: "errorsText" })}
            hiddenErrorTextProps={{ className: "govuk-visually-hidden" }}
          />
          <br />
          <div className="govuk-button-group">
            <Button
              type={BUTTON_TYPE.SUBMIT}
              name="_action"
              data-module="govuk-button"
              id="findaddress"
              //@ts-ignore
              value="findaddress"
              label={t("commonWhatExportersAddressFindAddress")}
              className="govuk-button"
              data-testid="findaddress"
            />
            <Button
              type={BUTTON_TYPE.SUBMIT}
              name="_action"
              label={t("commonSecondaryCancelButton")}
              //@ts-ignore
              value="cancel"
              className="govuk-button govuk-button--secondary"
              data-testid="cancel"
            />
          </div>
          <Button
            id="enter-address-manually-link"
            type={BUTTON_TYPE.SUBMIT}
            name="_action"
            label={t("commonWhatExportersAddressEnterAddressManuallyLink")}
            //@ts-ignore
            value="navigateToManualAddress"
            className="govuk-button govuk-button--secondary"
          />
        </SecureForm>
      </div>
    </div>
  );
};
