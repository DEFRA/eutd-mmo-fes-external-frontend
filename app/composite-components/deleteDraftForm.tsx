import { useActionData, useLoaderData } from "@remix-run/react";
import { Main, ErrorSummary } from "~/components";
import { displayErrorMessages } from "~/helpers";
import type { Journey } from "~/types";
import isEmpty from "lodash/isEmpty";
import { DeleteDraft } from "./deleteDraft";
import { useScrollOnPageLoad } from "~/hooks";

type DeleteDraftFormProps = {
  backUrl: string;
  journey: Journey;
};

export const DeleteDraftForm = ({ backUrl, journey }: DeleteDraftFormProps) => {
  const { csrf } = useLoaderData<{ csrf: string }>();
  const { errors = {} } = useActionData<{ errors: any }>() ?? {};

  useScrollOnPageLoad();

  return (
    <Main backUrl={backUrl}>
      {!isEmpty(errors) && <ErrorSummary errors={displayErrorMessages(errors)} />}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-three-quarters">
          <DeleteDraft errors={errors} journey={journey} csrf={csrf} />
        </div>
      </div>
    </Main>
  );
};
