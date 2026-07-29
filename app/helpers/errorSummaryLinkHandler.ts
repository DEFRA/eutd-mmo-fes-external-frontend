import type { FormEvent } from "react";
import { scrollToId } from "~/helpers";

export const onErrorSummaryLinkClick = (e: FormEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const href = e.currentTarget.href;
  const index = href.indexOf("#") + 1;
  scrollToId(href.slice(index));
};
