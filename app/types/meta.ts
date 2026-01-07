export type MetaInputData = { pageTitle?: string; commonTitle?: string } | undefined;

export type MetaArgs = { data?: MetaInputData } | MetaInputData | undefined;

export type MetaTag = { charSet: string } | { title: string } | { property: string; content: string };
