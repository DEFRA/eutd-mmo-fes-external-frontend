import { TransportationModeDetails } from "./transportationDetails";
import type { ICountry, IErrorsTransformed, ITransport } from "~/types";

export const CatchCertificateTransportationDetails = ({
  vehicle,
  vesselName,
  flagState,
  flightNumber,
  nationalityOfVehicle,
  registrationNumber,
  railwayBillNumber,
  departurePlace,
  freightBillNumber,
  containerNumbers,
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
      nationalityOfVehicle={nationalityOfVehicle}
      registrationNumber={registrationNumber}
      railwayBillNumber={railwayBillNumber}
      departurePlace={departurePlace}
      freightBillNumber={freightBillNumber}
      containerNumbers={containerNumbers}
      displayOptionalSuffix={displayOptionalSuffix}
      errors={errors}
      countries={countries ?? []}
      useBoldLabels={true}
    />
  </fieldset>
);
