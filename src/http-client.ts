import superagent from "superagent";
import util from "util";

export type RequestMethods = "POST" | "GET" | "PATCH";
export interface RequestParams {
  headers?: { [name: string]: string };
  qs?: object;
  body?: object;
}
export interface RequestOptions {
  /** Overrides class baseUrl */
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
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
  private defaultRequestOptions: RequestOptions;

  constructor(defaultRequestOptions?: RequestOptions) {
    this.defaultRequestOptions = {
      timeout: 5000,
      maxRetries: 3,
      ...defaultRequestOptions,
    };
  }

  private methodFactory = (method: RequestMethods) => {
    switch (method) {
      case "GET":
        return superagent.get;
      case "POST":
        return superagent.post;
      case "PATCH":
        return superagent.patch;
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

  patch = async <T extends object = any>(
    endpoint: string,
    params: RequestParams,
    options?: RequestOptions
  ): Promise<RequestResponse<T>> => this.request("PATCH", endpoint, params, options);

  request = async <T extends object = any>(
    method: RequestMethods,
    endpoint: string,
    params: RequestParams,
    options?: RequestOptions
  ): Promise<RequestResponse<T>> => {
    const defaultHeaders = () => ({
      "cache-control": "no-cache",
      Accept: "*/*",
      "Content-Type": "application/json; charset=utf-8",
    });

    const requestOptions: RequestOptions = { ...this.defaultRequestOptions, ...options };
    const url = `${requestOptions.baseUrl || ""}${endpoint}`;
    try {
      const request = this.methodFactory(method)(url)
        .query(params.qs || {})
        .set({ ...defaultHeaders(), ...params.headers })
        .timeout({
          response: requestOptions.timeout,
        })
        .retry(requestOptions.maxRetries)
        .send(params.body);

      // We must wait for end callback otherwise it will throw on timeout without
      // retrying!
      const endRequest = util.promisify(request.end.bind(request));
      const response = await endRequest();

      return {
        status: response.status,
        ok: response.ok,
        body: response.body,
        text: response.text,
        headers: response.header,
      };
    } catch (err) {
      throw this.cleanError(err, { endpoint, method });
    }
  };

  private cleanError = (
    err: any,
    requestDetails: { endpoint: string; method: RequestMethods }
  ): RequestResponseError => {
    if (err.response) {
      throw new RequestResponseError({
        message: err.response.error.message,
        status: err.status,
        text: err.response.error.text,
        path: err.response.error.path,
        method: err.response.error.method,
      });
    }

    throw new RequestResponseError({
      message: err.retries ? `${err.message}. Retries: ${err.retries}` : err.message,
      status: 0,
      text: err.message,
      path: requestDetails.endpoint,
      method: requestDetails.method,
    });
  };
}
