import { Outlet } from "react-router";
// Only the leaf routes (index / splat) own the action so useActionData works in each child component
export { loader } from "./create-processing-statement.$documentNumber.add-consignment-details._index";

/* istanbul ignore next */
export default function AddConsignmentDetails() {
  return <Outlet />;
}
