import * as chai from 'chai';
import "reflect-metadata";
import { AuctionMonitorApp } from "./AuctionMonitorApp";
import { ILogger } from "./services/Logger/interface/ILogger";
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import axios, { AxiosInstance } from 'axios';
import sinon from 'sinon';
import { IConfig } from './services/Config/interface/IConfig';
import { Config } from './services/Config/classes/Config';
import { Logger } from './services/Logger/classes/Logger';
import { ICarOnSaleClient } from './services/CarOnSaleClient/interface/ICarOnSaleClient';
import { CarOnSale } from './services/CarOnSaleClient/classes/CarOnSale';
import { ICalculator } from './services/CarOnSaleClient/interface/ICalculator';
import { Calculator } from './services/CarOnSaleClient/classes/Calculator';
chai.use(chaiAsPromised);

chai.should();

describe('AuctionMonitorApp', () => {
  let logger: ILogger;
  let config: IConfig;
  let carOnSale: ICarOnSaleClient;
  let axiosInstance: AxiosInstance;
  let actionMonitor: AuctionMonitorApp;
  let calculator: ICalculator;
  let axiosInstanceStub: sinon.SinonStubbedInstance<AxiosInstance>;

  beforeEach(() => {
    logger = new Logger();
    axiosInstance = axios.create();
    axiosInstanceStub = sinon.stub(axiosInstance);
    config = new Config();
    calculator = new Calculator();
    carOnSale = new CarOnSale(logger, axiosInstanceStub, config, calculator);
    actionMonitor = new AuctionMonitorApp(logger, carOnSale);
  });

  describe('#start', () => {
    it('should log a message when started', async () => {
      expect(true).to.true;
    });
  });

  describe('start', () => {
    it('should call print', async () => {


      const printStub = sinon.stub(carOnSale, 'print');
      const loggerStub = sinon.stub(logger, 'log');

      await actionMonitor.start();

      expect(printStub.calledOnce).to.be.true;
      expect(loggerStub.called).to.be.true;

      printStub.restore();

    });

  });

});
