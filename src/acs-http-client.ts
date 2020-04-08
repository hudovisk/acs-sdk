import { JWTAuthorizer } from "./jwt-authorizer";
import HttpClient from "./http-client";

export interface ACSClientConfig {
  orgId: string;
  orgInstanceId: string;
}

interface Profile {
  PKey: string;
  acsId: string;
  email: string;
  subscriptions: {
    href: string;
  };
}

interface Service {
  PKey: string;
  href: string;
}

interface PushDeviceInfo {
  pushPlatform: "fcm" | "gcm" | "apns";
  application: string;
  registrationToken: string;
}

export class ACSHttpClient {
  private httpClient: HttpClient;

  /**
   * https://www.adobe.io/authentication/auth-methods.html#!AdobeDocs/adobeio-auth/master/JWT/JWT.md
   *
   * @param config
   * @param httpClient
   */
  constructor(
    private config: ACSClientConfig,
    private authorizer: JWTAuthorizer,
    httpClient?: HttpClient
  ) {
    this.httpClient = httpClient || new HttpClient();
  }

  /**
   * https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/managing-transactional-messages.html
   *
   * @param eventId
   * @param email
   * @param data
   */
  async sendTransactionalEvent(eventId: string, email: string, data: Record<string, any>) {
    const headers = await this.getAuthHeaders();
    const { orgId, orgInstanceId } = this.config;

    const url = `https://mc.adobe.io/${orgInstanceId}/campaign/mc${orgId}/${eventId}`;
    const body = { email, ctx: data };
    return this.httpClient.post(url, { body, headers });
  }

  /**
   * https://docs.adobe.com/content/help/en/campaign-standard/using/communication-channels/transactional-messaging/transactional-push-notifications.html
   *
   * @param eventId
   * @param data
   * @param deviceInfo
   */
  async sendTransactionalPushEvent(
    eventId: string,
    data: Record<string, string>,
    deviceInfo?: PushDeviceInfo
  ) {
    const headers = await this.getAuthHeaders();
    const { orgId, orgInstanceId } = this.config;

    const url = `https://mc.adobe.io/${orgInstanceId}/campaign/mc${orgId}/${eventId}`;
    const body = { ...deviceInfo, ctx: data };
    return this.httpClient.post(url, { body, headers });
  }

  /**
   * https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/managing-profiles/creating-profiles.html
   *
   * @param data
   */
  async insertProfile(data: Record<string, any>) {
    const headers = await this.getAuthHeaders();
    const { orgInstanceId } = this.config;

    const url = `https://mc.adobe.io/${orgInstanceId}/campaign/profileAndServicesExt/profile/`;
    return this.httpClient.post(url, { body: data, headers });
  }

  /**
   * https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/global-concepts/additional-operations/filtering.html
   *
   * @param email
   */
  async getProfilesByEmail(email: string): Promise<Profile[]> {
    const headers = await this.getAuthHeaders();
    const { orgInstanceId } = this.config;

    const url = `https://mc.adobe.io/${orgInstanceId}/campaign/profileAndServicesExt/profile/byEmail`;
    const qs = { email };
    const { body } = await this.httpClient.get(url, { headers, qs });

    return body.content;
  }

  /**
   * https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/managing-profiles/updating-profiles.html
   *
   * @param pkey
   * @param data Profile data
   */
  async updateProfile(pkey: string, data: Record<string, any>) {
    const headers = await this.getAuthHeaders();
    const { orgInstanceId } = this.config;

    const url = `https://mc.adobe.io/${orgInstanceId}/campaign/profileAndServicesExt/profile/${pkey}`;
    const { body } = await this.httpClient.patch(url, { headers, body: data });

    return body.content;
  }

  async getServicesByName(name: string): Promise<Service> {
    const headers = await this.getAuthHeaders();

    const { orgInstanceId } = this.config;

    const url = `https://mc.adobe.io/${orgInstanceId}/campaign/profileAndServicesExt/service/byText`;
    const qs = { text: name };
    const { body } = await this.httpClient.get(url, { headers, qs });

    return body.content;
  }

  async subscribeProfileToService(profile: Profile, service: Service) {
    const headers = await this.getAuthHeaders();

    const url = profile.subscriptions.href;
    const body = { service: { PKey: service.PKey } };
    return this.httpClient.post(url, { body, headers });
  }

  private async getAuthHeaders() {
    const { accessToken, clientId } = await this.authorizer.getAuthenticatedCredentials();
    return {
      Authorization: `Bearer ${accessToken}`,
      "X-Api-Key": clientId,
    };
  }
}
