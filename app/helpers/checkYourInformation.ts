import type { Exporter } from "~/types";

export const hasExporterAddressBeenUpdated = (exporter: Exporter) => exporter._updated;
