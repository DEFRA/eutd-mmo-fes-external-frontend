import { Outlet } from "react-router";

// Layout route for add-transportation-details-truck
// Required for v3_relativeSplatPath compatibility
// Child route: add-transportation-details-truck.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddTransportationDetailsTruckLayout() {
  return <Outlet />;
}
