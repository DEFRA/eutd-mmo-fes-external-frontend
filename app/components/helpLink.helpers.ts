const documentNameByType: Record<string, string> = {
  CC: "catchCertificatehelpLink",
  PS: "processingStatementhelpLink",
  SD: "storageNoteshelpLink",
};

export const inferredDocumentName = (documentNumber: string | undefined) =>
  documentNameByType[(documentNumber ?? "").substring(9, 11)] ?? "";
