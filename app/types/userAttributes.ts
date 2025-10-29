export type UserAttributeKey = "privacy_statement" | "language" | "accepts_cookies";

export interface UserAttribute {
  name: UserAttributeKey;
  value: string | boolean;
  modifiedAt?: string;
}

export interface UserAttributePayload {
  key: UserAttributeKey;
  value: string | boolean;
}
