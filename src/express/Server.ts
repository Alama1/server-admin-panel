import express, { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import { expressRouter } from './Router'
import Application from '../Application'
import jwt from "jsonwebtoken";
import cors from 'cors'

dotenv.config()

export class Server {

    private server: Express
    private readonly port = process.env.PORT || 3000
    public app: Application
    public gustavoIP: string
    public gustavoSecret: string
    private unrestrictedRoutes: Array<string>

    constructor(app: Application) {
        this.app = app
        this.server = express()
        this.configureRoutes()
        if(process.env.GUSTAVO_IP && process.env.GUSTAVO_SECRET) {
            this.gustavoIP = process.env.GUSTAVO_IP
            this.gustavoSecret = process.env.GUSTAVO_SECRET
        } else {
            throw Error('Cannot find gustavo ip and secret in the env variables.')
        }
        this.unrestrictedRoutes = ['/login', '/signup', '/hamster', '/globalGifs']
    }

    private configureRoutes(): void {
        const router = new expressRouter(this)
        this.server.use(express.json())
        this.server.use(cors())
        this.server.use(this.logger.bind(this))
        this.server.use(this.authCheck.bind(this))
        this.server.use(this.verifyBody.bind(this))
        this.server.use('/', router.createRoutes())
        console.log('[express]: Routes configured!')
    }

    public start(): void {

        this.server.listen(this.port, () => {
            console.log(`[express] Server started!`)
        })
    }

    private logger(req: Request, res: Response, next: NextFunction): void {
        console.log(`[express] New ${req.method} request for the route ${req.originalUrl}`)
        next()
    }

    private verifyBody(req: Request, res: Response, next: NextFunction): void {
        if(req.method === 'POST' && req.originalUrl === '/login') {
            const { email, password } = req.body
            if (!email || !password) {
                console.log('And here')
                res.status(401)
                res.send({ success: false, message: 'Invalid credentials.' })
                return
            }
        }

        if(req.method === 'POST' && req.originalUrl === '/signup') {
            const { username, password, email } = req.body
            console.log(req.body)
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

    private authCheck(req: Request, res: Response, next: NextFunction): void {
        if (this.unrestrictedRoutes.some((element) => element === req.originalUrl)) {
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

