import { Router, Request, Response } from 'express'
import { Server } from './Server';
import { Error } from 'mongoose'

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
    
        //FUNCTIONS
    
        return routes
    }

    async execCommand(req: Request, res: Response) {
        const { command } = req.body
        const commandResp = await this.server.app.console.execCommand(command)
        res.send({ "message": commandResp })
    }

    async signUp(req: Request, res: Response) {
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
            res.send({ success: false, message: 'Error crating user!' })
        })
        
    }

    async signIn(req: Request, res: Response) {
        const { email, password } = req.body

        const confirmedPassword = await this.server.app.database.confirmPassword(email, password)
        if (confirmedPassword) {
            res.status(200)
            
        } else {
            res.status(401)
            res.send({ success: false, message: 'Username or password is not correct.'})
        }
    }
}

