export const formatAddress = (...adresssLines: (string | null | undefined)[]) =>
  adresssLines
    .filter((addressLine: string | null | undefined) => addressLine)
    .map((addressLine) => (
      <div key={`address-${addressLine}`}>
        {addressLine}
        <br />
      </div>
    ));
