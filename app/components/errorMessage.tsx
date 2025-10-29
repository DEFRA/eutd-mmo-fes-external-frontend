type errorMessageProps = {
  text: string;
  id?: string;
  visuallyHiddenText?: string;
};

export const ErrorMessage = ({ text, id, visuallyHiddenText }: errorMessageProps) => (
  <p id={id} className="govuk-error-message">
    {visuallyHiddenText && <span className="govuk-visually-hidden">{visuallyHiddenText}</span>}
    {text}
  </p>
);
