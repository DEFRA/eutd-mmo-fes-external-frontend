import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import {
  generatePdf,
  GET_CLIENT_IP_URL,
  GET_PROCESSING_STATEMENT,
  mockAddExporterDetails,
  mockDocumentUrl,
} from "~/urls.server";

import processingStatement from "@/fixtures/processingStatementApi/processingStatement.json";
import exporterDetails from "@/fixtures/addExporterDetails/exporterDetails.json";
import psCreated from "@/fixtures/documentsApi/psCreated.json";

/**
 * Handler for UAT-498: Testing invalid catch certificate errors on Check Your Information page
 *
 * This handler simulates the scenario where a catch certificate becomes invalid (voided)
 * after being added to the PS but before submission
 */
const checkYourInformationInvalidCCHandler: ITestHandler = {
  /**
   * Test Case: Single invalid catch certificate
   * Simulates a voided UK catch certificate error on submission
   */
  [TestCaseId.PSCheckYourInformationInvalidCC]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json({ ...psCreated, documentStatus: "DRAFT" }))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("processingStatement"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          validationErrors: [
            {
              message: "psAddCatchDetailsErrorUKCCInValid",
              key: "catches-0-catchCertificateNumber",
            },
          ],
        })
      )
    ),
  ],

  /**
   * Test Case: Invalid CC with species error
   * Simulates both catch certificate and species validation errors
   */
  [TestCaseId.PSCheckYourInformationInvalidCCWithSpeciesError]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json({ ...psCreated, documentStatus: "DRAFT" }))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("processingStatement"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          validationErrors: [
            {
              message: "psAddCatchDetailsErrorUKCCInValid",
              key: "catches-0-catchCertificateNumber",
            },
            {
              message: "psAddCatchDetailsErrorEnterTheFAOCodeOrSpeciesName",
              key: "catches-0-species",
            },
          ],
        })
      )
    ),
  ],

  /**
   * Test Case: Incorrect format catch certificate
   * Simulates format validation error for catch certificate number
   */
  [TestCaseId.PSCheckYourInformationIncorrectFormatCC]: () => [
    rest.get(mockDocumentUrl, (req, res, ctx) => res(ctx.json({ ...psCreated, documentStatus: "DRAFT" }))),
    rest.get(GET_PROCESSING_STATEMENT, (req, res, ctx) => res(ctx.json(processingStatement))),
    rest.get(mockAddExporterDetails, (req, res, ctx) => res(ctx.json(exporterDetails))),
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text("127.0.0.1"))),
    rest.post(generatePdf("processingStatement"), (req, res, ctx) =>
      res(
        ctx.status(400),
        ctx.json({
          validationErrors: [
            {
              message: "psAddCatchDetailsErrorCCNumberMustOnlyContain",
              key: "catches-0-catchCertificateNumber",
            },
          ],
        })
      )
    ),
  ],
};

export default checkYourInformationInvalidCCHandler;
