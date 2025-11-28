import { v4 as uuidv4 } from "uuid";
import { redirect } from "@remix-run/node";
import { getBearerTokenForRequest, getTransportById, updateTransportDocuments, validateCSRFToken } from "~/.server";
import type { ITransport, IError, IErrorsTransformed, AdditionalDocumentsData } from "~/types";
import { route } from "routes-gen";
import type { Params } from "@remix-run/router";
import isEmpty from "lodash/isEmpty";
import { apiCallFailed } from "~/communication.server";
import { commitSession, getSessionFromRequest } from "~/sessions.server";

const getAdditionalDocumentObj = (formData: FormData) => {
  const actionName = formData.get("_action") as string;
  const additionalDocumentData: AdditionalDocumentsData[] = [];
  const totalDocumentCount = formData.get("totalDocumentCount") as string;
  const removalDocumentIndex = actionName?.replace("removeCurrentDocument-", "");

  [...Array(Number(totalDocumentCount))].forEach((_val, index) => {
    const id = formData.get(`documentId${index + 1}`) as string;
    const name = formData.get(`documentName${index + 1}`) as string;
    const reference = formData.get(`documentReference${index + 1}`) as string;
    if (Number(removalDocumentIndex) !== index) {
      additionalDocumentData.push({ id, name, reference });
    }
    return true;
  });
  return additionalDocumentData;
};

const checkForDocumentObjectErrors = (errors: IError[], values: any) =>
  errors.reduce((acc: IError[], error: IError) => {
    if (error.message === "ccAdditionalTransportDocumentObjectError") {
      const index = parseInt(error.key.split(".")[1]);
      const field = index + 1;
      // is name missing
      const hasNameError = isEmpty(values[`documentName${field}`]) && !isEmpty(values[`documentReference${field}`]);
      if (hasNameError) {
        return [...acc, { key: `documents.${index}.name`, message: "ccAdditionalTransportDocumentMissingNameError" }];
      }
      // is reference missing
      const hasReferenceError =
        isEmpty(values[`documentReference${field}`]) && !isEmpty(values[`documentName${field}`]);
      if (hasReferenceError) {
        return [
          ...acc,
          { key: `documents.${index}.reference`, message: "ccAdditionalTransportDocumentMissingReferenceError" },
        ];
      }

      return [...acc, error];
    }

    return [...acc, error];
  }, []);

export const CatchCertificateTransportationDocumentsAction = async (request: Request, params: Params) => {
  const bearerToken = await getBearerTokenForRequest(request);
  const { documentNumber } = params;
  const splitParams = params["*"]?.split("/");
  const transportId = splitParams?.[0];
  if (transportId) {
    const transport: ITransport = await getTransportById(bearerToken, documentNumber, transportId);
    const form = await request.formData();
    const isValid = await validateCSRFToken(request, form);
    if (!isValid) return redirect("/forbidden");

    const additionalDocuments = getAdditionalDocumentObj(form);
    const actionName = form.get("_action") as string;
    const saveDraft = actionName === "saveAsDraft";
    const saveAndContinue = actionName === "saveAndContinue";
    const remove = actionName.includes("removeCurrentDocument");

    const nextUri = form.get("nextUri") as string;

    const payload: ITransport = {
      vehicle: transport.vehicle,
      documents: additionalDocuments,
    };
    const postTransport: ITransport = await updateTransportDocuments(
      bearerToken,
      documentNumber,
      transportId,
      payload,
      saveAndContinue,
      saveDraft || remove
    );
    const errors: IError[] | IErrorsTransformed = (postTransport.errors as IError[]) || [];

    const isUnauthorised = postTransport.unauthorised as boolean;

    if (isUnauthorised) {
      return redirect("/forbidden");
    }

    if (saveDraft) {
      return redirect(route("/create-catch-certificate/catch-certificates"));
    }

    if (errors.length > 0) {
      const values = Object.fromEntries(form);
      const errorsTransformed = checkForDocumentObjectErrors(errors, values);
      return apiCallFailed(errorsTransformed, { ...values, ...{ additionalFormDocuments: additionalDocuments } });
    }

    const session = await getSessionFromRequest(request);

    if (remove) {
      session.unset("addAnotherDocument");
      return new Response(
        JSON.stringify({
          additionalFormDocuments: additionalDocuments,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    if (actionName === "addAnotherDocument") {
      const id = uuidv4();
      session.set("addAnotherDocument", id);
      additionalDocuments.unshift({
        id,
        name: "",
        reference: "",
      });

      const documents: AdditionalDocumentsData[] = Array.isArray(additionalDocuments) ? additionalDocuments : [];
      return new Response(
        JSON.stringify({
          additionalFormDocuments: documents,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": await commitSession(session),
          },
        }
      );
    }

    session.unset("addAnotherDocument");
    session.set("lastUpdatedTransportId", transportId);
    return redirect(
      isEmpty(nextUri)
        ? route("/create-catch-certificate/:documentNumber/do-you-have-additional-transport-types", { documentNumber })
        : nextUri,
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  }

  return redirect(`/create-catch-certificate/${documentNumber}/how-does-the-export-leave-the-uk`);
};
