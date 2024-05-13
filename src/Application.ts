import { Server } from './express/Server'
import { Config } from './config/config';
import { Database } from './database/databaseController'
import { ConsoleManager } from './console/consoleManager';

class Application {
    public server: Server
    public config: Config
    public database: Database
    public console: ConsoleManager

    constructor() {
        this.server = new Server(this);
        this.config = new Config();
        this.database = new Database(this);
        this.console = new ConsoleManager(this)
    }

    connect(): void {
        this.server.start();
        this.database.connect();
    }
}

export = Application