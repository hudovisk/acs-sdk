import nock from "nock";

import HttpClient from "../src/http-client";

const urlHost = `http://localhost`;
const path = "/";

describe("HTTP Client", () => {
  let httpClient: HttpClient;
  let nockScope: nock.Scope;

  beforeEach(() => {
    nock.cleanAll();
    nockScope = nock(urlHost);

    httpClient = new HttpClient({
      baseUrl: urlHost,
      timeout: 250,
      maxRetries: 3,
    });
  });

  it("should fail on timed out", async () => {
    expect.assertions(1);

    nockScope.post(path).delay(500).reply(200, "ok").persist();

    return httpClient.post(path, {}).catch((e: Error) => {
      expect(e.message).toMatch("timeout");
    });
  });

  it("should success on timed out retry", async () => {
    expect.assertions(1);

    nockScope.post(path).times(2).delay(500).reply(200, "OK").post(path).reply(200, "OK");

    return httpClient.post(path, {}).then((response) => {
      expect(response.text).toMatch("OK");
    });
  });

  it("should fail on multiple 503", async () => {
    expect.assertions(1);

    nockScope.post(path).reply(503).persist();

    return httpClient.post(path, {}).catch((err) => {
      expect(err.status).toBe(503);
    });
  });
});
