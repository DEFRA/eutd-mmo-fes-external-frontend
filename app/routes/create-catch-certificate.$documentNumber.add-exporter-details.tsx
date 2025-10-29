import * as React from "react";
import { type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { exporterDetailsLoader, exporterDetailsAction } from "~/.server";
import { AddExporterDetailsComponent } from "~/composite-components";

export const loader: LoaderFunction = async ({ request, params }) =>
  await exporterDetailsLoader(request, params, "catchCertificate");

export const action: ActionFunction = async ({ request, params }) =>
  await exporterDetailsAction(request, params, "catchCertificate");

const AddExporterDetailsCatchCertificate = () => <AddExporterDetailsComponent journey="catchCertificate" />;

export default AddExporterDetailsCatchCertificate;
