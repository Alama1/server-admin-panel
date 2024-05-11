import { Router, Request, Response } from 'express'
import { Server } from './Server';

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
        routes.post('/user', this.createUser.bind(this))
    
        //PUT
    
        //DELETE
    
        //FUNCTIONS
    
        return routes
    }
    async createUser(req: Request, res: Response) {
        const {username, email, avatar} = req.body
        console.log(username)
        console.log(email)
        console.log(avatar)
        const createdUser = await this.server.app.database.createNewUser(username, email, avatar)
        res.send(createdUser)
    }
}

