import * as chai from 'chai';
import "reflect-metadata";
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import axios, { AxiosInstance } from 'axios';
import sinon from 'sinon';
import { ILogger } from '../../Logger/interface/ILogger';
import { IActionFilter } from '../interface/IActionFilter';
import { IConfig } from '../../Config/interface/IConfig';
import { ICalculator } from '../interface/ICalculator';
import { Logger } from '../../Logger/classes/Logger';
import { Config } from '../../Config/classes/Config';
import { Calculator } from './Calculator';
import { CarOnSale } from './CarOnSale';
import { AuctionItem } from '../dtos/auction/AuctionItem';
import { ICarOnSaleClient } from '../interface/ICarOnSaleClient';
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

describe('CarOnSale', () => {
  let logger: ILogger;
  let config: IConfig;
  let calculator: ICalculator;
  let axiosInstance: AxiosInstance;
  let carOnSale: ICarOnSaleClient;
  let axiosInstanceStub: sinon.SinonStubbedInstance<AxiosInstance>;

  beforeEach(() => {
    logger = new Logger();
    axiosInstance = axios.create();
    axiosInstanceStub = sinon.stub(axiosInstance);
    config = new Config();
    calculator = new Calculator();
    carOnSale = new CarOnSale(logger, axiosInstanceStub, config, calculator);
  });

  describe('userAuthentication', () => {
    it('should authenticate a user', async () => {
      const email = 'test@test.com';
 
      axiosInstanceStub.put.resolves({data: validAuthResponse});
  
      const response = await carOnSale.userAuthentication();
  
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
        await carOnSale.userAuthentication();
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
        await carOnSale.userAuthentication();
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
      
  
      const response = await carOnSale.getRunningAuctions('token', actionFilter, false);
  
      expect(response.items).to.be.a('array');
      expect(response.items[0].id).to.equal(10);
      expect(response.page).to.equal(1);
      expect(response.total).to.equal(100);
    });

    it('should throw error on unexpected call', async () => {
  
      const unexpected_error = 'unexpected_error' 
      axiosInstanceStub.get.rejects(new Error(unexpected_error));

      try {
        await carOnSale.getRunningAuctions('token', actionFilter, false);
      } catch (error:any) {
        expect(error.message).to.equal(`${unexpected_error}`);
      } 

    });

    it('should throw error on null but valid call', async () => {
  
      axiosInstanceStub.get.resolves(null);

      try {
        await carOnSale.getRunningAuctions('token', actionFilter, false);
      } catch (error:any) {
        expect(error.message).to.equal('invalid input');
      } 

    });
  });

});
