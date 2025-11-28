import { route } from "routes-gen";
import { useTranslation } from "react-i18next";
import { Main, Title, ErrorSummary, NotificationBanner, SecureForm } from "~/components";
import { useLoaderData, useActionData } from "@remix-run/react";
import type {
  IProgress,
  IErrorsTransformed,
  Journey,
  ProgressLoaderProps,
  IStorageDocumentProgressSteps,
  IProcessingStatementProgressSteps,
  ICatchCertificateProgressSteps,
} from "~/types";
import { useEffect } from "react";
import { ProgressTable } from "./progressTable";
import { Button, BUTTON_TYPE } from "@capgeminiuk/dcx-react-library";
import {
  displayErrorMessages,
  scrollToId,
  psProgressTableDataBuilder,
  sdProgressTableDataBuilder,
  progressTableDataBuilder,
} from "~/helpers";
import { useScrollOnPageLoad } from "~/hooks";
import isEmpty from "lodash/isEmpty";
type ProgressPageType = {
  journey: Journey;
};

export const ProgressPageComponent = ({ journey }: ProgressPageType) => {
  const {
    documentNumber,
    progress,
    requiredSections,
    completedSections,
    voidDocumentConfirm,
    copyDocumentAcknowledged,
    copyDocumentNumber,
    landingsEntryOption,
    csrf,
    transport,
    products,
  } = useLoaderData<ProgressLoaderProps>();

  const { t } = useTranslation(["progress", "common"]);
  const data = useActionData<IProgress>();
  const dataUpload = landingsEntryOption === "uploadEntry";
  const directLanding = landingsEntryOption === "directLanding";
  const errors = data?.errors as IErrorsTransformed;

  useEffect(() => {
    if (!isEmpty(errors)) {
      scrollToId("errorIsland");
    }
  }, [errors]);

  let backUrl = "";
  let notificationDataTestId = "";
  let titleTestId = "";
  let progressHeadingTestId = "";
  switch (journey) {
    case "catchCertificate":
      backUrl = route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber });
      titleTestId = "progress-titling";
      progressHeadingTestId = "Progress-heading";
      break;
    case "processingStatement":
      backUrl = route("/create-processing-statement/processing-statements");
      notificationDataTestId = "processingStatement-CopyVoid";
      titleTestId = "ps-progress-titling";
      progressHeadingTestId = "ps-progress-heading";
      break;
    case "storageNotes":
      backUrl = route("/create-storage-document/storage-documents");
      notificationDataTestId = "storageDocument-CopyVoid";
      titleTestId = "sd-progress-titling";
      progressHeadingTestId = "sd-progress-heading";
      break;
  }

  const translations: any = {
    catchCertificate: {
      progressApplication: "ccCatchCertificateApplication",
    },
    processingStatement: {
      notificationIsVoided: "psProgressNotificationMsgIsVoided",
      notificationNotVoided: "commonProgressNotificationMsgIsNotVoided",
      progressApplication: "psProgressApplication",
    },
    storageNotes: {
      notificationIsVoided: "sdProgressNotificationMsgIsVoided",
      notificationNotVoided: "sdProgressNotificationMsgIsNotVoided",
      progressApplication: "storageNotesApplication",
    },
  };

  const getNotificationMsg = (c: string) => {
    const notificationMsgs: string[] = [];
    if (copyDocumentAcknowledged)
      notificationMsgs.push(
        voidDocumentConfirm
          ? t(translations[journey].notificationIsVoided, { ns: "progress" })
          : t(translations[journey].notificationNotVoided, { c, ns: "progress" })
      );

    return notificationMsgs.length ? notificationMsgs : [];
  };

  const selectProgressTable = () => {
    if (journey === "catchCertificate") {
      return (
        <ProgressTable
          progressData={progressTableDataBuilder(
            dataUpload,
            directLanding,
            progress as ICatchCertificateProgressSteps,
            transport,
            errors
          )}
          documentNumber={documentNumber}
        />
      );
    } else if (journey === "processingStatement") {
      return (
        <ProgressTable
          progressData={psProgressTableDataBuilder(progress as IProcessingStatementProgressSteps, errors, products)}
          documentNumber={documentNumber}
        />
      );
    } else if (journey === "storageNotes") {
      return (
        <ProgressTable
          progressData={sdProgressTableDataBuilder(progress as IStorageDocumentProgressSteps, errors)}
          documentNumber={documentNumber}
        />
      );
    }
  };

  useScrollOnPageLoad();
  return (
    <Main backUrl={backUrl}>
      {copyDocumentAcknowledged && (
        <NotificationBanner
          header={t("commonImportant", { ns: "common" })}
          messages={getNotificationMsg(copyDocumentNumber)}
          dataTestId={voidDocumentConfirm ? notificationDataTestId : ""}
        />
      )}
      {!isEmpty(data?.errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <Title className="govuk-!-margin-bottom-0" dataTestId={titleTestId} title={t("progressTitleText")} />
          <p
            className="govuk-!-margin-top-0 govuk-!-font-weight-bold govuk-!-font-size-36"
            data-testid={progressHeadingTestId}
          >
            {t(translations[journey].progressApplication)}: {documentNumber}
          </p>
          <div>
            <p className="govuk-!-font-weight-bold govuk-!-font-size-36" data-testid="Progress-completed-heading">
              {completedSections === requiredSections
                ? t("commonProgressPageApplicationComplete")
                : t("commonProgressPageApplicationIncomplete")}
            </p>
            <p data-testid="completedSections">
              {t("commonProgressPageCompletedSectionContent", {
                completedSections,
                requiredSections,
              })}
            </p>
          </div>
          {selectProgressTable()}
        </div>
      </div>
      <SecureForm method="post" csrf={csrf}>
        <div className="govuk-button-group">
          <Button
            className="govuk-button govuk-button--secondary"
            label={t("commonProgressReturnToDashboard")}
            type={BUTTON_TYPE.SUBMIT}
            data-module="govuk-button"
            name="_action"
            //@ts-ignore
            value="returnToDashboard"
            data-testid="return-to-dashboard-button"
          />
          <Button
            className="govuk-button"
            label={t("commonProgressPageContinueButtonLabel")}
            type={BUTTON_TYPE.SUBMIT}
            data-module="govuk-button"
            name="_action"
            //@ts-ignore
            value="continue"
            data-testid="continue-button"
          />
        </div>
      </SecureForm>
    </Main>
  );
};
