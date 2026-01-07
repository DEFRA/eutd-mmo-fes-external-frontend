import { Outlet } from "react-router";

// Layout route for add-additional-transport-documents-train
// Required for v3_relativeSplatPath compatibility
// Child route: add-additional-transport-documents-train.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function AddAdditionalTransportDocumentsTrainLayout() {
  return <Outlet />;
}
