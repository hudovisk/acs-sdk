import { decode } from "jsonwebtoken";

export type OnRefresh = () => Promise<string>;

export class JWTTokenRefresher {
  private token?: string;

  constructor(private onRefresh: OnRefresh) {}

  async getToken() {
    if (this.expiresIn(300)) {
      this.token = await this.onRefresh();
    }

    return this.token;
  }

  expiresIn(seconds: number) {
    if (!this.token) {
      return true;
    }

    const payload = decode(this.token);
    if (!payload || typeof payload !== "object") {
      return true;
    }

    return payload.exp - Date.now() / 1000 < seconds;
  }
}
