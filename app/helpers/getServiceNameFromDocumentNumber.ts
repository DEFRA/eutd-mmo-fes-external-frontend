const DOCUMENT_NUMBER_INDICATOR_POSITION = [9, 11];
export const getServiceNameFromDocumentNumber = (documentNumber: string) => {
  if (documentNumber && documentNumber.length > DOCUMENT_NUMBER_INDICATOR_POSITION[1]) {
    switch (documentNumber.substring(DOCUMENT_NUMBER_INDICATOR_POSITION[0], DOCUMENT_NUMBER_INDICATOR_POSITION[1])) {
      case "CC":
        return "CC";
      case "PS":
        return "PS";
      case "SD":
        return "SD";
      default:
        return "UNKNOWN";
    }
  }

  return "UNKNOWN";
};
