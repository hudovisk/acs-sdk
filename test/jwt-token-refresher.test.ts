import { sign as jwtSign } from "jsonwebtoken";
import { JWTTokenRefresher, OnRefresh } from "../src/jwt-token-refresher";

const DEFAULT_TOKEN_EXPIRATION = 900;

describe("JWT Token", () => {
  let jwtToken: JWTTokenRefresher;
  let onRefresh: OnRefresh;

  beforeEach(() => {
    const mockNow = Date.now();
    jest.spyOn(global.Date, "now").mockReturnValue(mockNow);

    onRefresh = jest.fn().mockImplementation(() => Promise.resolve(givenValidToken()));
    jwtToken = new JWTTokenRefresher(onRefresh);
  });

  it("should call onRefresh on first call to getToken", async () => {
    const token = await jwtToken.getToken();

    const expectedToken = givenValidToken();
    expect(token).toBe(expectedToken);
    expect(onRefresh).toBeCalledTimes(1);
  });

  it("should return same token on token not expired", async () => {
    const expectedToken = givenValidToken();

    // gets first token
    await jwtToken.getToken();

    // pass some time
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + (DEFAULT_TOKEN_EXPIRATION / 2) * 1000);

    const secondToken = await jwtToken.getToken();
    expect(secondToken).toBe(expectedToken);
    expect(onRefresh).toBeCalledTimes(1);
  });

  it("should refresh token on token expired", async () => {
    const expectedToken = givenValidToken();

    // gets first token
    await jwtToken.getToken();

    // pass some time
    jest.spyOn(Date, "now").mockReturnValue(Date.now() + DEFAULT_TOKEN_EXPIRATION * 1000);

    const secondToken = await jwtToken.getToken();
    expect(secondToken).not.toBe(expectedToken);
    expect(onRefresh).toBeCalledTimes(2);
  });
});

function givenValidToken(seconds: number = DEFAULT_TOKEN_EXPIRATION) {
  const expiration = Date.now() / 1000 + seconds;
  const token = jwtSign({ exp: expiration }, "secret");

  return token;
}
