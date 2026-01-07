import { Outlet } from "react-router";

// Layout route for add-additional-transport-documents-plane
// Required for v3_relativeSplatPath compatibility
// Child route: add-additional-transport-documents-plane.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddAdditionalTransportDocumentsPlaneLayout() {
  return <Outlet />;
}
