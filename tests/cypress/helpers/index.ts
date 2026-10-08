export const getData = (links: JQuery<HTMLElement>): Array<{ text: string; href: string }> =>
  links
    .map((i, el) => ({
      text: Cypress.$(el).text(),
      href: Cypress.$(el).attr("href"),
    }))
    // Chain the jQuery .get() method on the end to unwrap jQuery objects
    .get();

// Mirrors the encode/decode used by Remix's createCookie() (see @remix-run/server-runtime/cookies)
export const encodeRemixCookie = (value: unknown): string => {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  return btoa(String.fromCharCode(...bytes));
};

export const decodeRemixCookie = <T = unknown>(value: string): T => {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
};
