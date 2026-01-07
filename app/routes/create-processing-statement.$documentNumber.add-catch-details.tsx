import { Outlet } from "react-router";

// Layout route for add-catch-details (Processing Statement)
// Required for v3_relativeSplatPath compatibility
// Child route: add-catch-details.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddCatchDetailsLayout() {
  return <Outlet />;
}
