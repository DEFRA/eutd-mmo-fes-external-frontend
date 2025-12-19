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
  errors,
  legendTitle,
  displayOptionalSuffix,
  countries,
}: ITransport & {
  legendTitle?: string;
  errors: IErrorsTransformed;
  displayOptionalSuffix?: boolean;
  countries?: ICountry[];
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
      displayOptionalSuffix={displayOptionalSuffix}
      errors={errors}
      countries={countries ?? []}
    />
  </fieldset>
);
