import { Outlet } from "react-router";

// Layout route for do-you-have-a-road-transport-document
// Required for v3_relativeSplatPath compatibility
// Child route: do-you-have-a-road-transport-document.$.tsx handles the splat parameter
/* istanbul ignore next */
export default function DoYouHaveARoadTransportDocumentLayout() {
  return <Outlet />;
}
