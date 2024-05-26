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
        routes.get('/updateToken', this.updateToken.bind(this))
        routes.get('/hamster', this.getHamsterFacts.bind(this))
    
        //POST
        routes.post('/command', this.execCommand.bind(this))
        routes.post('/signup', this.signUp.bind(this))
        routes.post('/login', this.signIn.bind(this))
        routes.post('/hamster', this.addHamsterFact.bind(this))
    
        //PUT
    
        //DELETE
    
        return routes
    }

    private async execCommand(req: Request, res: Response) {
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

    private signUp(req: Request, res: Response): void {
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

    private async signIn(req: Request, res: Response): Promise<void> {
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

    private async updateToken(req: Request, res: Response): Promise<void> {
        const authToken = req.headers.authorization
        if (!authToken) return

        const token = authToken.split(' ')[1]

        const decoded: any = jwt.decode(token);
        if (!decoded || !decoded.exp) {
            res.status(401)
            res.send({ success: false, message: 'Invalid token.' })
            return
        }

        if (this.isTokenExpiringSoon(token)) {
            delete decoded.exp
            const newToken = jwt.sign(decoded, this.server.app.config.properties.jwt.secret, { expiresIn: '7d' });
            res.send({ success: true, message: { token: newToken } });
            return 
        } else {
            res.status(200)
            res.send({ success: false, message: 'Only tokens with less than 1 day lifetime can be extended.'})
        }
    }

    async getHamsterFacts(req: Request, res: Response): Promise<void> {
        this.server.app.database.get5HamsterFacts().then((response) => {
            res.status(200)
            res.send({ success: true, message: response })
        }).catch((e) => {
            res.status(500)
            res.send({ success: false, message: [{title: 'Something went wrong, pls reload the page', description: 'Oops'}]})
        })
    }

    async addHamsterFact(req: Request, res: Response): Promise<void> {
        const { title, description } = req.body
        this.server.app.database.createHamsterFact(title, description).then((response) => {
            res.status(201)
            res.send({ success: true, message: 'Fact created successfully!' })
        }).catch((e) => {
            res.status(500)
            res.send({ success: false, message: 'Failed to create a hamster fact.' })
        })
    }

    isTokenExpiringSoon(token: string): Boolean {
        try {
            const decoded: any = jwt.decode(token)

            if (!decoded || !decoded.exp) return false

            const currentTimestamp = Math.floor(Date.now() / 1000);
            const oneDayInSeconds = 24 * 60 * 60;
            return (decoded.exp - currentTimestamp) < oneDayInSeconds;
        } catch (e) {
            return false
        }
    }
}
