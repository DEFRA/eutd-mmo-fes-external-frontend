import { useSyncExternalStore } from "react";

/**
 * Custom hook to detect if the component has hydrated on the client.
 * This is a React Router v7 compatible alternative to remix-utils useIsHydrated()
 *
 * Returns false during SSR and on initial client render (to match server HTML),
 * then true after hydration completes.
 *
 * Uses useSyncExternalStore with proper server/client snapshot handling.
 */

// Track if we've subscribed (meaning we're on the client after hydration)
let isHydrating = true;

function subscribe(callback: () => void) {
  // First subscription means hydration is complete
  isHydrating = false;
  // Notify that we've hydrated
  callback();
  return () => {};
}

export function useIsHydrated() {
  const isHydrated = useSyncExternalStore(
    subscribe,
    () => !isHydrating, // getSnapshot: false during hydration, true after
    () => false // getServerSnapshot: always false on server
  );

  return isHydrated;
}
