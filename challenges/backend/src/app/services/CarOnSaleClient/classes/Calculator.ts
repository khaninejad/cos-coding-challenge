import { injectable } from "inversify";
import { AuctionItem } from "../dtos/auction/AuctionItem";

@injectable()
export class Calculator {
    calculatePercentage(currentHighestBidValue: number, minimumRequiredAsk: number | null):number {
        let auctionProgress = 0;
        if (minimumRequiredAsk === null) {
            return 0;
        }

        auctionProgress = currentHighestBidValue / minimumRequiredAsk! * 100;
        return auctionProgress;
    }
    calculateAverageProgress(auctions: AuctionItem[]): number {
        if (auctions.length <= 0) {
            return 0;
        }

        let progressValues = [];
        for (let item of auctions) {
            progressValues.push(this.calculatePercentage(item.currentHighestBidValue, item.minimumRequiredAsk));
        }

        const sum = progressValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        return sum / progressValues.length;
    }
    calculateAverageBids(auctions: AuctionItem[]): number {
        if (auctions.length <= 0) {
            return 0;
        }

        const totalBids = auctions.reduce((acc, item) => acc + item.numBids, 0);
        const averageBid = totalBids / auctions.length;
        return averageBid;
    }
}