import SummaryListRow from "~/components/summaryListRow";
import { type AdditionalDocumentsData, type ITransport } from "~/types";
import { generateActions } from "./transportationDetailsSummary";
import { route } from "routes-gen";
import { TransportType } from "~/helpers";

type TransportationDocumentsSummaryProps = {
  documentNumber: string;
  transport: ITransport;
  isLocked: boolean;
  t: any;
};

type TransportFieldType = { docName: string; docRef: string; subUrl: string; title: string; namespace: string };

const transportFields: Record<TransportType, TransportFieldType> = {
  [TransportType.TRUCK]: {
    docName: "addAdditionalTransportDocumentsTruckDocumentName",
    docRef: "addAdditionalTransportDocumentsTruckDocumentReference",
    subUrl: "truck",
    title: "ccSummaryPageTransportationDetails",
    namespace: "checkYourInformation",
  },
  [TransportType.TRAIN]: {
    docName: "addAdditionalTransportDocumentsTrainDocumentName",
    docRef: "addAdditionalTransportDocumentsTrainDocumentReference",
    subUrl: "train",
    title: "addTransportationDetailsRailwayBillNumber",
    namespace: "transportation",
  },
  [TransportType.PLANE]: {
    docName: "addAdditionalTransportDocumentsPlaneDocumentName",
    docRef: "addAdditionalTransportDocumentsPlaneDocumentReference",
    subUrl: "plane",
    title: "addTransportationDetailsFlightnumber",
    namespace: "transportation",
  },
  [TransportType.CONTAINER_VESSEL]: {
    docName: "addAdditionalTransportDocumentsContainerVesselDocumentName",
    docRef: "addAdditionalTransportDocumentsContainerVesselDocumentReference",
    subUrl: "container-vessel",
    title: "addTransportationDetailsVesselNameText",
    namespace: "transportation",
  },
};

export const TransportationDocumentsSummary = ({
  documentNumber,
  transport,
  isLocked,
  t,
}: TransportationDocumentsSummaryProps) => (
  <>
    {transport.documents?.map((document: AdditionalDocumentsData, index: number) => (
      <>
        <SummaryListRow
          keyText={t(transportFields[transport.vehicle as TransportType].docName, { ns: "transportation" })}
          value={document.name}
          actions={generateActions(
            isLocked,
            `/create-catch-certificate/${documentNumber}/add-additional-transport-documents-${transportFields[transport.vehicle as TransportType].subUrl}/${transport.id}?nextUri=${route(
              "/create-catch-certificate/:documentNumber/check-your-information",
              {
                documentNumber,
              }
            )}#documentName${index + 1}`,
            transportFields[transport.vehicle as TransportType].title,
            transportFields[transport.vehicle as TransportType].namespace,
            t
          )}
        />
        <SummaryListRow
          keyText={t(transportFields[transport.vehicle as TransportType].docRef, { ns: "transportation" })}
          value={document.reference}
          actions={generateActions(
            isLocked,
            `/create-catch-certificate/${documentNumber}/add-additional-transport-documents-${transportFields[transport.vehicle as TransportType].subUrl}/${transport.id}?nextUri=${route(
              "/create-catch-certificate/:documentNumber/check-your-information",
              {
                documentNumber,
              }
            )}#documentReference${index + 1}`,
            transportFields[transport.vehicle as TransportType].title,
            transportFields[transport.vehicle as TransportType].namespace,
            t
          )}
        />
      </>
    ))}
  </>
);
