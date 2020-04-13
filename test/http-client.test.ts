import mockserver from "mockserver-node";
import { mockServerClient } from "mockserver-client";

import HttpClient from "../src/http-client";

const port = 5000;
const urlHost = `http://localhost:${port}`;

const expectationsMockClient = mockServerClient("localhost", port);

describe("HTTP Client", () => {
  beforeAll(() => mockserver.start_mockserver({ serverPort: port, verbose: true }));
  afterAll(() => mockserver.stop_mockserver({ serverPort: port }));
  beforeEach(() => expectationsMockClient.reset());

  it("should fail on timed out", async () => {
    expect.assertions(1);
    const path = "/";
    const httpClient = new HttpClient({
      baseUrl: urlHost,
      timeout: 250,
      maxRetries: 3,
    });

    await expectationsMockClient.mockAnyResponse({
      httpRequest: { path },
      httpResponse: {
        body: "OK",
        delay: { timeUnit: "MILLISECONDS", value: 500 },
      },
      times: { unlimited: true },
    });

    return httpClient.post(path, {}).catch((e: Error) => {
      expect(e.message).toMatch("timeout");
    });
  });

  it("should success on timed out retry", async () => {
    expect.assertions(1);
    const path = "/";

    const httpClient = new HttpClient({
      baseUrl: urlHost,
      timeout: 250,
      maxRetries: 3,
    });

    await expectationsMockClient.mockAnyResponse({
      httpRequest: { path },
      httpResponse: {
        body: "OK",
        delay: { timeUnit: "MILLISECONDS", value: 500 },
      },
      times: { remainingTimes: 1, unlimited: false },
    });

    await expectationsMockClient.mockAnyResponse({
      httpRequest: { path },
      httpResponse: {
        body: "OK",
        delay: { timeUnit: "MILLISECONDS", value: 100 },
      },
      times: { remainingTimes: 1, unlimited: false },
    });

    return httpClient.post(path, {}).then((response) => {
      expect(response.text).toMatch("OK");
    });
  });

  it("should fail on multiple 503", async () => {
    expect.assertions(1);
    const path = "/";

    const httpClient = new HttpClient({
      baseUrl: urlHost,
      timeout: 250,
      maxRetries: 3,
    });

    await expectationsMockClient.mockAnyResponse({
      httpRequest: { path },
      httpResponse: { statusCode: 503 },
      times: { unlimited: true },
    });

    return httpClient.post(path, {}).catch((err) => {
      expect(err.status).toBe(503);
    });
  });
});
