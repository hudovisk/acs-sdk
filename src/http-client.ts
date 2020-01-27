import superagent from "superagent";

export type RequestMethods = "POST" | "GET";
export interface RequestParams {
  headers?: { [name: string]: string };
  qs?: object;
  body?: object;
}
export interface RequestOptions {
  /** Overrides class baseUrl */
  baseUrl?: string;
}
export interface RequestResponseErrorDetails {
  status: number;
  text: string;
  method: string;
  path: string;
}
export class RequestResponseError extends Error {
  status: number;
  text: string;
  method: string;
  path: string;
  constructor(data: { message?: string } & RequestResponseErrorDetails) {
    super(data.message);
    this.status = data.status;
    this.text = data.text;
    this.method = data.method;
    this.path = data.path;
  }
}
export interface RequestResponse<T extends object> {
  status: number;
  text: string;
  body: T;
  headers: any;
  ok: boolean;
}

export default class HttpClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || "";
  }

  private methodFactory = (method: RequestMethods) => {
    switch (method) {
      case "GET":
        return superagent.get;
      case "POST":
        return superagent.post;
    }
  };

  get = async <T extends object = any>(
    endpoint: string,
    params: RequestParams,
    options?: RequestOptions
  ): Promise<RequestResponse<T>> => this.request("GET", endpoint, params, options);

  post = async <T extends object = any>(
    endpoint: string,
    params: RequestParams,
    options?: RequestOptions
  ): Promise<RequestResponse<T>> => this.request("POST", endpoint, params, options);

  request = async <T extends object = any>(
    method: RequestMethods,
    endpoint: string,
    params: RequestParams,
    options?: RequestOptions
  ): Promise<RequestResponse<T>> => {
    const defaultHeaders = () => ({
      "cache-control": "no-cache",
      Accept: "*/*",
      "Content-Type": "application/json"
    });

    const url = `${(options && options.baseUrl) || this.baseUrl}${endpoint}`;
    try {
      const response = await this.methodFactory(method)(url)
        .query(params.qs || {})
        .set({ ...defaultHeaders(), ...params.headers })
        .send(params.body);

      return {
        status: response.status,
        ok: response.ok,
        body: response.body,
        text: response.text,
        headers: response.header
      };
    } catch (err) {
      throw this.cleanError(err);
    }
  };

  private cleanError = (err: any): RequestResponseError => {
    throw new RequestResponseError({
      message: err.response.error.message,
      status: err.status,
      text: err.response.error.text,
      path: err.response.error.path,
      method: err.response.error.method
    });
  };
}
