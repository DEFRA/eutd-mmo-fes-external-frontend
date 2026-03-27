export const formatAddress = (...addressLines: (string | null | undefined)[]) =>
  addressLines.filter(Boolean).map((addressLine) => (
    <div key={`address-${addressLine}`}>
      {addressLine}
      <br />
    </div>
  ));
