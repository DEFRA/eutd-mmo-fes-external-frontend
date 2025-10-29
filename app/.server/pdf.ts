import { BlobServiceClient } from "@azure/storage-blob";
import { getReferenceData } from "~/communication.server";
import { certificatesPdfReference } from "~/urls.server";
import serverLogger from "~/logger.server";

export const getDocumentInfo = async (blobName: string) => {
  /*
   * get the document status via the blobName from internal service
   * the blobName will be {guid}.pdf
   */

  const uuid = blobName.substring(0, blobName.lastIndexOf(".")) || blobName;
  const documentInfo = {} as any;
  documentInfo.uuid = uuid;

  try {
    const response: Response = await getReferenceData(certificatesPdfReference(uuid));
    const data = await response.json();

    if (data !== undefined) {
      documentInfo.documentStatus = data.status;
      documentInfo.documentType = data.__t;
      documentInfo.documentNumber = data.documentNumber;
      documentInfo.createdBy = data.createdBy;
      documentInfo.uuid = uuid;
      documentInfo.contactId = data.contactId;
    }

    return documentInfo;
  } catch (e) {
    serverLogger.error(`[PDF][GET-DOCUMENT-INFO][ERROR][${(e as any).stack ?? e}]`);
    return documentInfo;
  }
};

export const validateOwnership = (
  userPrincipal: string | null,
  contactId: string,
  docContactId: string,
  docUserPrincipal: string
) => {
  if (userPrincipal && docUserPrincipal) {
    if (userPrincipal === docUserPrincipal) {
      return true;
    }
  }

  if (contactId && docContactId) {
    if (contactId === docContactId) {
      return true;
    }
  }

  return false;
};

export const retrieveDocFromStorage = async (connectionString: string | undefined, documentUri: string) => {
  if (connectionString === undefined || connectionString === "") {
    return null;
  }

  const blobName = `${documentUri}.pdf`;
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient("export-certificates");
  const blockBlobClient = containerClient.getBlobClient(blobName);

  try {
    return await blockBlobClient.downloadToBuffer();
  } catch (e) {
    serverLogger.error(`[PDF][DOWNLOAD][ERROR][${(e as any).stack ?? e}]`);
    return null;
  }
};

export const Unauthorised401HttpResponse = () =>
  new Response(
    "You are not authorised to view this document. For further enquiries please contact ukiuuslo@marinemanagement.org.uk",
    {
      status: 401,
      headers: {
        "Content-Type": "text/html",
      },
    }
  );

export const OK200HttpResponse = (pdfBlob: Buffer) =>
  new Response(pdfBlob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
