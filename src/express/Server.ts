import express, { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import { expressRouter } from './Router'
import Application from '../Application'
import jwt from "jsonwebtoken";

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

    private configureRoutes(): void {
        const router = new expressRouter(this)
        this.server.use(express.json())
        this.server.use(this.logger.bind(this))
        this.server.use(this.authCheck.bind(this))
        this.server.use(this.verifyBody.bind(this))
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

    verifyBody(req: Request, res: Response, next: NextFunction): void {
        if(req.method === 'POST' && req.originalUrl === '/login') {
            const { email, password } = req.body
            if (!email || !password) {
                res.status(401)
                res.send({ success: false, message: 'Invalid credentials.' })
                return
            } 
        }
        if(req.method === 'POST' && req.originalUrl === '/signup') {
            const { username, password, email } = req.body
            if (!username || !password || !email) {
                res.status(401)
                res.send({ success: false, message: 'Invalid credentials.'})
                return
            }
        }

        if(req.method === 'POST' && req.originalUrl === '/command') {
            const { command } = req.body
            if (!command) {
                res.status(422)
                res.send({ success: false, message: 'Command not specified.' })
                return
            }
        }
        next()
    }

    authCheck(req: Request, res: Response, next: NextFunction): void {
        if (req.originalUrl === '/login' || req.originalUrl === '/signup') {
            return next()
        }

        const authToken = req.headers.authorization

        if (!authToken) {
            res.status(401)
            res.send({ success: false, message: 'Authorization failed.' })
            return
        }
        const token = authToken.split(' ')[1]

        jwt.verify(token, this.app.config.properties.jwt.secret, (err, user) => {
            if (err) {
                res.status(403)
                return res.send({ success: false, message: 'Token verification failed.' })
            }
            next()
        })
    }
}

