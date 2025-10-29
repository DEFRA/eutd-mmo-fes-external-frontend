import type { JSXElementConstructor, ReactElement } from "react";
import type { Journey } from "./main";

export interface INotification {
  title: string;
  message: string;
}

export interface IDashboardData {
  journey: Journey;
  documents: IGetAllDocumentsData;
  notification?: INotification;
  showStartButton: boolean;
  hasDrafts: boolean;
  maximumDrafts: number;
  heading?: string;
  dashboardLinks: DashboardLinks;
  dashboardFeedbackURL: string;
  csrf: string;
}

export interface IProgressDocumentData {
  documentNumber: string;
  isFailed: boolean;
  startedAt: string;
  status: string;
  userReference: string;
  links: DashboardInProgressRecordLinks;
}

export interface DashboardCompletedRecordLinks {
  voidLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
  copyLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
}

export interface DashboardInProgressRecordLinks {
  continueLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
  deleteLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
}

export interface DashboardLinks {
  previousLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
  nextLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
  monthlyLinks: () => ReactElement<any, string | JSXElementConstructor<any>>[];
}

export interface pageLinks {
  previousLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
  nextLink: () => ReactElement<any, string | JSXElementConstructor<any>>;
}

export interface ICompletedDocumentData {
  documentNumber: string;
  createdAt: string;
  userReference: string;
  documentUri: string;
  links: DashboardCompletedRecordLinks;
}

export interface IGetAllDocumentsData {
  completed: ICompletedDocumentData[];
  inProgress: IProgressDocumentData[];
}
