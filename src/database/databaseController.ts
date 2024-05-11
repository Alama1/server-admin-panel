import mongoose from "mongoose";
import Application from "../Application";
import { readdirSync } from "fs";
import path from "path";

export class Database {

    models: Map<string, Object>


    constructor(app: Application) {
        mongoose
            .connect(app.config.getMongoURL(), {retryWrites: true, w: 'majority', dbName: app.config.properties.mongo.databaseName})

        let modelNames = readdirSync(path.join(__dirname, 'models')).filter(file => file.endsWith('.ts'))
        this.models = new Map()
        for (const  file of modelNames) {
            const model = (require(`./models/${file}`))
            this.models.set(file.split('.')[0], model)
        }
    }

    connect() {

    }
}