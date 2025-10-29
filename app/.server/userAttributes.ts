import { get, post } from "~/communication.server";
import { USER_ATTRIBUTES } from "~/urls.server";
import type { UserAttribute, UserAttributePayload } from "~/types";

export const getAllUserAttributes = async (bearerToken: string): Promise<UserAttribute[]> => {
  const response: Response = await get(bearerToken, USER_ATTRIBUTES);
  return await response.json();
};

export const saveUserAttribute = async (bearerToken: string, payload: UserAttributePayload) => {
  const response: Response = await post(bearerToken, USER_ATTRIBUTES, {}, { ...payload });
  return onSaveUserAttributesResponse(response);
};

const onSaveUserAttributesResponse = async (response: Response): Promise<{ key: string; value: boolean }> => {
  switch (response.status) {
    case 200:
    case 204:
      return await response.json();
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
};

export const isPrivacyAccepted = (userAttributes: UserAttribute[] = []) =>
  userAttributes.find(({ name }) => name === "privacy_statement")?.value;

export const isAcceptedCookies = (userAttributes: UserAttribute[] = []) =>
  userAttributes.find(({ name }) => name === "accepts_cookies")?.value === "yes";

export const isAcceptedCookiesAvailable = (userAttributes: UserAttribute[] = []) =>
  userAttributes.find(({ name }) => name === "accepts_cookies")?.value;
