import * as React from "react";
import type { LoaderFunction } from "@remix-run/node";
import { documentCreatedLoader } from "~/.server";
import { DocumentCreatedComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  documentCreatedLoader(request, params, "storageNotes");

const StorageDocumentCreated = () => <DocumentCreatedComponent journey="storageNotes" />;
export default StorageDocumentCreated;
