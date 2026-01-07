import { Outlet } from "react-router";

// Layout route for add-transportation-details-container-vessel
// Required for v3_relativeSplatPath compatibility
// Child route: add-transportation-details-container-vessel.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddTransportationDetailsContainerVesselLayout() {
  return <Outlet />;
}
