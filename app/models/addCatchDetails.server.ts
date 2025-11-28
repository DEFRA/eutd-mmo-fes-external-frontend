import { redirect } from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import moment from "moment";
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
  getProductDescription,
  getCountries,
} from "~/.server";
import { getEnv } from "~/env.server";
import { countUniqueDocumentByCatchCertificateNumber, countUniqueSpeciesByCode, isMissing } from "~/helpers";
import i18next from "~/i18next.server";
import { getSessionFromRequest, commitSession } from "~/sessions.server";
import type {
  ProcessingStatement,
  IUnauthorised,
  Catch,
  Species,
  ErrorResponse,
  CertificateType,
  ICountry,
} from "~/types";

const getCatchCertificateWeight = (catchItem: Catch | undefined) => {
  if (!catchItem) {
    return "";
  }

  if (catchItem.catchCertificateType === "uk") {
    return catchItem.totalWeightLanded ?? "";
  } else {
    return catchItem.catchCertificateWeight ?? catchItem.totalWeightLanded ?? "";
  }
};

const getLoaderData = (
  currentCatchDetails: Catch | undefined,
  species: Species[],
  catchIndex: number,
  retainedSpecies?: string
) => ({
  catchId: currentCatchDetails?._id,
  catchCertificateNumber: currentCatchDetails?.catchCertificateNumber ?? "",
  catchCertificateType: currentCatchDetails?.catchCertificateType ?? "",
  issuingCountry: currentCatchDetails?.issuingCountry?.officialCountryName ?? "",
  totalWeightLanded: currentCatchDetails?.totalWeightLanded ?? "",
  catchCertificateWeight: getCatchCertificateWeight(currentCatchDetails),
  exportWeightBeforeProcessing: currentCatchDetails?.exportWeightBeforeProcessing ?? "",
  exportWeightAfterProcessing: currentCatchDetails?.exportWeightAfterProcessing ?? "",
  isEditing:
    currentCatchDetails !== undefined &&
    !isEmpty(currentCatchDetails.catchCertificateNumber) &&
    !isEmpty(currentCatchDetails.exportWeightAfterProcessing) &&
    !isEmpty(currentCatchDetails.exportWeightBeforeProcessing),
  species: Array.isArray(species) ? species : [],
  catchIndex: isNaN(catchIndex) ? 0 : catchIndex,
  speciesSelected: !isEmpty(currentCatchDetails?.species) ? currentCatchDetails?.species : retainedSpecies ?? "",
  speciesCode: !isEmpty(currentCatchDetails?.speciesCode) ? currentCatchDetails?.speciesCode : "",
});

const getCatches: (processingStatment: ProcessingStatement) => Catch[] = (processingStatement: ProcessingStatement) =>
  Array.isArray(processingStatement.catches) ? processingStatement.catches : [];
const getUpdatedCatches: (updatedProcessingStatement: ProcessingStatement, productId: string) => Catch[] = (
  updatedProcessingStatement: ProcessingStatement,
  productId: string | undefined
) =>
  updatedProcessingStatement.catches
    ? updatedProcessingStatement.catches.filter((data: Catch) => data.productId === productId)
    : [];
const getCurrentUrl = (documentNumber: string | undefined, productId: string, goToPage: number, totalPages: number) =>
  `/create-processing-statement/${documentNumber}/add-catch-details/${productId}?pageNo=${goToPage > totalPages ? goToPage - 1 : goToPage}`;

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

const getFaoCodeFromSelectedSpecies = (allSpecies: Species[], selectedSpeciesName: string): string => {
  if (!selectedSpeciesName || !Array.isArray(allSpecies)) return "";

  const foundSpecies = allSpecies.find(
    (species) =>
      `${species.faoName} (${species.faoCode})` === selectedSpeciesName || species.faoName === selectedSpeciesName
  );

  return foundSpecies?.faoCode ?? "";
};

