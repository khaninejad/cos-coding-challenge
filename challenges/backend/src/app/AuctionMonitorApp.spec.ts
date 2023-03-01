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
import { IActionFilter } from './services/CarOnSaleClient/interface/IActionFilter';
import { Logger } from './services/Logger/classes/Logger';
import { Calculator } from './services/CarOnSaleClient/classes/Calculator';
import { ICalculator } from './services/CarOnSaleClient/interface/ICalculator';
import { AuctionItem } from './services/CarOnSaleClient/dtos/auction/AuctionItem';
chai.use(chaiAsPromised);

chai.should();

const validAuthResponse = {
  token: 'test-token',
  authenticated: true,
  userId: 'test@test.com',
  internalUserId: 123,
  internalUserUUID: 'test-uuid',
  type: 1,
  privileges: '{SALESMAN_USER}'
};

const actionFilter: IActionFilter = { offset: 1, limit: 10 };

describe('AuctionMonitorApp', () => {
  let logger: ILogger;
  let config: IConfig;
  let calculator: ICalculator;
  let axiosInstance: AxiosInstance;
  let actionMonitor: AuctionMonitorApp;
  let axiosInstanceStub: sinon.SinonStubbedInstance<AxiosInstance>;

  beforeEach(() => {
    logger = new Logger();
    axiosInstance = axios.create();
    axiosInstanceStub = sinon.stub(axiosInstance);
    config = new Config();
    calculator = new Calculator();
    actionMonitor = new AuctionMonitorApp(logger, axiosInstanceStub, config, calculator);
  });

  describe('#start', () => {
    it('should log a message when started', async () => {
      expect(true).to.true;
    });
  });

  describe('userAuthentication', () => {
    it('should authenticate a user', async () => {
      const email = 'test@test.com';
 
      axiosInstanceStub.put.resolves({data: validAuthResponse});
  
      const response = await actionMonitor.userAuthentication();
  
      expect(response.token).to.be.a('string');
      expect(response.token).to.equal(validAuthResponse.token);
      expect(response.authenticated).to.equal(true);
      expect(response.userId).to.equal(email);
      expect(response.internalUserId).to.be.a('number');
      expect(response.internalUserUUID).to.be.a('string');
      expect(response.type).to.be.a('number');
      expect(response.privileges).to.be.a('string');
    });

    it('should throw error on unexpected call authentication', async () => {

      const unexpected_error = 'unexpected_error' 
      axiosInstanceStub.put.rejects(new Error(unexpected_error));

      try {
        await actionMonitor.userAuthentication();
      } catch (error:any) {
        expect(error.message).to.equal(`Error: ${unexpected_error}`);
      } 

    });

    it('should throw error on not-authenticated user', async () => {

      const expectedResponse ={
        "msgKey": "user.not-authenticated",
        "params": {
            "userId": "buyer-challenge@caronsale.de"
        },
        "message": "Authentisierung für Benutzer \"buyer-challenge@caronsale.de\" fehlgeschlagen."
    }
  
      axiosInstanceStub.put.resolves({expectedResponse});
      try {
        await actionMonitor.userAuthentication();
      } catch (error:any) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Error: invalid credentials');
      } 

    });
  
  });

  describe('getRunningAuctions', () => {
    it('should get active auction list', async () => {
  
      const item = { label: 'test', id: 10 } as AuctionItem;

      axiosInstanceStub.get.resolves({data: {items: [item], page: 1, total: 100}});
      
  
      const response = await actionMonitor.getRunningAuctions('token', actionFilter, false);
  
      expect(response.items).to.be.a('array');
      expect(response.items[0].id).to.equal(10);
      expect(response.page).to.equal(1);
      expect(response.total).to.equal(100);
    });

    it('should throw error on unexpected call', async () => {
  
      const unexpected_error = 'unexpected_error' 
      axiosInstanceStub.get.rejects(new Error(unexpected_error));

      try {
        await actionMonitor.getRunningAuctions('token', actionFilter, false);
      } catch (error:any) {
        expect(error.message).to.equal(`${unexpected_error}`);
      } 

    });
  });

  describe('start', () => {
    it('should exit on No active auction', async () => {
      axiosInstanceStub.put.resolves({data: validAuthResponse});

      axiosInstanceStub.get.resolves({data: {items: [], page: 1, total: -1}});
    
      await actionMonitor.getRunningAuctions('token', actionFilter, false);
      const exitStub = sinon.stub(process, 'exit');
      const loggerStub = sinon.stub(logger, 'log');

      await actionMonitor.start();
    
      expect(exitStub.calledOnceWithExactly(0)).to.be.true;
      expect(loggerStub.called).to.be.true;      
    
      exitStub.restore();

    }); 

    // it('prepare auction data should be called', async () => {
    //   axiosInstanceStub.put.resolves({data: validAuthResponse});

    //   axiosInstanceStub.get.resolves({data: {items: [], page: 1, total: 3}});
      
      
    //   const auctionDataStub = sinon.stub(actionMonitor, 'getRunningAuctions');

    //   const result = await actionMonitor.prepareAuctionData(10, 'token', 5);
    
    //   expect(result.length).to.equal(10);
    
    //   auctionDataStub.restore();

    // }); 
  });

});
