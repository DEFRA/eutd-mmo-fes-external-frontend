import { progressTableDataBuilder } from "~/helpers/progressTableDataBuilder";
import type { ICatchCertificateProgressSteps, ITransport } from "~/types";
import { ProgressStatus } from "~/types/progress";

const ccContext = "/create-catch-certificate/:documentNumber";

const baseProgress: ICatchCertificateProgressSteps = {
  reference: ProgressStatus.COMPLETED,
  exporter: ProgressStatus.COMPLETED,
  dataUpload: ProgressStatus.COMPLETED,
  products: ProgressStatus.COMPLETED,
  landings: ProgressStatus.COMPLETED,
  conservation: ProgressStatus.COMPLETED,
  exportJourney: ProgressStatus.COMPLETED,
  transportType: ProgressStatus.COMPLETED,
  transportDetails: ProgressStatus.INCOMPLETE,
};

const baseTransport: ITransport = {
  vehicle: "truck",
  id: "abc-123",
};

describe("progressTableDataBuilder", () => {
  describe("Transport Details URL - fallback for undefined vehicle/id", () => {
    it("should build the correct transport URL when vehicle and id are both present", () => {
      const result = progressTableDataBuilder(false, false, baseProgress, baseTransport);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const row = transportSection?.rows.find((r) => r.testId === "transportDetails");

      expect(row?.url).to.equal(`${ccContext}/add-transportation-details-truck/abc-123`);
    });

    it("should fall back to how-does-the-export-leave-the-uk when vehicle is undefined", () => {
      const transport: ITransport = { vehicle: undefined as any, id: "abc-123" };
      const result = progressTableDataBuilder(false, false, baseProgress, transport);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const row = transportSection?.rows.find((r) => r.testId === "transportDetails");

      expect(row?.url).to.equal(`${ccContext}/how-does-the-export-leave-the-uk`);
    });

    it("should fall back to how-does-the-export-leave-the-uk when id is undefined", () => {
      const transport: ITransport = { vehicle: "truck", id: undefined };
      const result = progressTableDataBuilder(false, false, baseProgress, transport);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const row = transportSection?.rows.find((r) => r.testId === "transportDetails");

      expect(row?.url).to.equal(`${ccContext}/how-does-the-export-leave-the-uk`);
    });

    it("should fall back to how-does-the-export-leave-the-uk when both vehicle and id are undefined", () => {
      const transport: ITransport = { vehicle: undefined as any, id: undefined };
      const result = progressTableDataBuilder(false, false, baseProgress, transport);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const row = transportSection?.rows.find((r) => r.testId === "transportDetails");

      expect(row?.url).to.equal(`${ccContext}/how-does-the-export-leave-the-uk`);
    });

    it("should fall back to how-does-the-export-leave-the-uk when transport itself is undefined", () => {
      const result = progressTableDataBuilder(false, false, baseProgress, undefined as any);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const row = transportSection?.rows.find((r) => r.testId === "transportDetails");

      expect(row?.url).to.equal(`${ccContext}/how-does-the-export-leave-the-uk`);
    });

    it("should not produce a URL containing 'undefined' when vehicle or id are missing", () => {
      const transport: ITransport = { vehicle: undefined as any, id: undefined };
      const result = progressTableDataBuilder(false, false, baseProgress, transport);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const row = transportSection?.rows.find((r) => r.testId === "transportDetails");

      expect(row?.url).not.to.contain("undefined");
    });

    it("should use do-you-have-additional-transport-types when transportDetails is COMPLETED", () => {
      const progress = { ...baseProgress, transportDetails: ProgressStatus.COMPLETED };
      const result = progressTableDataBuilder(false, false, progress, baseTransport);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const row = transportSection?.rows.find((r) => r.testId === "transportDetails");

      expect(row?.url).to.equal(`${ccContext}/do-you-have-additional-transport-types`);
    });
  });

  describe("Transport section - row visibility", () => {
    it("should include the transportType row when transportDetails is CANNOT START", () => {
      const progress = { ...baseProgress, transportDetails: ProgressStatus.CANNOT_START };
      const result = progressTableDataBuilder(false, false, progress, baseTransport);
      const transportSection = result.find((s) => s.testId === "Transportation");
      const transportTypeRow = transportSection?.rows.find((r) => r.testId === "transportType");

      expect(transportTypeRow).to.not.equal(undefined);
      expect(transportTypeRow?.url).to.equal(`${ccContext}/do-you-have-additional-transport-types`);
    });

    it("should NOT include the transportType row when transportDetails is INCOMPLETE", () => {
      const result = progressTableDataBuilder(false, false, baseProgress, baseTransport);
      const transportSection = result.find((s) => s.testId === "Transportation");

      expect(transportSection?.rows.find((r) => r.testId === "transportType")).to.equal(undefined);
    });

    it("should omit both transport rows entirely when directLanding is true", () => {
      const result = progressTableDataBuilder(false, true, baseProgress, baseTransport);
      const transportSection = result.find((s) => s.testId === "Transportation");

      expect(transportSection?.rows.find((r) => r.testId === "transportDetails")).to.equal(undefined);
      expect(transportSection?.rows.find((r) => r.testId === "transportType")).to.equal(undefined);
    });
  });

  describe("Products and Landings section", () => {
    it("should include a dataUpload row when dataUpload is true", () => {
      const result = progressTableDataBuilder(true, false, baseProgress, baseTransport);
      const productSection = result.find((s) => s.testId === "ProductsAndLandings");
      const dataUploadRow = productSection?.rows.find((r) => r.testId === "dataUpload");

      expect(dataUploadRow).to.not.equal(undefined);
      expect(dataUploadRow?.url).to.equal(`${ccContext}/upload-file`);
    });

    it("should NOT include a dataUpload row when dataUpload is false", () => {
      const result = progressTableDataBuilder(false, false, baseProgress, baseTransport);
      const productSection = result.find((s) => s.testId === "ProductsAndLandings");

      expect(productSection?.rows.find((r) => r.testId === "dataUpload")).to.equal(undefined);
    });

    it("should use direct-landing URL for landings when directLanding is true", () => {
      const result = progressTableDataBuilder(false, true, baseProgress, baseTransport);
      const productSection = result.find((s) => s.testId === "ProductsAndLandings");
      const landingsRow = productSection?.rows.find((r) => r.testId === "landings");

      expect(landingsRow?.url).to.equal(`${ccContext}/direct-landing`);
    });

    it("should use add-landings URL for landings when directLanding is false", () => {
      const result = progressTableDataBuilder(false, false, baseProgress, baseTransport);
      const productSection = result.find((s) => s.testId === "ProductsAndLandings");
      const landingsRow = productSection?.rows.find((r) => r.testId === "landings");

      expect(landingsRow?.url).to.equal(`${ccContext}/add-landings`);
    });
  });

  describe("Exporter section", () => {
    it("should always include the exporter and yourReference rows", () => {
      const result = progressTableDataBuilder(false, false, baseProgress, baseTransport);
      const exporterSection = result.find((s) => s.testId === "Exporter");

      expect(exporterSection?.rows.find((r) => r.testId === "exporter")).to.not.equal(undefined);
      expect(exporterSection?.rows.find((r) => r.testId === "yourReference")).to.not.equal(undefined);
    });

    it("should pass errors through to relevant rows", () => {
      const errors = {
        exporter: { key: "exporter", message: "Exporter error", fieldId: "exporter-error" },
      };
      const result = progressTableDataBuilder(false, false, baseProgress, baseTransport, errors);
      const exporterSection = result.find((s) => s.testId === "Exporter");
      const exporterRow = exporterSection?.rows.find((r) => r.testId === "exporter");

      expect(exporterRow?.error).to.deep.equal(errors.exporter);
    });
  });
});
