import * as React from "react";
import { useActionData, useLoaderData } from "@remix-run/react";
import { route } from "routes-gen";
import { Main, ErrorSummary } from "~/components";
import { type ActionFunction, type LoaderFunction, type TypedResponse } from "@remix-run/node";
import { displayErrorMessages } from "~/helpers";
import { deleteDraftFormAction, deleteDraftFormLoader } from "~/.server";
import type { ErrorResponse } from "~/types";
import isEmpty from "lodash/isEmpty";
import { DeleteDraft } from "~/composite-components";
import { useScrollOnPageLoad } from "~/hooks";

export const loader: LoaderFunction = async ({ request, params }) => await deleteDraftFormLoader({ request, params });

export const action: ActionFunction = async ({
  request,
  params,
}): Promise<Response | TypedResponse<never> | ErrorResponse> =>
  await deleteDraftFormAction({
    request,
    params,
    journey: "catchCertificate",
    nextUri: route("/create-catch-certificate/catch-certificates"),
  });

const DocumentConfirmDeleteDraftPage = () => {
  const { csrf } = useLoaderData<{ csrf: string }>();
  const { errors = {} } = useActionData<{ errors: any }>() ?? {};

  useScrollOnPageLoad();

  return (
    <Main backUrl={route("/create-catch-certificate/catch-certificates")}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-three-quarters">
          <DeleteDraft errors={errors} journey="catchCertificate" csrf={csrf} />
        </div>
      </div>
    </Main>
  );
};

export default DocumentConfirmDeleteDraftPage;
