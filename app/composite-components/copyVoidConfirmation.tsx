import { Main, ErrorSummary, SecureForm } from "~/components";
import { useLoaderData, useActionData } from "@remix-run/react";
import { route } from "routes-gen";
import isEmpty from "lodash/isEmpty";
import { displayErrorTransformedMessages } from "~/helpers";
import type { CopyCertificateDocument, IErrorsTransformed, Journey } from "~/types";
import { CopyVoidConfirmationForm } from "./copy-void-confirmation-form";
import { useScrollOnPageLoad } from "~/hooks";

type CopyVoidDocumentProps = {
  journey: Journey;
};

export const CopyVoidDocumentComponent = ({ journey }: CopyVoidDocumentProps) => {
  const { documentNumber, csrf } = useLoaderData();
  const { errors } = useActionData<CopyCertificateDocument>() ?? {};
  const errorsTransformed = errors as IErrorsTransformed;

  useScrollOnPageLoad();

  let backUrl = "";
  switch (journey) {
    case "catchCertificate":
      backUrl = "/create-catch-certificate/:documentNumber/copy-this-catch-certificate";
      break;
    case "processingStatement":
      backUrl = "/create-processing-statement/:documentNumber/copy-this-processing-statement";
      break;
    case "storageNotes":
      backUrl = "/create-storage-document/:documentNumber/copy-this-storage-document";
      break;
  }

  return (
    <Main backUrl={route(backUrl as any, { documentNumber })}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorTransformedMessages(errorsTransformed)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <SecureForm method="post" csrf={csrf}>
            <CopyVoidConfirmationForm errors={errorsTransformed} journey={journey} />
          </SecureForm>
        </div>
      </div>
    </Main>
  );
};
