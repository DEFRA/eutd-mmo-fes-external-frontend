import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";
import { BackToProgressLink, ErrorSummary, Main, SecureForm } from "~/components";
import { ButtonGroup } from "./buttonGroup";
import { displayErrorMessages, scrollToId, type TransportType } from "~/helpers";
import type { AdditionalDocumentsData, IError, IErrorsTransformed } from "~/types";
import { CatchCertificateTransportationDocumentForm } from "./catchCertificateTransportationDocumentForm";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useScrollOnPageLoad } from "~/hooks";

type AddAdditionalTransportDocumentsProps = {
  documentNumber: string;
  documents?: AdditionalDocumentsData[];
  actionUrl: string;
  backUrl: string;
  nextUri?: string;
  errors: IErrorsTransformed | (IError[] & IErrorsTransformed);
  transportType: TransportType;
  displayOptionalSuffix: boolean;
  csrf: string;
  maximumTransportDocumentPerTransport: number;
};

export const AddAdditionalTransportDocuments = ({
  actionUrl,
  documentNumber,
  errors,
  backUrl,
  nextUri,
  documents,
  transportType,
  displayOptionalSuffix,
  csrf,
  maximumTransportDocumentPerTransport,
}: AddAdditionalTransportDocumentsProps) => {
  const { t } = useTranslation("common");
  const translationsKey = startCase(transportType).replaceAll(" ", "");

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  useScrollOnPageLoad();

  const isAlreadyHaveDocuments = Array.isArray(documents) && documents.length > 0;
  const displayAddAnotherDocumentButton =
    (Array.isArray(documents) && documents.length < maximumTransportDocumentPerTransport) || !documents;

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf} action={actionUrl}>
            <fieldset className="govuk-fieldset">
              <legend className="govuk-fieldset_legend govuk-fieldset__legend--xl">
                <h1 className="govuk-fieldset__heading">
                  {t(`addAdditionalTransportDocuments${translationsKey}Title`, { ns: "transportation" })}
                </h1>
              </legend>
              <div id="document-hint" className="govuk-hint">
                {t("addAdditionalTransportDocumentsTitleHint", { ns: "transportation" })}
              </div>
              {isAlreadyHaveDocuments ? (
                documents.map((data: AdditionalDocumentsData, index: number) => (
                  <CatchCertificateTransportationDocumentForm
                    key={data.id}
                    errors={errors}
                    transportType={transportType}
                    documentId={data.id}
                    documentName={data.name}
                    documentReference={data.reference}
                    index={index}
                    showRemoveButton={documents.length > 1}
                    displayOptionalSuffix={displayOptionalSuffix}
                  />
                ))
              ) : (
                <CatchCertificateTransportationDocumentForm
                  errors={errors}
                  transportType={transportType}
                  index={0}
                  showRemoveButton={false}
                  displayOptionalSuffix={displayOptionalSuffix}
                />
              )}
              {displayAddAnotherDocumentButton && (
                <Button
                  id="addAnotherDocument"
                  label={t("addAdditionalTransportDocumentsAddButton", { ns: "transportation" })}
                  className="govuk-button govuk-button--secondary"
                  type={BUTTON_TYPE.SUBMIT}
                  data-module="govuk-button"
                  name="_action"
                  // @ts-ignore
                  value="addAnotherDocument"
                  data-testid="add-another-document-button"
                />
              )}
              <ButtonGroup />
              <input type="hidden" name="nextUri" value={nextUri} />
              <input type="hidden" name="totalDocumentCount" value={isAlreadyHaveDocuments ? documents.length : 1} />
            </fieldset>
          </SecureForm>
          <BackToProgressLink
            progressUri="/create-catch-certificate/:documentNumber/progress"
            documentNumber={documentNumber}
          />
        </div>
      </div>
    </Main>
  );
};
