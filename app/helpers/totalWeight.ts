import type { ProductLanded, ProductsLanded } from "~/types";

export const totalWeight = (exportPayload: ProductsLanded) => {
  if (exportPayload.items !== undefined) {
    return exportPayload.items.reduce((accum: number, cur: ProductLanded) => {
      if (cur.landings && cur.landings.length > 0) {
        accum += cur.landings.reduce((accum1, cur1) => {
          if (cur1.model && !isNaN(cur1.model.exportWeight)) {
            accum1 += Number(cur1.model.exportWeight);
          }
          return accum1;
        }, 0);
      }
      return accum;
    }, 0);
  }
};
