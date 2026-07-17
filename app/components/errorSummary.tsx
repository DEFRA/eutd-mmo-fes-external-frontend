import { ErrorSummaryView, type IErrorSummaryProps } from "~/components/errorSummaryView";

export type { IErrorSummaryProps };

export const ErrorSummary = (props: React.PropsWithChildren<IErrorSummaryProps>) => <ErrorSummaryView {...props} />;
