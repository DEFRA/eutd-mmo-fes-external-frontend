import { useEffect } from "react";

interface ScrollOptions {
  top?: number;
  left?: number;
  behavior?: "smooth" | "auto";
}

export const useScrollOnPageLoad = (options: ScrollOptions = { top: 0, behavior: "smooth" }) => {
  useEffect(() => {
    window.scrollTo(options);
  }, []);
};
