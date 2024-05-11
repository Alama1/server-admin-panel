import mongoose from "mongoose";
import Application from "../Application";

import { IUser, userModel } from './models/user'

export class Database {

    private app: Application

    constructor(app: Application) {
        this.app = app
    }

    connect(): void {

        try{
            mongoose
                .connect(this.app.config.getMongoURL(), {retryWrites: true, w: 'majority', dbName: this.app.config.properties.mongo.databaseName})
            console.log('Database connected!')

        } catch(e) {
            console.log('Error!')
        }
    }

    async createNewUser(name: String, email: String, avatar?: String): Promise<IUser> {

        try {
            const res = await userModel.create({ name, email, avatar })
            return res
        } catch (error) {
            console.error('Error creating user', error)
            throw error
        }

    }
}