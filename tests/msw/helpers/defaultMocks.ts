import { rest } from "msw";
import server from "../server";
import {
  NOTIFICATION_URL,
  COUNTRIES_URL,
  getAddExporterDetailsUrl,
  USER_ATTRIBUTES,
  COMMODITY_CODES,
  mockGetIdmUserDetails,
  mockGetIdmAddressDetails,
} from "~/urls.server";

import empty from "@/fixtures/empty.json";
import countries from "@/fixtures/referenceDataApi/countries.json";
import dynamixUserDetails from "@/fixtures/dynamixApi/userDetails.json";
import dynamixAddresses from "@/fixtures/dynamixApi/addresses.json";
import userAttributes from "@/fixtures/userAttributesApi/getUserAttributes.json";
import commodities from "@/fixtures/referenceDataApi/commodites.json";

const setupDefaultMocks = () =>
  [
    rest.get(NOTIFICATION_URL, (req, res, ctx) => res(ctx.status(204))),
    rest.get(COUNTRIES_URL, (req, res, ctx) => res(ctx.json(countries))),
    rest.get(getAddExporterDetailsUrl("catchCertificate"), (req, res, ctx) => res(ctx.json(empty))),
    rest.get(getAddExporterDetailsUrl(null), (req, res, ctx) => res(ctx.json(empty))),
    rest.get(mockGetIdmUserDetails, (req, res, ctx) => res(ctx.json(dynamixUserDetails))),
    rest.get(mockGetIdmAddressDetails, (req, res, ctx) => res(ctx.json(dynamixAddresses))),
    rest.get(USER_ATTRIBUTES, (req, res, ctx) => res(ctx.json(userAttributes))),
    rest.get(COMMODITY_CODES, (req, res, ctx) => res(ctx.json(commodities))),
    rest.get(
      "https://your-account.cpdev.cui.defra.gov.uk/idphub/b2c/b2c_1a_cui_cpdev_signupsignin/.well-known/openid-configuration",
      (req, res, ctx) => res(ctx.status(204))
    ),
  ].forEach((mock) => server.instance.use(mock));

export default setupDefaultMocks;
