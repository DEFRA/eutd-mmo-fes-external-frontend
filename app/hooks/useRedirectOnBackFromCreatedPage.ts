import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Redirects to the dashboard if the user presses back from a created page and the document is completed.
 * @param status The document status (should be "Completed" to trigger redirect)
 * @param dashboardPath The path to redirect to (dashboard)
 */
export function useRedirectOnBackFromCreatedPage(status: string, dashboardPath: string) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status !== "COMPLETE") return;

    // Listen for browser back navigation
    const handlePopState = () => {
      // Only redirect if user is on the created page
      if (location.pathname.endsWith("-created")) {
        navigate(dashboardPath, { replace: true });
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [status, dashboardPath, location.pathname, navigate]);
}
