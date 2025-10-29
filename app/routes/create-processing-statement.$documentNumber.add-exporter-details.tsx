import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { exporterDetailsAction, exporterDetailsLoader } from "~/.server";
import { AddExporterDetailsComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  await exporterDetailsLoader(request, params, "processingStatement");

export const action: ActionFunction = async ({ request, params }) =>
  await exporterDetailsAction(request, params, "processingStatement");

const AddExporterDetails = () => <AddExporterDetailsComponent journey="processingStatement" />;

export default AddExporterDetails;