export const AddCatchDetailsLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url); // runs only when NODE_ENV === "test"

  const session = await getSessionFromRequest(request);
  const csrf = await createCSRFToken(request);
  session.set("csrf", csrf);

  const { documentNumber } = params;
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  const splitParams = params["*"]?.split("/");
  const productId = splitParams?.[0] ?? "";
  const catchIndex = parseInt(splitParams?.[1] ?? "");
  const bearerToken = await getBearerTokenForRequest(request);
  const url = new URL(request.url);
  const nextUri = url.searchParams.get("nextUri") ?? "";
  const lang = url.searchParams.get("lng");
  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/forbidden");
  }

  validateResponseData(processingStatement);

  const currentCatchDetails: Catch | undefined = getCatchDetails(processingStatement, catchIndex);

  const pageNo: number = parseInt(searchParams.get("pageNo") ?? "1");
  const species = await getAllSpecies();
  const countries = (await getCountries()).filter(
    (c: ICountry) => !c.officialCountryName.includes("United Kingdom of Great Britain and Northern Ireland")
  );
  const speciesExemptLink = getEnv().SPECIES_EXEMPT_LINK;

  const retainedSpecies = session.get("retainedSpecies") as string;

  if (retainedSpecies && !currentCatchDetails) {
    session.unset("retainedSpecies");
  }

  const allCatches = processingStatement.catches ?? [];

  let getCatchesByProductId: Catch[] = getUpdatedCatches(processingStatement, productId);

  const recordsPerPage: number = parseInt(getEnv().PROCESSING_STATEMENT_CATCH_PER_PAGE, 10);
  const totalRecords = getCatchesByProductId;
  const totalPages = Math.ceil(totalRecords.length / recordsPerPage);

  const isFirstPage = pageNo == 1;
  const isLastPage = pageNo == totalPages;
  const prevLink = isFirstPage ? 1 : pageNo - 1;
  const nextLink = isLastPage ? totalPages : pageNo + 1;

  if (pageNo) {
    getCatchesByProductId = getCatchesByProductId.slice(recordsPerPage * (pageNo - 1), recordsPerPage * pageNo);
  }
  const t = await i18next.getFixedT(request, ["psAddCatchDetails", "title"]);
  const { currentProductDescription } = getProductDescription(processingStatement?.products, productId);
  const productIdListedCatches = allCatches.filter((ctch: Catch) => ctch.productId === productId);

  return new Response(
    JSON.stringify({
      documentNumber,
      speciesExemptLink,
      catches: productIdListedCatches,
      currentPageCatches: getCatchesByProductId,
      nextUri,
      lang,
      productId,
      prevLink,
      nextLink,
      totalPages,
      isLastPage,
      isFirstPage,
      pageNo,
      currentProductDescription: currentProductDescription?.description,
      currentProductCommodityCode: currentProductDescription?.commodityCode,
      commonTitle: t("psCommonTitle", { ns: "title" }),
      pageTitle: t("psAddCatchDetailsHeading", { ns: "psAddCatchDetails" }),
      countries,
      ...getLoaderData(currentCatchDetails, species, catchIndex, retainedSpecies),
      csrf,
      speciesCountByCode: countUniqueSpeciesByCode(productIdListedCatches),
      documentCountByCertificateNumber: countUniqueDocumentByCatchCertificateNumber(productIdListedCatches),
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
  let productId = splitParams?.[0] ?? "";

  const bearerToken = await getBearerTokenForRequest(request);

  const processingStatement: ProcessingStatement | IUnauthorised = await getProcessingStatement(
    bearerToken,
    documentNumber
  );

  if (instanceOfUnauthorised(processingStatement)) {
    return redirect("/unauthorised");
  }

  validateResponseData(processingStatement);

  const catches = getCatches(processingStatement);

  // For copied documents, fix the productId mismatch
  if (productId && documentNumber && !productId.startsWith(documentNumber)) {
    // This is likely a copied document with old productId
    // Use the current document's product ID
    const currentProduct = processingStatement.products?.[0];
    if (currentProduct) {
      productId = currentProduct.id ?? "";
    }
  }

  const form = await request.formData();
  const { _action, ...values } = Object.fromEntries(form);
  const nextUri = form.get("nextUri") as string;

  const allSpecies: Species[] = await getAllSpecies();
  const selectedSpeciesName = values["species"] as string;
  const faoCode = getFaoCodeFromSelectedSpecies(allSpecies, selectedSpeciesName);

  const goToPage = getGoToPage(values["pageNo"] as string);
  const isDraft = _action === "saveAsDraft";
  const addCatch = _action === "addCatch";
  const updateCatch = _action === "updateCatch";
  const editCatch = (_action as string).includes("editButton");

  const isValid = await validateCSRFToken(request, form);
  if (!isValid) return redirect("/forbidden");

  const session = await getSessionFromRequest(request);

  if (editCatch) {
    const splitStr: string[] = (_action as string).split("-");
    const index = findIndexByValue(catches, splitStr[1]);
    const pageNo = parseInt(splitStr[2]);

    return redirect(
      `/create-processing-statement/${documentNumber}/add-catch-details/${productId}/${index}?pageNo=${pageNo}`
    );
  }

  const removeCatch = (_action as string).includes("removeCatch");
  const cancelCatch = _action === "cancelCatch";
  const saveToRedisIfErrors = false;
  const countries: ICountry[] = await getCountries();

  if (addCatch) {
    const catchCertificateType = values["catchCertificateType"] as CertificateType;
    const catchCertificateNumber = values["catchCertificateNumber"] as string;
    const totalWeightLanded = values["totalWeightLanded"] as string;
    const inputCatchCertificateWeight = values["catchCertificateWeight"] as string;
    const issuingCountryName = values["issuingCountry"] as string;

    let catchCertificateWeight = "";
    let issuingCountry: ICountry | undefined = undefined;

    if (catchCertificateType === "uk") {
      catchCertificateWeight = totalWeightLanded;
    } else {
      catchCertificateWeight = inputCatchCertificateWeight ?? totalWeightLanded;
      issuingCountry = countries.find((c) => c.officialCountryName === issuingCountryName);
    }

    const newCatch = {
      id: `${documentNumber}-${moment.utc().unix()}-${catches.length}`,
      species: values["species"] as string,
      speciesCode: faoCode,
      catchCertificateNumber: catchCertificateNumber,
      catchCertificateType: catchCertificateType,
      totalWeightLanded: totalWeightLanded,
      catchCertificateWeight: catchCertificateWeight,
      exportWeightBeforeProcessing: values["exportWeightBeforeProcessing"] as string,
      exportWeightAfterProcessing: values["exportWeightAfterProcessing"] as string,
      scientificName: getScientificName(allSpecies, faoCode),
      productId: productId,
      productDescription: values["productDescription"] as string,
      issuingCountry: issuingCountry,
      productCommodityCode: values["productCommodityCode"] as string,
    };
    // using index 0 as new record will always be added at the top of the list
    const errorResponse = await updateProcessingStatement(
      bearerToken,
      documentNumber,
      newCatch,
      `/create-processing-statement/${documentNumber}/add-catch-details/${productId}/0`,
      0,
      saveToRedisIfErrors,
      true,
      getIndexBySpeciesForNewRecord(catches, faoCode) === -1
    );

    const handledResponse = addCatchResponseHandler(errorResponse);

    if (errorResponse) {
      return handledResponse;
    }

    // Store the selected species in session to retain after redirect
    if (values["species"]) {
      session.set("retainedSpecies", values["species"] as string);
    }

    let redirectUrl = `/create-processing-statement/${documentNumber}/add-catch-details/${productId}?pageNo=1`;

    if (!isEmpty(nextUri)) {
      redirectUrl += `&nextUri=${nextUri}`;
    }

    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (updateCatch) {
    const catchCertificateType = values["catchCertificateType"] as CertificateType;
    const totalWeightLanded = values["totalWeightLanded"] as string;
    const inputCatchCertificateWeight = values["catchCertificateWeight"] as string;
    const issuingCountryName = values["issuingCountry"] as string;

    let catchCertificateWeight = "";
    let issuingCountry: ICountry | undefined = undefined;

    if (catchCertificateType === "uk") {
      catchCertificateWeight = totalWeightLanded;
      issuingCountry = countries.find(
        (c) => c.officialCountryName.includes("United Kingdom") || c.isoCodeAlpha2 === "GB" || c.isoCodeAlpha3 === "GBR"
      );
    } else {
      catchCertificateWeight = inputCatchCertificateWeight ?? totalWeightLanded;
      issuingCountry = countries.find((c: ICountry) => c.officialCountryName === issuingCountryName);
    }

    const updatedCatch = {
      id: values["id"] as string,
      _id: values["catchId"] as string,
      species: values["species"] as string,
      speciesCode: faoCode,
      catchCertificateNumber: values["catchCertificateNumber"] as string,
      catchCertificateType: catchCertificateType,
      totalWeightLanded: totalWeightLanded,
      catchCertificateWeight: catchCertificateWeight,
      exportWeightBeforeProcessing: values["exportWeightBeforeProcessing"] as string,
      exportWeightAfterProcessing: values["exportWeightAfterProcessing"] as string,
      scientificName: getScientificName(allSpecies, faoCode),
      productId: productId,
      productDescription: values["productDescription"] as string,
      issuingCountry: issuingCountry,
      productCommodityCode: values["productCommodityCode"] as string,
    };

    const catchIndex = findIndexByValue(catches, values["catchId"] as string);
    const errorResponse = await updateProcessingStatement(
      bearerToken,
      documentNumber,
      updatedCatch,
      `/create-processing-statement/${documentNumber}/add-catch-details/${productId}/${catchIndex}`,
      catchIndex,
      saveToRedisIfErrors
    );

    if (errorResponse) {
      return errorResponse;
    }

    if (values["species"]) {
      session.set("retainedSpecies", values["species"] as string);
    }

    let redirectUrl = `/create-processing-statement/${documentNumber}/add-catch-details/${productId}?pageNo=${goToPage}`;

    if (!isEmpty(nextUri)) {
      redirectUrl += `&nextUri=${nextUri}`;
    }

    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (removeCatch) {
    const index = (_action as string).split("-")[1];
    const updatedProcessingStatement: ProcessingStatement | IUnauthorised = await removeCatchDescription(
      bearerToken,
      documentNumber,
      findIndexByValue(catches, index),
      `/create-processing-statement/${documentNumber}/add-catch-details`,
      true
    );

    if (instanceOfUnauthorised(updatedProcessingStatement)) {
      return redirect("/forbidden");
    }

    const recordsPerPage: number = parseInt(getEnv().PROCESSING_STATEMENT_CATCH_PER_PAGE, 10);
    const ctches = getUpdatedCatches(updatedProcessingStatement, productId);
    const totalPages = Math.ceil(ctches.length / recordsPerPage);

    const currentUrl = getCurrentUrl(documentNumber, productId, goToPage, totalPages);
    return redirect(currentUrl);
  }

  if (cancelCatch) {
    if (values["species"]) {
      session.set("retainedSpecies", values["species"] as string);
    }
    const redirectUrl = `/create-processing-statement/${documentNumber}/add-catch-details/${productId}?pageNo=${goToPage}`;
    return redirect(redirectUrl, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (isDraft) {
    return redirect(route("/create-processing-statement/processing-statements"));
  }

  const errorResponse = await updateProcessingStatement(
    bearerToken,
    documentNumber,
    {
      speciesCode: faoCode,
    },
    `/create-processing-statement/${documentNumber}/add-catch-details/${productId}`
  );

  if (errorResponse) {
    return errorResponse;
  }

  session.set(
    "backLinkForCatchAdded",
    `/create-processing-statement/${documentNumber}/add-catch-details/${productId}?pageNo=1`
  );

  return redirect(getRedirectUrl(nextUri, documentNumber), {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
