import express, { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import { expressRouter } from './Router'
import Application from '../Application'

dotenv.config()

export class Server {

    private server: Express
    private readonly port = process.env.PORT || 3000
    public app: Application

    constructor(app: Application) {
        this.app = app
        this.server = express()
        this.configureRoutes()
    }

    private configureRoutes() {
        const router = new expressRouter(this)
        this.server.use(express.json())
        this.server.use(this.logger.bind(this))
        this.server.use('/', router.createRoutes())
        console.log('[express]: Routes configured!')
    }

    public start():void {

        this.server.listen(this.port, () => {

            console.log(`[express]: Server started!`)
        })
    }

    private logger(req: Request, res: Response, next: NextFunction): void {
        console.log(`New ${req.method} request for the route ${req.originalUrl}`)
        next()
    }

    test() {
        console.log('Success!')
    }
}

