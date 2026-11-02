const hasValue = (value: string | undefined): value is string => typeof value === "string" && value.trim().length > 0;

export const hasApimHeaderConfig = (apimHeaderName: string | undefined, apimHeaderValue: string | undefined): boolean =>
  hasValue(apimHeaderName) && hasValue(apimHeaderValue);

export const buildSearchRequestHeaders = (
  token: string,
  apimHeaderName: string | undefined,
  apimHeaderValue: string | undefined
): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  ...(hasApimHeaderConfig(apimHeaderName, apimHeaderValue)
    ? { [apimHeaderName as string]: apimHeaderValue as string }
    : {}),
});
