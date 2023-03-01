import { inject, injectable } from "inversify";
import { ILogger } from "./services/Logger/interface/ILogger";
import { DependencyIdentifier } from "./DependencyIdentifiers";
import "reflect-metadata";
import { ICarOnSaleClient } from "./services/CarOnSaleClient/interface/ICarOnSaleClient";
import { AuthenticationResponse } from "./services/CarOnSaleClient/dtos/auth/AuthenticationResponse";
import { Auction } from "./services/CarOnSaleClient/dtos/auction/auction";
import { AxiosInstance } from 'axios';
import { IConfig } from "./services/Config/interface/IConfig";
import { IActionFilter } from "./services/CarOnSaleClient/interface/IActionFilter";
import { ICalculator } from "./services/CarOnSaleClient/interface/ICalculator";
import { AuctionItem } from "./services/CarOnSaleClient/dtos/auction/AuctionItem";

@injectable()
export class AuctionMonitorApp implements ICarOnSaleClient {
    public constructor(
        @inject(DependencyIdentifier.LOGGER) private logger: ILogger,
        @inject(DependencyIdentifier.CLIENT) private readonly axiosInstance: AxiosInstance,
        @inject(DependencyIdentifier.CONFIG) private readonly config: IConfig,
        @inject(DependencyIdentifier.CALCULATOR) private readonly calculator: ICalculator
    ) {
    }


    public async start(): Promise<void> {
        this.logger.log(`Auction Monitor started.`);
        const { token } = await this.userAuthentication();
        const active_actions = await this.getRunningAuctions(token, { limit: 0, offset: 0 }, true);
        this.checkActiveAuction(active_actions);

        const page_limit = parseInt(this.config.get('page_limit'));
        const numPages = Math.ceil(active_actions.total / page_limit);

        const responses: AuctionItem[] = await this.prepareAuctionData(numPages, token, page_limit);

        this.printNumberOfAuctions(responses);
        this.printAverageBids(responses);
        this.printAveragePercentage(responses);
    }
    printNumberOfAuctions(auctions: AuctionItem[]): void {
        this.logger.log(`Number of Auctions: ${auctions.length}`);
    }

    printAveragePercentage(auctions: AuctionItem[]) {
        const averageProgress = this.calculator.calculateAverageProgress(auctions);
        this.logger.log(`Average auction progress: ${averageProgress.toFixed(2)}%`);
    }
    printAverageBids(auctions: AuctionItem[]) {
        const averageBids = this.calculator.calculateAverageBids(auctions);
        this.logger.log(`Average average bid: ${averageBids}`);
    }
    async prepareAuctionData(numPages: number, token: string, page_limit: number): Promise<AuctionItem[]> {
        const requests = [];
        const items = new Set<AuctionItem>();
        for (let i = 1; i <= numPages; i++) {
            requests.push(this.getRunningAuctions(token, { limit: page_limit, offset: i * page_limit }, false));
        }

        const responses: Auction[] = await Promise.all(requests);
        for (const response of responses) {
            for (const item of response.items) {
                items.add(item);
            }
        }
        return Array.from(items);
    }

    private checkActiveAuction(active_actions: Auction) {
        if (active_actions.total < 0) {
            this.logger.log(`No active auction`);
            process.exit(0);
        }
    }

    async getRunningAuctions(token: string, filter: IActionFilter, count: boolean): Promise<Auction> {
        const url = `${this.config.get('api_endpoint')}v2/auction/buyer/?${JSON.stringify(filter)}&count=${count}`;
        const response = await this.axiosInstance.get(url, {
            headers: {
                'userid': this.config.get('email'),
                'authtoken': token,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        if (!response) {
            throw new Error("invalid input");
        }

        const auction: Auction = {
            items: response.data.items,
            page: response.data.page,
            total: response.data.total,
        };

        return auction;
    }
    async userAuthentication(): Promise<AuthenticationResponse> {
        try {
            const password = this.config.get('password');
            const meta = this.config.get('meta');

            const response = await this.axiosInstance.put(`${this.config.get('api_endpoint')}v1/authentication/${this.config.get('email')}`, {
                password,
                meta,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });
            if (!response.data) {
                throw new Error("invalid credentials");

            }
            return response.data;

        } catch (error: any) {
            this.logger.log(error);
            throw new Error(error)
        }
    }

}
