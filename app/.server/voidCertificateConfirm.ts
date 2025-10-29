import type { IVoidCertificateConfirmation, Journey } from "~/types";
import { getErrorMessage } from "~/helpers";
import { GET_CLIENT_IP_URL, VOID_CERTIFICATE_URL } from "~/urls.server";
import { post, get } from "~/communication.server";

export const addVoidCertificateConfirmation = async (
  bearerToken: string,
  documentNumber: string | undefined,
  journey: Journey,
  nextUri: string,
  documentVoid: FormDataEntryValue = ""
): Promise<IVoidCertificateConfirmation> => {
  if (!documentNumber) {
    throw new Error("catch certificate document number is required");
  }

  const res: Response = await get(bearerToken, GET_CLIENT_IP_URL);
  const ipAddress: string = await res.text();
  const response: Response = await post(
    bearerToken,
    VOID_CERTIFICATE_URL,
    {
      documentnumber: documentNumber,
    },
    { journey, nextUri, ipAddress, documentVoid, documentNumber }
  );

  return onVoidCertificateConfirmation(response, documentVoid);
};

const onVoidCertificateConfirmation = async (
  response: Response,
  documentVoid?: FormDataEntryValue
): Promise<IVoidCertificateConfirmation> => {
  switch (response.status) {
    case 200:
    case 204:
      return {
        documentVoid: documentVoid as string,
        errors: [],
      };
    case 400:
      const data = await response.json();
      return {
        documentVoid: documentVoid as string,
        errors: Object.keys(data).map((key: string) => ({
          key,
          message: getErrorMessage(data[key]),
        })),
      };
    case 403:
      return {
        errors: [],
        unauthorised: true,
      };
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};
