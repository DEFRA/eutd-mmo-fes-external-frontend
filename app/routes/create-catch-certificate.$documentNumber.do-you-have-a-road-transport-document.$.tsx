import * as React from "react";
import type {
  LoaderFunction,
  ActionFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import type { ErrorResponse } from "~/types";
import { useLoaderData, useLocation } from "@remix-run/react";
import { DoYouHaveARoadTransportDocumentForm } from "~/composite-components";
import { DoYouAHaveRoadTransportDocumentAction, DoYouAHaveRoadTransportDocumentLoader } from "~/models";
import { getMeta } from "~/helpers";

export const meta: MetaFunction = ({ data }) => getMeta(data);
export const loader: LoaderFunction = async ({ request, params }: LoaderFunctionArgs) =>
  DoYouAHaveRoadTransportDocumentLoader(request, params);

export const action: ActionFunction = async ({
  request,
  params,
}: ActionFunctionArgs): Promise<Response | ErrorResponse | undefined> =>
  DoYouAHaveRoadTransportDocumentAction(request, params);

const DoYouHaveARoadTransportDocument = () => {
  const location = useLocation();
  const { transportId } = useLoaderData<typeof loader>();

  // we need to pass the current URL in to this component to workaround a bug in Remix/React Router where
  // splat paths are not resolved automatically
  // see https://remix.run/docs/en/main/hooks/use-resolved-path#splat-paths
  return (
    <DoYouHaveARoadTransportDocumentForm
      backUrl={`/create-catch-certificate/:documentNumber/how-does-the-export-leave-the-uk/${transportId}`}
      progressUri="/create-catch-certificate/:documentNumber/progress"
      actionUri={location.pathname}
    />
  );
};

export default DoYouHaveARoadTransportDocument;
