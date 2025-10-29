export const getMeta = (data: any) => {
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

export const getDashboardMeta = (data: any) => {
  const { pageTitle } = data ?? {};
  return [
    { charSet: "utf-8" },
    { title: pageTitle },
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
