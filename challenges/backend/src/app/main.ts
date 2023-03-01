import {Container} from "inversify";
import {ILogger} from "./services/Logger/interface/ILogger";
import {Logger} from "./services/Logger/classes/Logger";
import {DependencyIdentifier} from "./DependencyIdentifiers";
import {AuctionMonitorApp} from "./AuctionMonitorApp";
import { IConfig } from "./services/Config/interface/IConfig";
import { Config } from "./services/Config/classes/Config";
import { ICalculator } from "./services/CarOnSaleClient/interface/ICalculator";
import { Calculator } from "./services/CarOnSaleClient/classes/Calculator";

/*
 * Create the DI container.
 */
const container = new Container({
    defaultScope: "Singleton",
});

/*
 * Register dependencies in DI environment.
 */
container.bind<ILogger>(DependencyIdentifier.LOGGER).to(Logger);
container.bind<IConfig>(DependencyIdentifier.CONFIG).to(Config);
container.bind<ICalculator>(DependencyIdentifier.CALCULATOR).to(Calculator);


/*
 * Inject all dependencies in the application & retrieve application instance.
 */
const app = container.resolve(AuctionMonitorApp);

/*
 * Start the application
 */
(async () => {
    await app.start();
})();
