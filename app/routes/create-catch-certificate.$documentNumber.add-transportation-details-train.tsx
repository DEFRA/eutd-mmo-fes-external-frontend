import { Outlet } from "react-router";

// Layout route for add-transportation-details-train
// Required for v3_relativeSplatPath compatibility
// Child route: add-transportation-details-train.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddTransportationDetailsTrainLayout() {
  return <Outlet />;
}
