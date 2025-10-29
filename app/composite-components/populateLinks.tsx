import type { ICompletedDocumentData, IGetAllDocumentsData, IProgressDocumentData, Journey } from "~/types";
import { type TFunction } from "react-i18next";
import { route } from "routes-gen";
import { Link } from "@remix-run/react";

const getInProgressLinks = (
  journey: Journey,
  documents: IGetAllDocumentsData,
  t: TFunction<"common"[], undefined>,
  linksToPopulate: any
) =>
  Array.isArray(documents?.inProgress)
    ? documents.inProgress.map((document: IProgressDocumentData) => {
        document.links = {
          continueLink: () => (
            <Link
              id="continue"
              to={route(linksToPopulate.continueLink, {
                documentNumber: document.documentNumber,
              })}
              className="govuk-link"
              reloadDocument
            >
              {t("continue", { ns: "dashboard" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${document.userReference ? document.userReference : ""}`}
              </span>
            </Link>
          ),
          deleteLink: () => (
            <Link
              id="delete"
              to={route(linksToPopulate.deleteLink, {
                documentNumber: document.documentNumber,
              })}
              className="govuk-link"
              reloadDocument
            >
              {t("delete", { ns: "dashboard" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${document.userReference ? document.userReference : ""}`}
              </span>
            </Link>
          ),
        };
        return document;
      })
    : [];

const getCompletedLinks = (
  journey: Journey,
  documents: IGetAllDocumentsData,
  t: TFunction<"common"[], undefined>,
  linksToPopulate: any
) =>
  Array.isArray(documents?.completed)
    ? documents.completed.map((document: ICompletedDocumentData) => {
        document.links = {
          voidLink: () => (
            <Link
              to={route(linksToPopulate.voidLink, {
                documentNumber: document.documentNumber,
              })}
              className="govuk-link"
              reloadDocument
            >
              {t("commonDashboardVoid", { ns: "common" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${document.userReference ? document.userReference : ""}`}
              </span>
            </Link>
          ),
          copyLink: () => (
            <Link
              to={route(linksToPopulate.copyLink, {
                documentNumber: document.documentNumber,
              })}
              className="govuk-link"
              reloadDocument
            >
              {t("commonDashboardCopy", { ns: "common" })}
              <span className="govuk-visually-hidden">
                {`${t(journey)} ${document.documentNumber} ${document.userReference ? document.userReference : ""}`}
              </span>
            </Link>
          ),
        };
        return document;
      })
    : [];

export const PopulateLinks = (
  journey: Journey,
  documents: IGetAllDocumentsData,
  t: TFunction<"common"[], undefined>,
  linksToPopulate: any
): IGetAllDocumentsData => ({
  inProgress: getInProgressLinks(journey, documents, t, linksToPopulate),
  completed: getCompletedLinks(journey, documents, t, linksToPopulate),
});
