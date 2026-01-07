import { Outlet } from "react-router";

// Layout route for add-additional-transport-documents-container-vessel
// Required for v3_relativeSplatPath compatibility
// Child route: add-additional-transport-documents-container-vessel.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddAdditionalTransportDocumentsContainerVesselLayout() {
  return <Outlet />;
}
