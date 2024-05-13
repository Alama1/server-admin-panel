import mongoose from "mongoose";
import Application from "../Application";
import bcrypt from 'bcrypt'

import { IUser, userModel } from './models/user'

export class Database {

    private app: Application

    constructor(app: Application) {
        this.app = app
    }

    public connect(): void {

        try{
            mongoose
                .connect(this.app.config.getMongoURL(), {retryWrites: true, w: 'majority', dbName: this.app.config.properties.mongo.databaseName})
            console.log('Database connected!')

        } catch(e) {
            console.log('Error!')
        }
    }

    async createNewUser(username: string, email: string, password: string): Promise<IUser> {
        const verificationString = (Math.random() + 1).toString(35).substring(2)
        try {
            const hashedPassword = await this.passwordHash(password)
            const res = await userModel.create({ username, email, password: hashedPassword, verificationString }) 
            return res
        } catch (error) {
            throw error
        }
    }

    public async confirmPassword(email: string, password: string): Promise<Boolean> {

        const foundUser = await this.getUserByEmail(email)

        if (!foundUser) {
            return false
        }

        return bcrypt.compareSync(password, foundUser.password)
    }

    private async passwordHash(password: string): Promise<string> {
        const saltRounds = 8
        return bcrypt.hash(password, saltRounds)
    }

    public async getUserByEmail(email: string): Promise<Promise<IUser> | null> {
        return userModel.findOne({ email })
    }
}