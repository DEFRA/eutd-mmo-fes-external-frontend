import { Outlet } from "react-router";

// Layout route for add-transportation-details-plane
// Required for v3_relativeSplatPath compatibility
// Child route: add-transportation-details-plane.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddTransportationDetailsPlaneLayout() {
  return <Outlet />;
}
