import express, { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import { expressRouter } from './Router'
import Application from '../Application'
import jwt, {JwtPayload} from "jsonwebtoken";
import cors from 'cors'
import https from 'https'
import fs from 'fs'

dotenv.config()

export class Server {

    private server: Express
    private httpsServer: any
    private readonly port = process.env.PORT || 3000
    public app: Application
    public gustavoIP: string
    public gustavoSecret: string
    private unrestrictedRoutes: Array<string>
    private adminLevelAccess: Array<string>

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
        this.adminLevelAccess = ['/command', '/hamster', '/addReactionGif', '/reactionChance', '/deleteGif']
    }

    

    private configureRoutes(): void {
        const router = new expressRouter(this)
        this.server.use(express.json())
        this.server.use(cors())
        this.server.use(this.logger.bind(this))
        this.server.use(this.authCheck.bind(this))
        this.server.use((req, res, next) => {
            for (const key in req.body) {
              if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
              }
            }
            next();
          });
        this.server.use('/', router.createRoutes())
        console.log('[express]: Routes configured!')
    }

    public start(): void {
        this.server.listen(this.port, () => {
            console.log(`[express] Server started on port ${this.port}!`)
        })
    }

    private logger(req: Request, res: Response, next: NextFunction): void {
        console.log(`[express] New ${req.method} request for the route ${req.originalUrl}`)
        next()
    }

    private authCheck(req: Request, res: Response, next: NextFunction): void {
        interface userPayLoad {
            accessLevel?: string;
            username: string;
            email: string;
            verified: boolean;
        }

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
            if (this.adminLevelAccess.some((element) => element === req.originalUrl)) {
                if ((user as userPayLoad).accessLevel !== 'admin') {
                    return res.status(403).send({ success: false, message: 'User is not an admin.' })
                }
            }
            if (err) {
                res.status(403)
                return res.send({ success: false, message: 'Token verification failed.' })
            }
            next()
        })
    }
}

