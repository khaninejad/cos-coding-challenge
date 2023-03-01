import { expect } from 'chai';
import "reflect-metadata";
import { AuctionItem } from '../dtos/auction/AuctionItem';

import { Calculator } from './Calculator';

describe('Calculator', () => {
  const calculator = new Calculator();

  describe('calculatePercentage', () => {
    it('should calculate the percentage correctly', () => {
      const minimumRequiredAsk = 100;
      const currentHighestBidValue = 50;
      const expectedPercentage = 50;

      const actualPercentage = calculator.calculatePercentage(currentHighestBidValue, minimumRequiredAsk);

      expect(actualPercentage).to.equal(expectedPercentage);
    });

    it('should return 0 if minimumRequiredAsk is null', () => {
      const minimumRequiredAsk = null;
      const currentHighestBidValue = 50;
      const expectedPercentage = 0;

      const actualPercentage = calculator.calculatePercentage(currentHighestBidValue, minimumRequiredAsk);

      expect(actualPercentage).to.equal(expectedPercentage);
    });
  });

  describe('calculateAverageProgress', () => {
    it('should calculate the average progress correctly', () => {
      const auctions = [
        { minimumRequiredAsk: 100, currentHighestBidValue: 50, numBids: 1 },
        { minimumRequiredAsk: 200, currentHighestBidValue: 100, numBids: 2 },
      ] as AuctionItem[];
      const expectedAverageProgress = 50;

      const actualAverageProgress = calculator.calculateAverageProgress(auctions);

      expect(actualAverageProgress).to.equal(expectedAverageProgress);
    });

    it('should calculate the average progress correctly', () => {
        const auctions = [
          { currentHighestBidValue: 50, minimumRequiredAsk: 100 },
          { currentHighestBidValue: 75, minimumRequiredAsk: 150 },
          { currentHighestBidValue: 100, minimumRequiredAsk: 200 },
        ] as AuctionItem[];
        const result = calculator.calculateAverageProgress(auctions);
        expect(result).to.equal(50);
      });

    it('should return 0 if auctions array is empty', () => {
      const auctions: AuctionItem[] = [];
      const expectedAverageProgress = 0;

      const actualAverageProgress = calculator.calculateAverageProgress(auctions);

      expect(actualAverageProgress).to.equal(expectedAverageProgress);
    });
  });

  describe('calculateAverageBids', () => {
    it('should calculate single average bids correctly', () => {
      const auctions = [
        { minimumRequiredAsk: 200, currentHighestBidValue: 100, numBids: 2 },
      ] as AuctionItem[];
      const expectedAverageBids = 2;

      const actualAverageBids = calculator.calculateAverageBids(auctions);

      expect(actualAverageBids).to.equal(expectedAverageBids);
    });

    it('should calculate multiple the average bids correctly ', () => {
        const auctions = [
          { numBids: 5 },
          { numBids: 10 },
          { numBids: 15 },
        ] as AuctionItem[];
        const result = calculator.calculateAverageBids(auctions);
        expect(result).to.equal(10);
      });

    it('should return 0 if auctions array is empty', () => {
      const auctions: AuctionItem[] = [];
      const expectedAverageBids = 0;

      const actualAverageBids = calculator.calculateAverageBids(auctions);

      expect(actualAverageBids).to.equal(expectedAverageBids);
    });
  });
});
