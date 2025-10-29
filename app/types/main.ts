export interface IMainAppProps {
  locale: string;
  pageName: string;
  pageTitle: string;
  headerTitleKey: string;
  headerTitleTo: string;
  hideHomeLink: boolean;
  hideFavouritesLink: boolean;
  changeOrganisationUrl: string | null;
  idmLink: string;
  idmLogoutLink: string;
  idmLogoutPage: string;
  idleTimeoutInMilliseconds: number;
  disableScripts: boolean;
  applicationInsightInstrumentationKey?: string;
  applicationInsightCloudRoleName?: string;
  gtmId?: string;
  gaId?: string;
  analyticsCookieAccepted?: boolean;
  clarityProjectId?: string;
}

export type Journey = "catchCertificate" | "storageNotes" | "processingStatement";

export type LandingEntryType = "directLanding" | "manualEntry" | "uploadEntry";

export type DataLoaderResponse = Promise<Response> | Response | Promise<any> | any;

export interface INotificationBanner {
  header: string;
  messages: string[];
  className?: string;
  dataTestId?: string;
  role?: string;
}

export type SelectOption = {
  label: string;
  value: string;
};
