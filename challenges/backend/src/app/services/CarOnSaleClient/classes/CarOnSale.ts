import { AxiosInstance } from "axios";
import { inject, injectable } from "inversify";
import { DependencyIdentifier } from "../../../DependencyIdentifiers";
import { IConfig } from "../../Config/interface/IConfig";
import { ILogger } from "../../Logger/interface/ILogger";
import { Auction } from "../dtos/auction/auction";
import { AuctionItem } from "../dtos/auction/AuctionItem";
import { AuthenticationResponse } from "../dtos/auth/AuthenticationResponse";
import { IActionFilter } from "../interface/IActionFilter";
import { ICalculator } from "../interface/ICalculator";
import { ICarOnSaleClient } from "../interface/ICarOnSaleClient";

@injectable()
export class CarOnSale implements ICarOnSaleClient {
    constructor(@inject(DependencyIdentifier.LOGGER) private logger: ILogger,
        @inject(DependencyIdentifier.CLIENT) private readonly axiosInstance: AxiosInstance,
        @inject(DependencyIdentifier.CONFIG) private readonly config: IConfig,
        @inject(DependencyIdentifier.CALCULATOR) private readonly calculator: ICalculator
    ) {

    }
    async print(): Promise<void> {
        const { token } = await this.userAuthentication();
        const active_auctions = await this.getRunningAuctions(token, { limit: 0, offset: 0 }, true);
        this.checkActiveAuction(active_auctions);

        const page_limit = parseInt(this.config.get('page_limit'));
        const numPages = Math.ceil(active_auctions.total / page_limit);

        const auctionResponses: AuctionItem[] = await this.prepareAuctionData(numPages, token, page_limit);

        this.printNumberOfAuctions(auctionResponses);
        this.printAverageBids(auctionResponses);
        this.printAveragePercentage(auctionResponses);
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

    private printNumberOfAuctions(auctions: AuctionItem[]): void {
        this.logger.log(`Number of Auctions: ${auctions.length}`);
    }

    private printAveragePercentage(auctions: AuctionItem[]): void {
        const averageProgress = this.calculator.calculateAverageProgress(auctions);
        this.logger.log(`Average auction progress: ${averageProgress.toFixed(2)}%`);
    }
    private printAverageBids(auctions: AuctionItem[]): void {
        const averageBids = this.calculator.calculateAverageBids(auctions);
        this.logger.log(`Average average bid: ${averageBids}`);
    }
    private async prepareAuctionData(numPages: number, token: string, page_limit: number): Promise<AuctionItem[]> {
        const requests = Array.from({ length: numPages }, (_, i) => this.getRunningAuctions(token, { limit: page_limit, offset: i * page_limit }, false));

        const responses: Auction[] = await Promise.all(requests);
        const items: AuctionItem[] = responses.flatMap(response => response.items);
        return Array.from(new Set(items));
    }

    private checkActiveAuction(active_actions: Auction): void {
        if (active_actions.total < 0) {
            this.logger.log(`No active auction`);
            process.exit(0);
        }
    }

}