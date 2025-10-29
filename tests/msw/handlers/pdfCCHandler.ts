import { rest } from "msw";
import { type ITestHandler, TestCaseId } from "~/types";
import { mockCertificatesPdfUrl } from "~/urls.server";

import voidedDoc from "@/fixtures/certificatesApi/voided.json";
import docWithDifferentCreator from "@/fixtures/certificatesApi/docWithDifferentCreator.json";

const pdfCCHandler: ITestHandler = {
  [TestCaseId.PdfCCFromDifferentContactId]: () => [
    rest.get(mockCertificatesPdfUrl, (req, res, ctx) => res(ctx.json(docWithDifferentCreator))),
  ],
  [TestCaseId.PdfCCFromDifferentCreator]: () => [
    rest.get(mockCertificatesPdfUrl, (req, res, ctx) => res(ctx.json(docWithDifferentCreator))),
  ],
  [TestCaseId.PdfCCVoided]: () => [rest.get(mockCertificatesPdfUrl, (req, res, ctx) => res(ctx.json(voidedDoc)))],
};

export default pdfCCHandler;
