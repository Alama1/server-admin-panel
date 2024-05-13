import { Router, Request, Response } from 'express'
import { Server } from './Server';
import jwt from "jsonwebtoken";

export class expressRouter {
    private server: Server

    constructor(server: Server) {
        this.server = server;
    }

    createRoutes() {
        const routes = Router()

        //GET
        routes.get('/helloworld', (req: Request, res: Response) => {
    
            res.json({message: "halo"})
            res.status(200)
        })
    
        //POST
        routes.post('/command', this.execCommand.bind(this))
        routes.post('/signup', this.signUp.bind(this))
        routes.post('/login', this.signIn.bind(this))
    
        //PUT
    
        //DELETE
    
        return routes
    }

    async execCommand(req: Request, res: Response) {
        const { command } = req.body
        this.server.app.console.execCommand(command)
        .then((execRes) => {
            res.status(200)
            res.send({ success: true, message: 'Command executed successfully!', commandResponse: execRes })
        })
        .catch((err) => {
            res.status(422)
            res.send({ success: false, message: 'Invalid command'})
        })
    }

    signUp(req: Request, res: Response): void {
        const { email, username, password } = req.body

        this.server.app.database.createNewUser(username, email, password).then((user) => {
            res.status(201)
            res.send({ success: true, message: 'User created successfully!' })
        }).catch((error) => {
            res.status(409)
            if (error.code === 11000) {
                res.send({ success: false, message: 'User with this email already exists!' })
                return
            }
            console.log(error.message)
            res.send({ success: false, message: 'Error crating user!' })
        })
        
    }

    async signIn(req: Request, res: Response): Promise<void> {
        this.server.app.database.confirmPassword(req.body.email, req.body.password)
        .then((response) => {
            if (!response) {
                res.status(401)
                return res.send({ success: false, message: 'Username or password is not correct.'})
            }

            this.server.app.database.getUserByEmail(req.body.email)
            .then(async (userData) => {
                if (!userData) return

                const { username, email, verified, accessLevel } = await userData
                const token = jwt.sign({ username, email, verified, accessLevel }, this.server.app.config.properties.jwt.secret, { expiresIn: '3d' })
                res.status(200)
                res.send({ success: true, message: { token }})
            }).catch((error) => {
                res.status(500)
                res.send({ success: false, message: 'Internal server error.' })
            })
        })
        .catch((error) => {
            res.status(500)
            res.send({ success: false, message: 'Internal server error.' })
        })
        
    }
}
