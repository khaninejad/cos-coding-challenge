import { injectable } from "inversify";
import "reflect-metadata";
import { IConfig } from "../interface/IConfig";


@injectable()
export class Config implements IConfig {
  private config: Record<string, any>;

  constructor() {
    this.config = {
      api_endpoint: process.env.API_ENDPOINT ?? "https://api-core-dev.caronsale.de/api/",
      email: process.env.EMAIL ?? 'buyer-challenge@caronsale.de',
      password: process.env.PASSWORD ?? 'Test123.',
      meta: process.env.META ?? '',
      page_limit: process.env.PAGE_LIMIT ?? 4,

    };
  }

  public get<T>(key: string): T {
    return this.config[key] as T;
  }
}