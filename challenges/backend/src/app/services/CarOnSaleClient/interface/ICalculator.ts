import { AuctionItem } from "../dtos/auction/auction-item";

export interface ICalculator {
    calculatePercentage(currentHighestBidValue: number, minimumRequiredAsk: number | null):number;
    calculateAverageProgress(auctions: AuctionItem[]):number;
    calculateAverageBids(auctions: AuctionItem[]):number;
}