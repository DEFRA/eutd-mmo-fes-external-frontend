import * as msal from "@azure/msal-node";
import querystring from "querystring";
import { getEnv } from "~/env.server";

const ENV = getEnv();

export const enrolmentStatus = {
  incomplete: 1,
  pending: 2,
  completeApproved: 3,
  completeRejected: 4,
};

export const roleId = {
  employee: "1eb54ab1-58b7-4d14-bf39-4f3e402616e8",
  employer: "35a23b91-ec62-41ea-b5e5-c59b689ff0b4",
  agent: "caaf4df7-0229-e811-a831-000d3a2b29f8",
  agentCustomer: "776e1b5a-1268-e811-a83b-000d3ab4f7af",
  citizen: "3fc7e717-0b90-e811-a845-000d3ab4fddf",
};

const validateResponse = (data: any) => {
  if (!Array.isArray(data.value)) {
    throw new Error("response has unrecognised JSON");
  }
};

const parseContactAccountLinksResponse = (data: any) => {
  validateResponse(data);

  if (!data) {
    return;
  }

  const links = data.value.map((link: any) => ({
    accountId: link._record2id_value,
    accountName: link.name,
  }));

  return links;
};

const parseEnrolmentsRequestResponse = (data: any) => {
  validateResponse(data);

  data = Array.isArray(data.value) ? data.value : [data];

  // Put into databuckets
  const databuckets = data.map((d: any) => ({
    connectionDetailsId: d["_defra_connectiondetail_value"],
    accountId: d["_defra_organisation_value"],
  }));

  return databuckets;
};

const buildUrl = (endpoint: string, params?: any) =>
  ENV.DYNAMICS_RESOURCEURL + ENV.DYNAMICS_ENDPOINTBASE + endpoint + (params ? "?" + querystring.stringify(params) : "");

const getDynamicsContactAccountUrl = (contactId: string) => {
  const params = {
    $filter: `_record1id_value eq ${contactId}`,
  };

  const roleIds = [roleId.citizen, roleId.employee, roleId.agentCustomer];

  params.$filter += ` and ( ${roleIds.map((roleId) => `_record1roleid_value eq ${roleId}`).join(" or ")} ) `;

  return buildUrl("connections", params);
};

const getEnrolmentsRequestsUrl = (serviceId: string, contactId: string) => {
  const filter = [`_defra_service_value eq ${serviceId}`, `_defra_serviceuser_value eq ${contactId}`];

  filter.push("statuscode eq 1");

  const params = {
    $filter: filter.join(" and "),
  };

  return buildUrl("defra_lobserviceuserlinkrequests", params);
};

const getCreateEnrolmentUrl = () => buildUrl("defra_lobserviceuserlinks");

export const getDynamicsHeader = (token: string) => ({
  headers: {
    Authorization: "Bearer " + token,
    Accept: "application/json",
    "Cache-Control": "no-cache",
    "Content-Type": "application/json; charset=utf-8",
    "OData-MaxVersion": "4.0",
    "OData-Version": "4.0",
    Prefer: 'odata.maxpagesize=500, odata.include-annotations="*"',
  },
});

export const getDynamicsToken = (): Promise<string> =>
  new Promise((resolve, reject) => {
    // Build URL scoping to the AAD tenant
    const authUrl = ENV.AAD_AUTHHOST + "/" + ENV.AAD_TENANTNAME;
    // Following credentials are for the AAD used to authenticate the B2C Dynamics
    const clientId = ENV.DYN_AADCLIENTID; // config.dynamics.clientId
    const clientSecret = ENV.DYN_AADCLIENTSECRET;
    const resourceUrl = ENV.DYNAMICS_RESOURCEURL;

    const config = {
      auth: {
        clientId,
        authority: authUrl,
        clientSecret,
      },
    };

    const context = new msal.ConfidentialClientApplication(config);
    const clientCredentialRequest = {
      scopes: [resourceUrl + "/.default"],
    };

    context
      .acquireTokenByClientCredential(clientCredentialRequest)
      .then((response: msal.AuthenticationResult | null) => {
        if (response === null || response === undefined) {
          reject(new Error("Empty response from Active Directory"));
        } else {
          resolve(response.accessToken);
        }
      })
      .catch(() => {
        reject(new Error("Could not access Active Directory auth token"));
      });
  });

export const getDynamicsContactAccountLinks = async (contactId: string, dynamicsToken: string): Promise<any[]> => {
  const url = getDynamicsContactAccountUrl(contactId);
  const response: Response = await fetch(url, getDynamicsHeader(dynamicsToken));
  const data = await response.json();
  return parseContactAccountLinksResponse(data);
};

export const getEnrolmentRequests = async (
  serviceId: string,
  contactId: string,
  dynamicsToken: string
): Promise<any[]> => {
  const url = getEnrolmentsRequestsUrl(serviceId, contactId);
  const response: Response = await fetch(url, getDynamicsHeader(dynamicsToken));
  const data = await response.json();
  return parseEnrolmentsRequestResponse(data);
};

export const createEnrolment = async (
  contactId: string,
  dynamicsToken: string,
  connectionDetailsId: string,
  enrolmentStatus: number,
  organisationAccountId?: string,
  lobServiceId?: string,
  lobServiceRoleId?: string,
  verified: boolean = false
): Promise<any> => {
  if (!lobServiceRoleId || !lobServiceId) {
    throw new Error("Either lobServiceRoleId or lobServiceId should be supplied");
  }

  const payload: any = {
    "defra_connectiondetail@odata.bind": `/defra_connectiondetailses(${connectionDetailsId})`,
    "defra_ServiceUser@odata.bind": `/contacts(${contactId})`,
    defra_enrolmentstatus: enrolmentStatus,
    defra_verified: verified,
  };

  if (organisationAccountId) {
    payload["defra_Organisation@odata.bind"] = `/accounts(${organisationAccountId})`;
  }

  if (lobServiceRoleId) {
    payload["defra_ServiceRole@odata.bind"] = `/defra_lobserivceroles(${lobServiceRoleId})`;
  }

  if (lobServiceId) {
    payload["defra_service@odata.bind"] = `/defra_lobservices(${lobServiceId})`;
  }

  const url = getCreateEnrolmentUrl();
  const response: Response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + dynamicsToken,
      Accept: "application/json",
      "Cache-Control": "no-cache",
      "Content-Type": "application/json; charset=utf-8",
      "OData-MaxVersion": "4.0",
      "OData-Version": "4.0",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ ...payload }),
  });

  return await response.json();
};
