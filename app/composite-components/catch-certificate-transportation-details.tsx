import { TransportationModeDetails } from "./transportationDetails";
import type { ICountry, IErrorsTransformed, ITransport } from "~/types";

export const CatchCertificateTransportationDetails = ({
  vehicle,
  vesselName,
  flagState,
  flightNumber,
  containerNumber,
  nationalityOfVehicle,
  registrationNumber,
  railwayBillNumber,
  departurePlace,
  freightBillNumber,
  containerIdentificationNumber,
  containerNumbers,
  errors,
  legendTitle,
  displayOptionalSuffix,
  countries,
  airwayBillNumber,
  maximumNumberOfContainerNumbers,
}: ITransport & {
  legendTitle?: string;
  errors: IErrorsTransformed;
  displayOptionalSuffix?: boolean;
  countries?: ICountry[];
  maximumNumberOfContainerNumbers: number;
}) => (
  <fieldset className="govuk-fieldset">
    <TransportationModeDetails
      legendTitle={legendTitle}
      vehicle={vehicle}
      vesselName={vesselName}
      flagState={flagState}
      flightNumber={flightNumber}
      containerNumber={containerNumber}
      nationalityOfVehicle={nationalityOfVehicle}
      registrationNumber={registrationNumber}
      railwayBillNumber={railwayBillNumber}
      departurePlace={departurePlace}
      freightBillNumber={freightBillNumber}
      containerIdentificationNumber={containerIdentificationNumber}
      containerNumbers={containerNumbers}
      displayOptionalSuffix={displayOptionalSuffix}
      maximumNumberOfContainerNumbers={maximumNumberOfContainerNumbers}
      errors={errors}
      countries={countries ?? []}
      useBoldLabels={true}
      airwayBillNumber={airwayBillNumber}
    />
  </fieldset>
);
