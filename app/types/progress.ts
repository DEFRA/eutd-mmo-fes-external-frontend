import type { IBase, IError, ITransport, LandingEntryType, ProcessingStatementProduct } from ".";

export enum ProgressStatus {
  INCOMPLETE = "INCOMPLETE",
  ERROR = "ERROR",
  COMPLETED = "COMPLETED",
  CANNOT_START = "CANNOT START",
  OPTIONAL = "OPTIONAL",
}

export interface IProgress extends IBase {
  progress?: ICatchCertificateProgressSteps | IProcessingStatementProgressSteps | IStorageDocumentProgressSteps | null;
  requiredSections?: number;
  completedSections?: number;
}

export interface IProgressDataRow {
  title: string;
  status?: string;
  optional?: boolean;
  testId: string;
  url: string;
  error?: IError;
}

export interface IProgressDataSection {
  title: string;
  testId: string;
  rows: Array<IProgressDataRow>;
}

export interface IBaseProgressSteps {
  reference: ProgressStatus;
  exporter: ProgressStatus;
}

export interface ICatchCertificateProgressSteps extends IBaseProgressSteps {
  dataUpload: string;
  products: ProgressStatus;
  landings: ProgressStatus;
  conservation: ProgressStatus;
  exportJourney: ProgressStatus;
  transportType: ProgressStatus;
  transportDetails: ProgressStatus;
}
export interface IProcessingStatementProgressSteps extends IBaseProgressSteps {
  processedProductDetails: ProgressStatus;
  processingPlant: ProgressStatus;
  processingPlantAddress: ProgressStatus;
  exportHealthCertificate: ProgressStatus;
  exportDestination: ProgressStatus;
}

export interface IStorageDocumentProgressSteps extends IBaseProgressSteps {
  catches: ProgressStatus;
  storageFacilities: ProgressStatus;
  exportDestination: ProgressStatus;
  arrivalTransportationDetails: ProgressStatus;
  transportDetails: ProgressStatus;
}

export interface ProgressLoaderProps {
  documentNumber: string;
  progress?: IStorageDocumentProgressSteps | ICatchCertificateProgressSteps | IProcessingStatementProgressSteps;
  requiredSections: number;
  completedSections: number;
  transport: ITransport;
  copyDocumentAcknowledged: boolean;
  voidDocumentConfirm: string;
  copyDocumentNumber: string;
  csrf: string;
  landingsEntryOption?: LandingEntryType;
  displayOptionalSuffix?: boolean;
  products?: ProcessingStatementProduct[];
}
