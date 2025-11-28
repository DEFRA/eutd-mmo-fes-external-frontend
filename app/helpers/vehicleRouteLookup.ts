import type { ITransport, Journey, Vehicle } from "~/types";

export const vehicleToUrlSlug = (vehicle: Vehicle) => vehicle.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

export const forwardUri = (vehicle: Vehicle) => {
  let nextUri = "";
  switch (vehicle) {
    case "truck":
      nextUri = "add-transportation-details-truck";
      break;
    case "plane":
      nextUri = "add-transportation-details-plane";
      break;
    case "train":
      nextUri = "add-transportation-details-train";
      break;
    case "containerVessel":
      nextUri = "add-transportation-details-container-vessel";
      break;
    case "directLanding":
      nextUri = "check-your-information";
      break;
  }

  return nextUri;
};

export const arrivalTransportForwardUri = (vehicle: Vehicle) => {
  let nextUri = "";
  switch (vehicle) {
    case "truck":
      nextUri = "add-arrival-transportation-details-truck";
      break;
    case "plane":
      nextUri = "add-arrival-transportation-details-plane";
      break;
    case "train":
      nextUri = "add-arrival-transportation-details-train";
      break;
    case "containerVessel":
      nextUri = "add-arrival-transportation-details-container-vessel";
      break;
    case "directLanding":
      nextUri = "check-your-information";
      break;
  }

  return nextUri;
};

export const backUri = (transport: ITransport, journey: Journey) => {
  let backUri = "";

  switch (transport.vehicle) {
    case "truck": {
      if (journey === "catchCertificate") {
        backUri =
          transport.cmr === "true"
            ? "do-you-have-a-road-transport-document"
            : "add-additional-transport-documents-truck";
      } else {
        backUri =
          transport.cmr === "true" ? "do-you-have-a-road-transport-document" : "add-transportation-details-truck";
      }
      break;
    }
    case "plane":
      backUri =
        journey === "catchCertificate"
          ? "add-additional-transport-documents-plane"
          : "add-transportation-details-plane";
      break;
    case "train":
      backUri =
        journey === "catchCertificate"
          ? "add-additional-transport-documents-train"
          : "add-transportation-details-train";
      break;
    case "containerVessel":
      backUri =
        journey === "catchCertificate"
          ? "add-additional-transport-documents-container-vessel"
          : "add-transportation-details-container-vessel";
      break;
    case "directLanding":
      backUri = "how-does-the-export-leave-the-uk";
      break;
  }

  return backUri;
};

export const changeLinkUri = (transportType: string, transport: ITransport) => {
  let changeLinkUri = "";

  switch (transportType) {
    case "truck": {
      changeLinkUri =
        transport.cmr === "true" ? "do-you-have-a-road-transport-document" : "add-transportation-details-truck";
      break;
    }
    case "plane":
      changeLinkUri = "add-transportation-details-plane";
      break;
    case "train":
      changeLinkUri = "add-transportation-details-train";
      break;
    case "containerVessel":
      changeLinkUri = "add-transportation-details-container-vessel";
      break;
    case "truckArrival": {
      changeLinkUri = "add-arrival-transportation-details-truck";
      break;
    }
    case "planeArrival":
      changeLinkUri = "add-arrival-transportation-details-plane";
      break;
    case "trainArrival":
      changeLinkUri = "add-arrival-transportation-details-train";
      break;
    case "containerVesselArrival":
      changeLinkUri = "add-arrival-transportation-details-container-vessel";
      break;
  }

  return changeLinkUri;
};
