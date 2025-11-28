import type { ExporterAddressStep, ICountry, ILookUpAddressDetails, ProcessingStatement } from "~/types";

export const createResponseData = (
  documentNumber: string,
  session: any,
  countries: ICountry[],
  processingStatementData: ProcessingStatement,
  postcodeData?: {
    postcode: string;
    currentStep: ExporterAddressStep;
    postcodeaddress?: ILookUpAddressDetails;
    postcodeaddresses?: ILookUpAddressDetails[];
  }
) => {
  const baseData = {
    documentNumber,
    countries,
    csrf: session.get("csrf"),
    plantAddressOne: processingStatementData.plantAddressOne,
    plantTownCity: processingStatementData.plantTownCity,
    plantPostcode: processingStatementData.plantPostcode,
    plantName: processingStatementData.plantName,
  };

  if (postcodeData) {
    return {
      ...baseData,
      currentStep: postcodeData.currentStep,
      postcode: postcodeData.postcode,
      postcodeaddress: postcodeData.postcodeaddress,
      postcodeaddresses: postcodeData.postcodeaddresses,
    };
  }

  return {
    ...baseData,
    currentStep: session.get("currentStep"),
  };
};
