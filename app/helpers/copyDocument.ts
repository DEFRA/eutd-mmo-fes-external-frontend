import type { CopyCertificateOption, VoidCertificateOption } from "~/types";

export const copyCertificateOptions: CopyCertificateOption[] = [
  {
    label: "ccCopyAllCertificateData",
    value: "copyAllCertificateData",
    name: "copyDocument",
    id: "voidOriginal",
    hint: "ccCopyAllCertificateDataSubtitle1",
  },
  {
    label: "ccCopyAllCertificateDataExceptTheLandings",
    value: "copyExcludeLandings",
    id: "copyExcludeLandings",
    name: "copyDocument",
    hint: "ccCopyAllCertificateDataSubtitle2",
  },
  {
    label: "ccCopyAllCertificateDataAndVoidTheOriginal",
    value: "voidDocumentConfirm",
    id: "voidDocumentConfirm",
    name: "copyDocument",
    hint: "commonCopyThisDocumentVoidDocumentConfirmHint",
  },
];

export const sdCopyCertificateOptions: CopyCertificateOption[] = [
  {
    label: "commonCopyThisProcessingStatementCopyAllCertificateData",
    value: "copyAllCertificateData",
    id: "voidOriginal",
    name: "copyDocument",
    hint: "sdCopyThisStorageDocumentCopyAllCertificateDataHint",
  },
  {
    label: "commonCopyThisDocumentVoidDocumentConfirm",
    value: "voidDocumentConfirm",
    id: "voidDocumentConfirm",
    name: "copyDocument",
    hint: "commonCopyThisDocumentVoidDocumentConfirmHint",
  },
];

export const psSdCopyCertificateOptions: CopyCertificateOption[] = [
  {
    label: "commonCopyThisProcessingStatementCopyAllCertificateData",
    value: "copyAllCertificateData",
    id: "voidOriginal",
    name: "copyDocument",
    hint: "commonCopyThisProcessingStatementCopyAllCertificateDataHint",
  },
  {
    label: "commonCopyThisDocumentVoidDocumentConfirm",
    value: "voidDocumentConfirm",
    id: "voidDocumentConfirm",
    name: "copyDocument",
    hint: "commonCopyThisDocumentVoidDocumentConfirmHint",
  },
];

export const voidCatchCertificateOptions: VoidCertificateOption[] = [
  {
    label: "commonCopyVoidConfirmationDocumentVoidOriginalYes",
    value: "Yes",
    name: "voidOriginal",
    id: "voidCatchCertificateYes",
  },
  {
    label: "commonCopyVoidConfirmationDocumentVoidOriginalNo",
    value: "No",
    name: "voidOriginal",
    id: "voidCatchCertificateNo",
  },
];
