import { useEffect, type RefObject } from "react";

// The dcx Tab renders <a href="#tabId"> without preventing the default action, so after React swaps
// the panel the browser also jumps to the hash target, which reads as a flicker. Stop the jump and
// keep the hash in the URL without scrolling.
export const useKeepScrollOnTabClick = (containerRef: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onClick = (event: MouseEvent) => {
      const tab = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[role="tab"]') : null;
      if (!tab) return;

      event.preventDefault();
      window.history.replaceState(window.history.state, "", tab.hash);
    };

    container.addEventListener("click", onClick);
    return () => container.removeEventListener("click", onClick);
  }, [containerRef]);
};
