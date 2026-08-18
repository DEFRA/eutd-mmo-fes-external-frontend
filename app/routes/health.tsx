import * as React from "react";
import { Main, Title } from "~/components";
const Health = () => (
  <Main showHelpLink={false}>
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-full">
        <Title title="This is a devOps page to test frontDoor" />
      </div>
    </div>
  </Main>
);
export default Health;
