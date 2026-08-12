import { type LoaderFunction } from "react-router";
import { getBearerTokenForRequest } from "~/.server";
import AccessibilityView from "~/components/accessibilityView";

export const loader: LoaderFunction = async ({ request }) => await getBearerTokenForRequest(request);

const Accessibility = () => <AccessibilityView />;

export default Accessibility;
