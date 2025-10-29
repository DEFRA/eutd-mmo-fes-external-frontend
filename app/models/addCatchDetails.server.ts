import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  createCSRFToken,
  getBearerTokenForRequest,
  getProcessingStatement,
  instanceOfUnauthorised,
  validateResponseData,
  getCatchDetails,
  getAllSpecies,
  removeCatchDescription,
  updateProcessingStatement,
  validateCSRFToken,
} from "~/.server";
import { getEnv } from "~/env.server";
import { isMissing } from "~/helpers";
import i18next from "~/i18next.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type { ProcessingStatement, IUnauthorised, Catch, Species, ErrorResponse } from "~/types";

const getLoaderData = (
  currentCatchDetails: Catch,
  species: Species[],
  speciesSelected: Catch | undefined,
  catchIndex: number
) => ({
  catchId: currentCatchDetails?._id ?? speciesSelected?._id,
  catchCertificateNumber: currentCatchDetails?.catchCertificateNumber ?? "",
  totalWeightLanded: currentCatchDetails?.totalWeightLanded ?? "",
  exportWeightBeforeProcessing: currentCatchDetails?.exportWeightBeforeProcessing ?? "",
  exportWeightAfterProcessing: currentCatchDetails?.exportWeightAfterProcessing ?? "",
  isEditing:
    currentCatchDetails !== undefined &&
    !isEmpty(currentCatchDetails.catchCertificateNumber) &&
    !isEmpty(currentCatchDetails.exportWeightAfterProcessing) &&
    !isEmpty(currentCatchDetails.exportWeightBeforeProcessing),
  species: Array.isArray(species) ? species : [],
  catchIndex: isNaN(catchIndex) ? 0 : catchIndex,
  speciesSelected: !isEmpty(speciesSelected?.species) ? speciesSelected?.species : "",
  speciesCode: !isEmpty(speciesSelected?.speciesCode) ? speciesSelected?.speciesCode : "",
});

const getCatches: (processingStatment: ProcessingStatement) => Catch[] = (processingStatement: ProcessingStatement) =>
  Array.isArray(processingStatement.catches) ? processingStatement.catches : [];
const getUpdatedCatches: (
  updatedProcessingStatement: ProcessingStatement,
  speciesCode: string | undefined,
  catchCertificateType: string
) => Catch[] = (
  updatedProcessingStatement: ProcessingStatement,
  speciesCode: string | undefined,
  catchCertificateType: string
) =>
  updatedProcessingStatement.catches
    ? updatedProcessingStatement.catches.filter(
        (data: Catch) =>
          data.speciesCode === speciesCode &&
          data.catchCertificateType === catchCertificateType &&
          !isMissing(data.catchCertificateNumber)
      )
    : [];
const getCurrentUrl = (
  documentNumber: string | undefined,
  faoCode: string,
  catchCertificateType: string,
  goToPage: number,
  totalPages: number
) =>
  `/create-processing-statement/${documentNumber}/add-catch-details/${faoCode}?catchType=${catchCertificateType}&pageNo=${goToPage > totalPages ? goToPage - 1 : goToPage}`;
const getProducts = (catches: Catch[], faoCode: string, catchCertificateType: string) =>
  catches?.find(
    (data: Catch) =>
      data.speciesCode === faoCode &&
      data.catchCertificateType === catchCertificateType &&
      "catchCertificateNumber" in data
  );
const validateProducts = (products: Catch | undefined, index: string) => {
  if (products === undefined) {
    return {
      errors: {
        [`catches-${index}-catchCertificateNumber`]: {
          key: `catches-${index}-catchCertificateNumber`,
          message: "psCatchCertificateDescription",
        },
      },
    };
  }

  return {};
};
const getRedirectUrl = (nextUri: string, documentNumber?: string) =>
  isEmpty(nextUri) ? `/create-processing-statement/${documentNumber}/catch-added` : nextUri;

const getGoToPage = (pageNumber: string) => (!isMissing(pageNumber) ? parseInt(pageNumber) : 1);
const getScientificName = (allSpecies: Species[], faoCode: string): string | undefined =>
  Array.isArray(allSpecies) ? allSpecies.find((s: Species) => s.faoCode === faoCode)?.scientificName : undefined;

