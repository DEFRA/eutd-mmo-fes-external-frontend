import { TransportationModeDetails } from "./transportationDetails";
import type { IErrorsTransformed, ITransport } from "~/types";

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
  errors,
  legendTitle,
  displayOptionalSuffix,
}: ITransport & { legendTitle?: string; errors: IErrorsTransformed; displayOptionalSuffix?: boolean }) => (
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
      displayOptionalSuffix={displayOptionalSuffix}
      errors={errors}
    />
  </fieldset>
);
