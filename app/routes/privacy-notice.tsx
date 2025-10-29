import * as React from "react";
import { Main } from "~/components";
import { PrivacyNotice } from "~/composite-components";

const Privacy = () => (
  <Main showHelpLink={false}>
    <PrivacyNotice />
  </Main>
);

export default Privacy;
