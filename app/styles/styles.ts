import govuk_frontend from "../../node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.css?url";
import languageStyles from "./language.css?url";
import helpLinkStyles from "./help-link.css?url";
import bannerStyles from "./banner.css?url";
import dashboardStyles from "./dashboard.css?url";
import appTask from "./app-task.css?url";
import autocomplete from "./autocomplete.css?url";
import uploadGuidanceStyles from "./upload-guidance.css?url";
import directLanding from "./directLanding.css?url";
import ReactDatePickerStyles from "./react-datepicker.css?url";
import utils from "./utils.css?url";

export const getStyles = () => [
  { rel: "stylesheet", href: govuk_frontend },
  { rel: "stylesheet", href: languageStyles },
  { rel: "stylesheet", href: helpLinkStyles },
  { rel: "stylesheet", href: bannerStyles },
  { rel: "stylesheet", href: dashboardStyles },
  { rel: "stylesheet", href: appTask },
  { rel: "stylesheet", href: autocomplete },
  { rel: "stylesheet", href: uploadGuidanceStyles },
  { rel: "stylesheet", href: directLanding },
  { rel: "stylesheet", href: ReactDatePickerStyles },
  { rel: "stylesheet", href: utils },
];
