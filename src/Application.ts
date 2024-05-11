import { Server } from './express/Server'
import { Config } from './config/config';
import { Database } from './database/databaseController'

class Application {
    public server: Server
    public config: Config
    public database: Database

    constructor() {
        this.server = new Server(this);
        this.config = new Config();
        this.database = new Database(this);
    }

    connect() {
        this.server.start();
        this.database.connect();
    }
}

export = Application