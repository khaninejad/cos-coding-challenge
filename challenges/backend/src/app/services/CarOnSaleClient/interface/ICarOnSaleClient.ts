import { Auction } from "../dtos/auction/auction";
import { AuthenticationResponse } from "../dtos/auth/AuthenticationResponse";
import { IActionFilter } from "./IActionFilter";

/**
 * This service describes an interface to access auction data from the CarOnSale API.
 */
export interface ICarOnSaleClient {

    getRunningAuctions(token: string, filter: IActionFilter, count: boolean): Promise<Auction>
    userAuthentication(): Promise<AuthenticationResponse>
    print(): Promise<void>
}
