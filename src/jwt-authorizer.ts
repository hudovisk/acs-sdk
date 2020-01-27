import { sign as jwtSign } from "jsonwebtoken";
import { JWTTokenRefresher } from "./jwt-token-refresher";
import HttpClient from "./http-client";

// https://www.adobe.io/authentication/auth-methods.html#!AdobeDocs/adobeio-auth/master/JWT/Scopes.md#experience-cloud
export type Metascope = "ent_campaign_sdk";

export interface JWTAuthorizerCredentials {
  clientId: string;
  clientSecret: string;
  adobeOrgId: string;
  technicalAccountId: string;
  privateKey: string;
  metascopes: Metascope[];
}

// 15 minutes
const DEFAULT_EXPIRATION_PERIOD_IN_SECONDS = 15 * 60;

export class JWTAuthorizer {
  private jwtTokenRefresher: JWTTokenRefresher;
  private accessTokenRefresher: JWTTokenRefresher;
  private httpClient: HttpClient;

  constructor(
    private credentials: JWTAuthorizerCredentials,
    private expirationPeriodInSeconds = DEFAULT_EXPIRATION_PERIOD_IN_SECONDS,
    httpClient?: HttpClient
  ) {
    this.httpClient = httpClient || new HttpClient();
    this.jwtTokenRefresher = new JWTTokenRefresher(this.onRefreshJWTToken);
    this.accessTokenRefresher = new JWTTokenRefresher(this.onRefreshAccessToken);
  }

  async getAuthenticatedCredentials() {
    const accessToken = await this.accessTokenRefresher.getToken();
    return { accessToken, clientId: this.credentials.clientId };
  }

  /**
   * Refresh JWT Token logic
   */
  private onRefreshJWTToken = async () => {
    const { adobeOrgId, clientId, metascopes, privateKey, technicalAccountId } = this.credentials;
    const metascopesPayload = this.getMetascopesPayload(metascopes);
    const expiration = Date.now() / 1000 + this.expirationPeriodInSeconds;
    const payload = {
      iss: adobeOrgId,
      sub: technicalAccountId,
      aud: `https://ims-na1.adobelogin.com/c/${clientId}`,
      ...metascopesPayload,
      exp: expiration
    };

    const token = jwtSign(payload, privateKey, { algorithm: "RS256" });

    return token;
  };

  /**
   * Refresh Access Token logic
   */
  private onRefreshAccessToken = async () => {
    const jwtToken = await this.jwtTokenRefresher.getToken();
    const payload = {
      client_id: this.credentials.clientId,
      client_secret: this.credentials.clientSecret,
      jwt_token: jwtToken
    };

    const { body } = await this.httpClient.post("https://ims-na1.adobelogin.com/ims/exchange/jwt", {
      qs: payload,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });

    return body.access_token;
  };

  /**
   * Transforms an array of metascopes to the proper format for the
   * JWT Token
   *
   * @param metascopes
   */
  private getMetascopesPayload(metascopes: Metascope[]): Record<string, boolean> {
    return metascopes.reduce((acc: any, metascope) => {
      acc[`https://ims-na1.adobelogin.com/s/${metascope}`] = true;
      return acc;
    }, {});
  }
}
