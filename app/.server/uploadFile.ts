import { route } from "routes-gen";
import { getErrorMessage } from "~/helpers";
import { post } from "~/communication.server";
import { CLEAR_LANDINGS_URL, SAVE_LANDINGS_URL, UPLOAD_LANDINGS_URL } from "~/urls.server";
import { onGetResponse } from "~/helpers/http-utils";
import type { IBase, IError, IUnauthorised, IUploadedLanding } from "~/types";

export const uploadLandings = async (
  bearerToken: string,
  documentNumber: string | undefined,
  file: File
): Promise<IUploadedLanding[] | IError[] | IUnauthorised> => {
  if (!documentNumber) throw new Error("Document number is required");

  const formData = new FormData();
  formData.append("file", file.slice(), file.name);
  const response: Response = await fetch(UPLOAD_LANDINGS_URL, {
    method: "POST",
    body: formData,
    headers: {
      documentnumber: documentNumber,
      Authorization: `Bearer ${bearerToken}`,
    },
  });

  return onUploadLandings(response);
};

const onUploadLandings = async (response: Response): Promise<IUploadedLanding[] | IError[] | IUnauthorised> => {
  switch (response.status) {
    case 200:
      const data = await response.json();
      return data;
    case 400:
      const errors = (await response.json()) ?? {};
      return Object.keys(errors).map((key: string) => {
        const errorCode = errors[key]?.["key"];
        if (
          errorCode === "validation.product.start-date.seasonal.invalid-date" ||
          errorCode === "validation.product.seasonal.invalid-date"
        ) {
          return {
            key,
            message: getErrorMessage(errorCode),
            value: { dynamicValue: errors[key]["params"][0] },
          };
        } else if (errorCode === "error.upload.max-landings") {
          return {
            key,
            message: getErrorMessage(errorCode),
            value: { dynamicValue: errors[key]["params"]["limit"] },
          };
        } else {
          return {
            key,
            message: getErrorMessage(errors[key]),
          };
        }
      });
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const saveLandings = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<IBase & { rows?: IUploadedLanding[] }> => {
  if (!documentNumber) throw new Error("Document number is required");

  const response: Response = await post(
    bearerToken,
    SAVE_LANDINGS_URL,
    {
      documentNumber,
    },
    {
      currentUri: route("/create-catch-certificate/:documentNumber/upload-file", { documentNumber }),
    }
  );

  return onSaveLandings(response);
};

const onSaveLandings = async (response: Response): Promise<IBase & { rows?: IUploadedLanding[] }> => {
  switch (response.status) {
    case 200:
      return {
        rows: await response.json(),
        errors: [],
        unauthorised: false,
      };
    case 400:
      const errors = await response.json();
      return {
        errors: Object.keys(errors).map((key: string) =>
          (errors[key]["key"] && errors[key]["key"] === "error.file.array.max") ||
          (errors[key]["key"] && errors[key]["key"] === "error.upload.max-landings")
            ? {
                key,
                message: getErrorMessage(errors[key]["key"]),
                value: { dynamicValue: errors[key]["params"]["limit"] },
              }
            : {
                key,
                message: getErrorMessage(errors[key]),
              }
        ),
        unauthorised: false,
      };
    case 403:
      return {
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const clearLandings = async (
  bearerToken: string,
  documentNumber: string | undefined
): Promise<{ rows?: IUploadedLanding[]; unauthorised?: boolean }> => {
  if (!documentNumber) throw new Error("Document number is required");

  try {
    const response: Response = await post(bearerToken, `${CLEAR_LANDINGS_URL}`, {
      documentNumber,
    });

    return onGetResponse(response);
  } catch (error) {
    throw new Error(`Unexpected error: ${error}`);
  }
};
