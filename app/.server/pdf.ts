import { Readable } from "node:stream";
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import { getReferenceData } from "~/communication.server";
import { certificatesPdfReference } from "~/urls.server";
import serverLogger from "~/logger.server";

// Singleton: created once per server process so that the underlying HTTP agent
// (and its TCP/TLS connections to Azure) is shared across all requests.
let _containerClient: ContainerClient | undefined;

const getContainerClient = (connectionString: string): ContainerClient => {
  _containerClient ??=
    BlobServiceClient.fromConnectionString(connectionString).getContainerClient("export-certificates");
  return _containerClient;
};

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

export const retrieveDocFromStorage = async (
  connectionString: string | undefined,
  documentUri: string
): Promise<ReadableStream<Uint8Array> | null> => {
  if (connectionString === undefined || connectionString === "") {
    return null;
  }

  const blobName = `${documentUri}.pdf`;
  // Reuse the singleton ContainerClient so the underlying HTTP connection pool
  // to Azure Blob Storage is shared across all concurrent requests.
  const blockBlobClient = getContainerClient(connectionString).getBlobClient(blobName);

  try {
    const downloadResponse = await blockBlobClient.download();
    if (!downloadResponse.readableStreamBody) {
      return null;
    }
    // Convert Node.js Readable to a WHATWG ReadableStream so it can be passed
    // directly to the Response constructor, letting bytes stream to the client
    // as they arrive from Azure instead of buffering the whole PDF first.
    // The Azure SDK types readableStreamBody as NodeJS.ReadableStream (the base
    // interface), but the runtime value is always a stream.Readable instance.
    return Readable.toWeb(downloadResponse.readableStreamBody as Readable) as ReadableStream<Uint8Array>;
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

export const OK200HttpResponse = (pdfBlob: ReadableStream<Uint8Array>) =>
  new Response(pdfBlob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
    },
  });
