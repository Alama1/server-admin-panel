import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import {routes} from './Router'

dotenv.config()

export class Server {

    private app: Express
    private readonly port = process.env.PORT || 3000

    constructor() {
        this.app = express()
        this.configureRoutes()
    }

    configureRoutes() {

        this.app.use('/', routes)
    }

    public start():void {

        this.app.listen(this.port, () => {

            console.log(`[express]: Server started!`)
        })
    }
}

