import {
  type MaxPartSizeExceededError,
  redirect,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import type { Params } from "@remix-run/react";
import isEmpty from "lodash/isEmpty";
import { route } from "routes-gen";
import setApiMock from "tests/msw/helpers/setApiMock";
import {
  getBearerTokenForRequest,
  getLandingsEntryOption,
  createCSRFToken,
  uploadLandings,
  clearLandings,
  saveLandings,
} from "~/.server";
import { apiCallFailed } from "~/communication.server";
import { getEnv } from "~/env.server";
import { getErrorMessage } from "~/helpers";
import { getSessionFromRequest } from "~/sessions.server";
import type { IUploadedLanding, IError, IUnauthorised, IBase, ErrorResponse } from "~/types";

function instanceOfIError(data: IUploadedLanding[] | IError[]): data is IError[] {
  return Array.isArray(data) && data.length > 0 && "key" in data[0];
}

function instanceOfUnauthorised(data: IUploadedLanding[] | IError[] | IUnauthorised): data is IUnauthorised {
  return "unauthorised" in data;
}

function instanceOfMaxPartSizeExceededError(error: any): error is MaxPartSizeExceededError {
  return (
    !isEmpty(error?.message) &&
    error.message.includes(`Field "productCsvFile" exceeded upload size of ${getEnv().MAX_UPLOAD_FILE_SIZE} bytes`)
  );
}

function uploadErrorHandler(err: unknown): Promise<Response | ErrorResponse> {
  if (instanceOfMaxPartSizeExceededError(err)) {
    const maxPartSizeExceededError: IError[] = [
      {
        key: "file",
        message: getErrorMessage("error.upload.max-file-size"),
        value: { dynamicValue: Math.round((getEnv().MAX_UPLOAD_FILE_SIZE as number) / 1000) },
      },
    ];

    return apiCallFailed(maxPartSizeExceededError, {
      rows: [],
      totalRows: 0,
      showNotification: false,
    });
  }

  throw err;
}

async function uploadCancelHandler(bearerToken: string, documentNumber: string | undefined): Promise<Response> {
  const { unauthorised } = await clearLandings(bearerToken, documentNumber);

  if (unauthorised) {
    return redirect("/forbidden");
  }

  return redirect(route("/create-catch-certificate/:documentNumber/add-exporter-details", { documentNumber }));
}

async function uploadClearHandler(bearerToken: string, documentNumber: string | undefined): Promise<Response> {
  const { rows = [], unauthorised } = await clearLandings(bearerToken, documentNumber);

  if (unauthorised) {
    return redirect("/forbidden");
  }

  return new Response(
    JSON.stringify({
      rows,
      totalRows: rows.length,
      showNotification: false,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

async function uploadSaveAndContinuneHandler(
  bearerToken: string,
  documentNumber: string | undefined
): Promise<Response | ErrorResponse> {
  const {
    errors,
    unauthorised,
    rows = [],
  }: IBase & { rows?: IUploadedLanding[] } = await saveLandings(bearerToken, documentNumber);

  if (unauthorised) {
    return redirect("/forbidden");
  }

  if (Array.isArray(errors) && errors.length > 0) {
    return apiCallFailed(errors, {
      rows,
      totalRows: rows.length,
      showNotification: false,
    });
  }

  return redirect(route("/create-catch-certificate/:documentNumber/what-are-you-exporting", { documentNumber }));
}

export const UploadFileLoader = async (request: Request, params: Params) => {
  /* istanbul ignore next */
  setApiMock(request.url);

  const bearerToken = await getBearerTokenForRequest(request);

  const { documentNumber } = params;

  const { landingsEntryOption, unauthorised } = await getLandingsEntryOption(bearerToken, documentNumber);

  if (landingsEntryOption === "directLanding" || unauthorised) {
    return redirect("/forbidden");
  }

  const csrf = await createCSRFToken(request);
  const session = await getSessionFromRequest(request);
  session.set("csrf", csrf);

  return new Response(JSON.stringify({ documentNumber, csrf, maxEEZ: getEnv().EU_CATCH_MAX_EEZ }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const UploadFileAction = async (request: Request, params: Params): Promise<Response | ErrorResponse> => {
  /* istanbul ignore next */
  setApiMock(request.url);

  try {
    const bearerToken = await getBearerTokenForRequest(request);
    const { documentNumber } = params;

    const fileUploadHandler = unstable_createMemoryUploadHandler({
      maxPartSize: getEnv().MAX_UPLOAD_FILE_SIZE as number,
    });
    const multipartFormData = await unstable_parseMultipartFormData(request, fileUploadHandler);
    const data = Object.fromEntries(multipartFormData);

    if (data["_action"] === "cancel") {
      return await uploadCancelHandler(bearerToken, documentNumber);
    }

    if (data["_action"] === "clear") {
      return await uploadClearHandler(bearerToken, documentNumber);
    }

    if (data["_action"] === "saveAndContinue") {
      return await uploadSaveAndContinuneHandler(bearerToken, documentNumber);
    }

    const file: File = data["productCsvFile"] as File;
    const rows: IUploadedLanding[] | IError[] | IUnauthorised =
      (await uploadLandings(bearerToken, documentNumber, file)) || [];

    if (instanceOfUnauthorised(rows)) {
      return redirect("/forbidden");
    }

    if (instanceOfIError(rows)) {
      return apiCallFailed(rows);
    }

    return new Response(
      JSON.stringify({
        rows,
        successfullyUploadedRows: rows.filter((row: IUploadedLanding) => row.errors.length === 0).length,
        totalRows: rows.length,
        showNotification: rows.length > 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return uploadErrorHandler(err);
  }
};
