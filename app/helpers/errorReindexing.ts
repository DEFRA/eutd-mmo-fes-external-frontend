import type { IErrorsTransformed } from "~/types";

/**
 * Reindexes error keys for container identification numbers when one is removed
 * Automatically shifts down any errors with higher indices
 */
export const reindexContainerErrors = (currentErrors: IErrorsTransformed, removedIndex: number): IErrorsTransformed => {
  const updatedErrors: IErrorsTransformed = {};

  Object.entries(currentErrors).forEach(([key, value]) => {
    const containerMatch = key.match(/^containerNumbers\.(\d+)$/);

    if (!containerMatch) {
      updatedErrors[key] = value;
      return;
    }

    const currentIndex = Number(containerMatch[1]);
    if (currentIndex === removedIndex) {
      return;
    }

    const nextKey = currentIndex > removedIndex ? `containerNumbers.${currentIndex - 1}` : key;
    updatedErrors[nextKey] = value;
  });

  return updatedErrors;
};

/**
 * Reindexes error keys for supporting documents when one is removed
 * Automatically shifts down any errors with higher indices
 */
export const reindexDocumentErrors = (
  currentErrors: IErrorsTransformed,
  removedIndex: number,
  documentKeyPrefix: string
): IErrorsTransformed => {
  const updatedErrors: IErrorsTransformed = {};

  Object.entries(currentErrors).forEach(([key, value]) => {
    const docMatch = key.match(new RegExp(`^${documentKeyPrefix}-(\\d+)$`));

    if (!docMatch) {
      updatedErrors[key] = value;
      return;
    }

    const currentIndex = Number(docMatch[1]);
    if (currentIndex === removedIndex) {
      return;
    }

    const nextKey = currentIndex > removedIndex ? `${documentKeyPrefix}-${currentIndex - 1}` : key;
    updatedErrors[nextKey] = value;
  });
  return updatedErrors;
};
