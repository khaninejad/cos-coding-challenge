import { AuctionItem } from "./AuctionItem";

export interface Auction {
    items: AuctionItem[];
    page: number;
    total: number;
}