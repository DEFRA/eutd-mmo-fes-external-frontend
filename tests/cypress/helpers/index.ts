export const getData = (links: JQuery<HTMLElement>): Array<{ text: string; href: string }> =>
  links
    .map((i, el) => ({
      text: Cypress.$(el).text(),
      href: Cypress.$(el).attr("href"),
    }))
    // Chain the jQuery .get() method on the end to unwrap jQuery objects
    .get();
