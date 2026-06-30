import { createContext, useContext } from "react";

/**
 * Holds the per-request CSP nonce so that React Router's inline scripts
 * (rendered by <Scripts /> and <ScrollRestoration />) can be tagged with the
 * same nonce that is set in the Content-Security-Policy header. On the client
 * the provider is absent, so the default empty value is used (the inline
 * scripts are only rendered during SSR).
 */
export const NonceContext = createContext<string>("");

export const NonceProvider = NonceContext.Provider;

export const useNonce = (): string => useContext(NonceContext);
