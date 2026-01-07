import type { MetaArgs, MetaInputData, MetaTag } from "~/types";
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasDataProperty(value: unknown): value is { data: unknown } {
  return isObject(value) && Object.prototype.hasOwnProperty.call(value, "data");
}

export const getMeta = (argsOrData?: MetaArgs): MetaTag[] => {
  const data = (hasDataProperty(argsOrData) ? argsOrData.data : argsOrData) as MetaInputData;
  const { pageTitle, commonTitle } = data ?? {};
  return [
    { charSet: "utf-8" },
    { title: `${pageTitle} - ${commonTitle}` },
    {
      property: "viewport",
      content: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
    {
      property: "themeColor",
      content: "#0b0c0c",
    },
  ];
};

export const getDashboardMeta = (argsOrData?: MetaArgs): MetaTag[] => {
  const data = (hasDataProperty(argsOrData) ? argsOrData.data : argsOrData) as MetaInputData;
  const { pageTitle } = data ?? {};
  return [
    { charSet: "utf-8" },
    { title: pageTitle ?? "" },
    {
      property: "viewport",
      content: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
    {
      property: "themeColor",
      content: "#0b0c0c",
    },
  ];
};
