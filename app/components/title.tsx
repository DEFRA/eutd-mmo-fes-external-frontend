type TitleProps = {
  title: string;
  className?: string;
  dataTestId?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

export const Title = ({ title, className, dataTestId, level = "h1" }: TitleProps) => {
  const HeadingTag = level;
  return (
    <HeadingTag className={["govuk-heading-xl", className].join(" ")} data-testid={dataTestId}>
      {title}
    </HeadingTag>
  );
};
