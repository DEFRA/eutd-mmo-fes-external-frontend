import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { exporterDetailsLoader, exporterDetailsAction } from "~/.server";
import { AddExporterDetailsComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  await exporterDetailsLoader(request, params, "storageNotes");

export const action: ActionFunction = async ({ request, params }) =>
  await exporterDetailsAction(request, params, "storageNotes");

const AddExporterDetails = () => <AddExporterDetailsComponent journey="storageNotes" />;

export default AddExporterDetails;
