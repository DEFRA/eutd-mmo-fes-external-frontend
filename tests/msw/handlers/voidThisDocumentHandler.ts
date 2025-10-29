import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { VOID_CERTIFICATE_URL, mockGetAllDocumentsUrl, GET_CLIENT_IP_URL } from "~/urls.server";
import badRequest from "@/fixtures/voidDocumentApi/badRequest.json";
import optionYes from "@/fixtures/voidDocumentApi/optionYes.json";
import optionNo from "@/fixtures/voidDocumentApi/optionNo.json";
import ccDrafts from "@/fixtures/dashboardApi/ccDrafts.json";

const ipAddress = "127.0.0.1";
const voidThisDocumentHandler: ITestHandler = {
  [TestCaseId.VoidThisDocumentBadRequest]: () => [
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text(ipAddress))),
    rest.post(VOID_CERTIFICATE_URL, (req, res, ctx) => res(ctx.status(400), ctx.json(badRequest))),
  ],
  [TestCaseId.VoidThisDocumentOptionYes]: () => [
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text(ipAddress))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(VOID_CERTIFICATE_URL, (req, res, ctx) => res(ctx.json(optionYes))),
  ],
  [TestCaseId.VoidThisDocumentOptionNo]: () => [
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text(ipAddress))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(VOID_CERTIFICATE_URL, (req, res, ctx) => res(ctx.json(optionNo))),
  ],
  [TestCaseId.VoidThisDocument403]: () => [
    rest.get(GET_CLIENT_IP_URL, (req, res, ctx) => res(ctx.text(ipAddress))),
    rest.get(mockGetAllDocumentsUrl, (req, res, ctx) => res(ctx.json(ccDrafts))),
    rest.post(VOID_CERTIFICATE_URL, (req, res, ctx) => res(ctx.status(403))),
  ],
};
export default voidThisDocumentHandler;
