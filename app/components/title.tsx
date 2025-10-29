type TitleProps = {
  title: string;
  className?: string;
  dataTestId?: string;
};

export const Title = ({ title, className, dataTestId }: TitleProps) => (
  <h1 className={["govuk-heading-xl", className].join(" ")} data-testid={dataTestId}>
    {title}
  </h1>
);