const addCatchResponseHandler = (errorResponse: Response | ErrorResponse | undefined): Response | ErrorResponse => {
  if (errorResponse) {
    return errorResponse;
  }

  return new Response(
    JSON.stringify({
      response: {
        catchCertificateNumber: "",
        totalWeightLanded: "",
        exportWeightBeforeProcessing: "",
        exportWeightAfterProcessing: "",
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const findIndexByValue = (catches: Catch[], valueToFind: string) =>
  catches.findIndex((ctch: Catch) => ctch._id === valueToFind);

const getIndexBySpeciesForNewRecord = (catches: Catch[], speciesCode: string | undefined) => {
  if (speciesCode === undefined) {
    return -1;
  }

  return catches.findIndex((ctch: Catch) => ctch.speciesCode === speciesCode && isMissing(ctch.catchCertificateNumber));
};

export const AddCatchDetailsLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url); // runs only when NODE_ENV === "test"

  const session = await getSessionFromRequest(request);
  const csrf = createCSRFToken();
  session.set("csrf", csrf);

  const { documentNumber } = params;

  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  const splitParams = params["*"]?.split("/");
  const specieCode = splitParams?.[0] ?? "";
  const catchIndex = parseInt(splitParams?.[1] ?? "");

  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const catchCertificateType = url.searchParams.get("catchType") ?? "";
  const lang = url.searchParams.get("lng");
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  validateResponseData(processingStatement);

  const currentCatchDetails: Catch = getCatchDetails(processingStatement, catchIndex);

  const isForUKCatchCertificate = catchCertificateType === "uk";

  const pageNo: number = parseInt(searchParams.get("pageNo") ?? "1");
  const species = await getAllSpecies();
  const speciesExemptLink = getEnv().SPECIES_EXEMPT_LINK;

  let getCatchesBySpeciesCode: Catch[] = getUpdatedCatches(processingStatement, splitParams?.[0], catchCertificateType);

  const recordsPerPage: number = parseInt(getEnv().PROCESSING_STATEMENT_CATCH_PER_PAGE, 10);
  const totalRecords = getCatchesBySpeciesCode;
  const totalPages = Math.ceil(totalRecords.length / recordsPerPage);

  const isFirstPage = pageNo == 1;
  const isLastPage = pageNo == totalPages;
  const prevLink = isFirstPage ? 1 : pageNo - 1;
  const nextLink = isLastPage ? totalPages : pageNo + 1;

  if (pageNo) {
    getCatchesBySpeciesCode = getCatchesBySpeciesCode.slice(recordsPerPage * (pageNo - 1), recordsPerPage * pageNo);
  }
  const t = await i18next.getFixedT(request, ["psAddCatchDetails", "title"]);
  const speciesSelected: Catch | undefined = processingStatement.catches?.find(
    (data: Catch) => specieCode === data.speciesCode
  );

  return new Response(
    JSON.stringify({
      documentNumber,
      speciesExemptLink,
      catches: getCatchesBySpeciesCode,
      totalRecords: totalRecords.length,
      nextUri,
      lang,
      specieCode,
      prevLink,
      nextLink,
      totalPages,
      isLastPage,
      isFirstPage,
      pageNo,
      catchCertificateType,
      commonTitle: t("psCommonTitle", { ns: "title" }),
      pageTitle: t(isForUKCatchCertificate ? "psAddCatchDetailsHeadingUk" : "psAddCatchDetailsHeading", {
        ns: "psAddCatchDetails",
      }),
      ...getLoaderData(currentCatchDetails, species, speciesSelected, catchIndex),
      csrf,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const AddCatchDetailsAction = async (request: Request, params: Params): Promise<Response | ErrorResponse> => {
  const { documentNumber } = params;
  const splitParams = params["*"]?.split("/");

  const bearerToken = await getBearerTokenForRequest(request);

  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const nextUri = form.get("nextUri") as string;
  const faoCode = values["speciesCode"] as string;
  const goToPage = getGoToPage(values["pageNo"] as string);
  const isDraft = form.get("_action") === "saveAsDraft";
  const addCatch = form.get("_action") === "addCatch";
  const updateCatch = form.get("_action") === "updateCatch";
  const editCatch = (_action as string).includes("editButton");
  const catchCertificateType = values["catchCertificateType"] as string;

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const session = await getSessionFromRequest(request);
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  validateResponseData(processingStatement);

  const catches = getCatches(processingStatement);

  if (editCatch) {
    const splitStr: string[] = (_action as string).split("-");
    const index = findIndexByValue(catches, splitStr[1]);
    const pageNo = parseInt(splitStr[2]);

    return redirect(
      `/create-processing-statement/${documentNumber}/add-catch-details/${faoCode}/${index}?catchType=${catchCertificateType}&pageNo=${pageNo}`
    );
  }

  const removeCatch = (_action as string).includes("removeCatch");
  const cancelCatch = form.get("_action") === "cancelCatch";
  const saveToRedisIfErrors = false;
  const allSpecies: Species[] = await getAllSpecies();

  if (addCatch) {
    const errorResponse = await updateProcessingStatement(
      bearerToken,
      documentNumber,
      {
        ...values,
        scientificName: getScientificName(allSpecies, faoCode),
      },
      `/create-processing-statement/${documentNumber}/add-catch-details/${faoCode}/0`,
      0,
      saveToRedisIfErrors,
      true,
      getIndexBySpeciesForNewRecord(catches, values["speciesCode"] as string) === -1
    );

    return addCatchResponseHandler(errorResponse);
  }

  if (updateCatch) {
    const catchIndex = findIndexByValue(catches, values["catchId"] as string);
    const errorResponse = await updateProcessingStatement(
      bearerToken,
      documentNumber,
      {
        ...values,
        scientificName: getScientificName(allSpecies, faoCode),
      },
      `/create-processing-statement/${documentNumber}/add-catch-details/${splitParams?.[0]}/${catchIndex}`,
      catchIndex,
      saveToRedisIfErrors
    );

    if (errorResponse) {
      return errorResponse;
    }

    let redirectUrl = `/create-processing-statement/${documentNumber}/add-catch-details/${splitParams?.[0]}?catchType=${catchCertificateType}&pageNo=${goToPage}`;

    if (!isEmpty(nextUri)) {
      redirectUrl += `&nextUri=${nextUri}`;
    }

    return redirect(redirectUrl);
  }

  if (removeCatch) {
    const index = (_action as string).split("-")[1];
    const updatedProcessingStatement: ProcessingStatement | IUnauthorised = await removeCatchDescription(
      bearerToken,
      documentNumber,
      findIndexByValue(catches, index),
      `/create-processing-statement/${documentNumber}/add-catch-details/${faoCode}`,
      true
    );

    if (instanceOfUnauthorised(updatedProcessingStatement)) {
      return redirect("/forbidden");
    }

    const recordsPerPage: number = parseInt(getEnv().PROCESSING_STATEMENT_CATCH_PER_PAGE, 10);
    const ctches = getUpdatedCatches(updatedProcessingStatement, splitParams?.[0], catchCertificateType);
    const totalPages = Math.ceil(ctches.length / recordsPerPage);

    const currentUrl = getCurrentUrl(documentNumber, faoCode, catchCertificateType, goToPage, totalPages);
    return redirect(currentUrl);
  }

  if (cancelCatch) {
    return redirect(
      `/create-processing-statement/${documentNumber}/add-catch-details/${splitParams?.[0]}?catchType=${catchCertificateType}&pageNo=${goToPage}`
    );
  }

  if (isDraft) {
    return redirect(route("/create-processing-statement/processing-statements"));
  }

  const findProducts: Catch | undefined = getProducts(catches, faoCode, catchCertificateType);
  const errorData: any = validateProducts(findProducts, values["lastAddedOrdEditedIndex"] as string);

  session.set(
    "backLinkForCatchAdded",
    `/create-processing-statement/${documentNumber}/add-catch-details/${faoCode}/${values["lastAddedOrdEditedIndex"]}?catchType=${catchCertificateType}&pageNo=1`
  );

  if (isEmpty(errorData)) {
    return redirect(getRedirectUrl(nextUri, documentNumber), {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return errorData;
};
