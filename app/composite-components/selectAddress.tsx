import { FormSelect, Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import type { IErrorsTransformed, ILookUpAddressDetails } from "~/types";
import isEmpty from "lodash/isEmpty";
import { SecureForm } from "~/components";

type SelectAddressProps = {
  postcode: string;
  postcodeaddresses: ILookUpAddressDetails[];
  errors: IErrorsTransformed;
  csrf: string;
  actionUri?: string;
};

export const SelectAddress = ({ postcode, postcodeaddresses, errors, actionUri, csrf }: SelectAddressProps) => {
  const { t } = useTranslation("common");
  const options = postcodeaddresses?.map((addr: ILookUpAddressDetails) => addr.address_line ?? "");

  const getPostCodeAddressMessage = (length: number) =>
    length > 1
      ? t("commonWhatExportersAddressMultipleAddressesFound")
      : t("commonWhatExportersAddressSingleAddressFound");
  const nullOption = postcodeaddresses?.length
    ? `${postcodeaddresses.length} ${getPostCodeAddressMessage(postcodeaddresses.length)}`
    : t("commonWhatExportersAddressNoAddressesFound");

  return (
    <div>
      <SecureForm method="post" action={actionUri} csrf={csrf}>
        <div className="govuk-grid-column">
          <h4 className="govuk-!-margin-bottom-2">{t("commonWhatExportersAddressPostcode")}</h4>
          {postcode}
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-full">
              <Button
                type={BUTTON_TYPE.SUBMIT}
                name="_action"
                label={t("commonWhatExportersAddressChangeLink")}
                value="changelink"
                className="govuk-button govuk-button--secondary govuk-!-margin-top-2"
                data-testid="change-postcode"
              />
              <div className="govuk-form-group">
                <FormSelect
                  label={t("commonWhatExportersAddressSelectAddress")}
                  id="selectAddress"
                  nullOption={nullOption}
                  options={options}
                  name="selectaddress"
                  labelClassName="govuk-label"
                  selectClassName={`govuk-select govuk-grid-column-full`}
                  error={{
                    text: t(errors?.addressError?.message, { ns: "errorsText" }) || "",
                    className: "govuk-error-message",
                  }}
                  containerClassName={!isEmpty(errors) ? "govuk-form-group govuk-form-group--error" : ""}
                />
              </div>
              <div className="govuk-button-group">
                <Button
                  id="cancel"
                  type={BUTTON_TYPE.SUBMIT}
                  name="_action"
                  label={t("commonSecondaryCancelButton")}
                  //@ts-ignore
                  value="cancel"
                  className="govuk-button govuk-button--secondary"
                  data-testid="cancel"
                />
                <Button
                  id="getaddress"
                  type={BUTTON_TYPE.SUBMIT}
                  name="_action"
                  data-module="govuk-button"
                  //@ts-ignore
                  value="getaddress"
                  label={t("commonContinueButtonContinueButtonText")}
                  className="govuk-button"
                  data-testid="getaddress"
                />
              </div>
              <div className="govuk-button-group">
                <Button
                  id="enter-address-manually-link"
                  type={BUTTON_TYPE.SUBMIT}
                  name="_action"
                  label={t("commonWhatExportersAddressNotFoundText")}
                  //@ts-ignore
                  value="navigateToManualAddress"
                  className="govuk-button govuk-button--secondary"
                  data-testid="manualAddress"
                />
              </div>
            </div>
          </div>
        </div>
        <input type="hidden" defaultValue={postcode} name="postcode" />
      </SecureForm>
    </div>
  );
};
