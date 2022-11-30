import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {boolean} enabled - Indicates passwords are enabled, so the API accepts login attempts using passwords.
 * @property {number} min_password_length - The minimum password length.
 */
interface PasswordConfig {
  enabled: boolean;
  min_password_length: number;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {boolean} require_verification - Indicates that email addresses must be verified.
 * @property {boolean} max_num_of_addresses - The maximum number of email addresses a user can have.
 */
interface EmailConfig {
  require_verification: boolean;
  max_num_of_addresses: boolean;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {PasswordConfig} password - The password configuration.
 */
interface Config {
  password: PasswordConfig;
  emails: EmailConfig;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string} credential_id - The ID of the credential that was used.
 * @property {string} user_id - The ID of the user that was used.
 */
interface WebauthnFinalized {
  credential_id: string;
  user_id: string;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string} id - The UUID of the user.
 * @property {boolean} verified - Indicates whether the user's email address is verified.
 * @property {string} email_id - The UUID of the email address.
 * @property {boolean} has_webauthn_credential - Indicates that the user has registered a WebAuthn credential in the past.
 */
interface UserInfo {
  id: string;
  verified: boolean;
  email_id: string;
  has_webauthn_credential: boolean;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string} id - The UUID of the current user.
 * @ignore
 */
interface Me {
  id: string;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string} id - The WebAuthn credential ID.
 */
interface Credential {
  id: string;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string} id - The user's UUID.
 * @property {string} email - The user's email.
 * @property {Credential[]} webauthn_credentials - A list of credentials that have been registered.
 */
interface User {
  id: string;
  webauthn_credentials: Credential[];
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string} id - The UUID of the passcode.
 * @property {number} ttl - How long the code is active in seconds.
 */
interface Passcode {
  id: string;
  ttl: number;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string[]} transports - A list of WebAuthn AuthenticatorTransport, e.g.: "usb", "internal",...
 * @ignore
 */
interface Attestation extends PublicKeyCredentialWithAttestationJSON {
  transports: string[];
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {string} id - The UUID of the email address.
 * @property {string} address - The email address.
 * @property {boolean} is_verified - Indicates whether the email address is verified.
 * @property {boolean} is_primary - Indicates it's the primary email address.
 */
interface Email {
  id: string;
  address: string;
  is_verified: boolean;
  is_primary: boolean;
}

/**
 * @interface
 * @category SDK
 * @subcategory DTO
 * @property {Email[]} - A list of emails assigned to the current user.
 */
interface Emails extends Array<Email> {}

export type {
  PasswordConfig,
  Config,
  WebauthnFinalized,
  Credential,
  UserInfo,
  Me,
  User,
  Email,
  Emails,
  Passcode,
  Attestation,
};
