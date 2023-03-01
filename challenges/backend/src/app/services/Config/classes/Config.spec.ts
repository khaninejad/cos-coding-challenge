import { expect } from "chai";
import "mocha";
import { IConfig } from "../interface/IConfig";
import { Config } from "./Config";

describe("Config", () => {
  let config: IConfig;

  beforeEach(() => {
    config = new Config();
  });

  it("should return the correct api configuration value for api_endpoint", () => {
    const apiUrl = config.get('api_endpoint');
    expect(apiUrl).to.equal("https://api-core-dev.caronsale.de/api/");
  });

  it("should return the correct configuration value for email", () => {
    const email = config.get('email');
    expect(email).to.equal("buyer-challenge@caronsale.de");
  });
});