import * as React from "react";
import type { LoaderFunction } from "react-router";
import { documentCreatedLoader } from "~/.server";
import { DocumentCreatedComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  documentCreatedLoader(request, params, "processingStatement");

const ProcessingStatementCreated = () => <DocumentCreatedComponent journey="processingStatement" />;

export default ProcessingStatementCreated;
