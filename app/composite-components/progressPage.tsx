import { route } from "routes-gen";
import { useTranslation } from "react-i18next";
import { Main, Title, ErrorSummary, NotificationBanner, SecureForm } from "~/components";
import { useLoaderData, useActionData, useLocation } from "react-router";
import type {
  IProgress,
  IErrorsTransformed,
  Journey,
  ProgressLoaderProps,
  IStorageDocumentProgressSteps,
  IProcessingStatementProgressSteps,
  ICatchCertificateProgressSteps,
  IProgressDataSection,
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
    catches,
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
  const location = useLocation();
  const url = new URLSearchParams(location.search);
  const backUriFromQuery = url.get("backUri");
  const copiedFromDocumentNumber = copyDocumentNumber || documentNumber;
  const hasCopiedDraftContext = copyDocumentAcknowledged || Boolean(copyDocumentNumber);
  switch (journey) {
    case "catchCertificate":
      backUrl =
        backUriFromQuery ?? route("/create-catch-certificate/:documentNumber/landings-entry", { documentNumber });
      titleTestId = "progress-titling";
      progressHeadingTestId = "Progress-heading";
      break;
    case "processingStatement":
      backUrl =
        backUriFromQuery ??
        (hasCopiedDraftContext
          ? route("/create-processing-statement/:documentNumber/copy-this-processing-statement", {
              documentNumber: copiedFromDocumentNumber,
            })
          : route("/create-processing-statement/processing-statements"));
      notificationDataTestId = "processingStatement-CopyVoid";
      titleTestId = "ps-progress-titling";
      progressHeadingTestId = "ps-progress-heading";
      break;
    case "storageNotes":
      backUrl =
        backUriFromQuery ??
        (hasCopiedDraftContext
          ? route("/create-non-manipulation-document/:documentNumber/copy-this-non-manipulation-document", {
              documentNumber: copiedFromDocumentNumber,
            })
          : route("/create-non-manipulation-document/non-manipulation-documents"));
      notificationDataTestId = "storageDocument-CopyVoid";
      titleTestId = "sd-progress-titling";
      progressHeadingTestId = "sd-progress-heading";
      break;
  }

  const translations: any = {
    catchCertificate: {
      progressApplication: "ccCatchCertificateApplication",
      notificationIsVoided: "ccProgressNotificationMsgIsVoided",
      notificationNotVoided: "ccProgressNotificationMsgIsNotVoided",
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
    if (copyDocumentAcknowledged) {
      let message: string;
      if (voidDocumentConfirm) {
        message = t(translations[journey].notificationIsVoided, { ns: "progress" });
      } else if (journey === "catchCertificate") {
        message = t(translations[journey].notificationNotVoided, { documentNumber: c, ns: "progress" });
      } else {
        message = t(translations[journey].notificationNotVoided, { c, ns: "progress" });
      }
      notificationMsgs.push(message);
    }

    return notificationMsgs.length ? notificationMsgs : [];
  };

  const getProgressData = (): Array<IProgressDataSection> => {
    if (journey === "catchCertificate") {
      return progressTableDataBuilder(
        dataUpload,
        directLanding,
        progress as ICatchCertificateProgressSteps,
        transport,
        errors
      );
    }
    if (journey === "processingStatement") {
      return psProgressTableDataBuilder(progress as IProcessingStatementProgressSteps, errors, products);
    }
    return sdProgressTableDataBuilder(progress as IStorageDocumentProgressSteps, errors, catches);
  };

  const progressData = getProgressData();

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
            className={`govuk-!-margin-top-2 govuk-!-font-size-36${journey === "storageNotes" ? "" : " govuk-!-font-weight-bold"}`}
            data-testid={progressHeadingTestId}
          >
            <span className="govuk-caption-xl">
              {t(translations[journey].progressApplication)}: {documentNumber}
            </span>
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
          <ProgressTable progressData={progressData} documentNumber={documentNumber} />
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
